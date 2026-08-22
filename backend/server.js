import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import OpenAI from 'openai';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import path from 'path';
import { fileURLToPath } from 'url';
import { EXTRACT_SCHEMA } from './extractSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 1. Ingestion & Extraction Endpoint
app.post('/api/extract', upload.single('invoice'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let extractionContent = "";

    if (req.file.mimetype === 'application/pdf') {
      const parsedPdf = await pdf(req.file.buffer);
      extractionContent = `Parse this raw invoice text and extract all required financial fields:\n\n${parsedPdf.text}`;
    } else {
      const base64Image = req.file.buffer.toString('base64');
      extractionContent = [
        { type: "text", text: "Parse this invoice image and extract all required financial fields according to the schema." },
        { type: "image_url", image_url: { url: `data:${req.file.mimetype};base64,${base64Image}` } }
      ];
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Verix, an enterprise financial document integrity engine. Extract all invoice fields accurately and estimate confidence scores per field."
        },
        {
          role: "user",
          content: extractionContent
        }
      ],
      response_format: EXTRACT_SCHEMA
    });

    const extractedData = JSON.parse(completion.choices[0].message.content);

    // Deterministic arithmetic validation
    const calculatedSum = extractedData.line_items.reduce(
      (sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 
      0
    );
    const statedTotal = Number(extractedData.total_amount);
    const mathMismatch = Math.abs(calculatedSum - statedTotal) > 0.01;

    // Check duplicate in Supabase
    const { data: matchedRecords, error: dbError } = await supabase
      .from('invoices')
      .select('id, document_id, vendor_name, total_amount')
      .ilike('vendor_name', extractedData.vendor_name)
      .eq('total_amount', statedTotal);

    if (dbError) console.error("Supabase query error:", dbError);

    const isDuplicate = Boolean(matchedRecords && matchedRecords.length > 0);

    const finalPayload = {
      document_id: extractedData.po_reference || `DOC-${Date.now().toString().slice(-4)}`,
      ...extractedData,
      validation: {
        is_valid: !mathMismatch && !isDuplicate,
        is_duplicate: isDuplicate,
        math_mismatch: mathMismatch,
        calculated_sum: calculatedSum,
        message: isDuplicate 
          ? `Duplicate record detected in Supabase (Found record for ${extractedData.vendor_name} with total ₹${statedTotal.toFixed(2)}).` 
          : mathMismatch 
            ? `Line item sum (₹${calculatedSum.toFixed(2)}) does not match claimed total (₹${statedTotal.toFixed(2)}).` 
            : "Reconciled against Supabase ledger and verified."
      }
    };

    return res.json(finalPayload);
  } catch (error) {
    console.error("Extraction error:", error);
    return res.status(500).json({ error: "Failed to extract invoice data", details: error.message });
  }
});

// 2. ERP Commit Endpoint
app.post('/api/push-erp', async (req, res) => {
  try {
    const { invoice } = req.body;
    if (!invoice || !invoice.validation?.is_valid) {
      return res.status(400).json({ error: "Cannot commit flagged record to ERP." });
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert([
        {
          document_id: invoice.document_id,
          vendor_name: invoice.vendor_name,
          date: invoice.date,
          total_amount: invoice.total_amount,
          gl_code: invoice.gl_code,
          status: 'COMMITTED'
        }
      ])
      .select();

    if (error) throw error;

    return res.json({ success: true, message: "Committed to ERP ledger and persisted in Supabase.", record: data[0] });
  } catch (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: "Failed to persist to Supabase ledger", details: error.message });
  }
});

// 3. Email Alert Endpoint (Resend)
app.post('/api/send-alert', async (req, res) => {
  try {
    const { invoice, recipientEmail } = req.body;

    if (!invoice) {
      return res.status(400).json({ error: "Invoice data is required." });
    }

    const isDuplicate = invoice.validation?.is_duplicate;
    const alertSubject = `[VERIX ALERT] ${isDuplicate ? 'DUPLICATE INVOICE BLOCKED' : 'ARITHMETIC MISMATCH DETECTED'}: #${invoice.document_id}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0B0F17; color: #F8FAFC; padding: 24px; border-radius: 8px;">
        <h2 style="color: #F43F5E; margin: 0; font-size: 18px; font-weight: bold;">🚨 Financial Anomaly Intercepted by Verix Engine</h2>
        <p style="color: #94A3B8; font-size: 12px; margin: 4px 0 16px 0;">Zero-Hallucination Deterministic Validation Layer</p>
        <p><strong>Invoice ID:</strong> ${invoice.document_id}</p>
        <p><strong>Vendor:</strong> ${invoice.vendor_name}</p>
        <p><strong>Claimed Total:</strong> ₹${Number(invoice.total_amount).toFixed(2)}</p>
        <p><strong>Verdict:</strong> ${invoice.validation?.message || 'Flagged anomaly.'}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Verix Security <onboarding@resend.dev>',
      to: recipientEmail || 'delivered@resend.dev',
      subject: alertSubject,
      html: htmlContent,
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ success: true, id: data.id, message: "Alert email dispatched via Resend." });
  } catch (error) {
    console.error("Alert dispatch failed:", error);
    return res.status(500).json({ error: "Failed to dispatch alert", details: error.message });
  }
});

// 4. Serve Frontend Static Build Assets
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// 5. Catch-All Route to support client-side SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n=====================================================`);
  console.log(`🚀 Verix Monolith Server Live on http://localhost:${PORT}`);
  console.log(`=====================================================\n`);
});