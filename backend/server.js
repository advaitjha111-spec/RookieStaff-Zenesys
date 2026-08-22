import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import OpenAI from 'openai';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { EXTRACT_SCHEMA } from './extractSchema.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Supabase Client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: Record an immutable audit entry
async function logAuditEvent(documentId, action, details, actorName = 'John Doe', actorRole = 'Lead Finance Controller') {
  try {
    await supabase.from('audit_logs').insert([
      {
        document_id: documentId,
        action,
        actor_name: actorName,
        actor_role: actorRole,
        details
      }
    ]);
  } catch (err) {
    console.error("Audit log recording error:", err);
  }
}

// Main Ingestion Endpoint: POST /api/extract
app.post('/api/extract', upload.single('invoice'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        let extractionContent = "";

        // 1. Ingest PDF vs Image
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

        // 2. OpenAI Structured Extraction
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are Verix, an enterprise financial document extraction engine. Extract all invoice fields accurately and estimate confidence scores per field."
                },
                {
                    role: "user",
                    content: extractionContent
                }
            ],
            response_format: EXTRACT_SCHEMA
        });

        const extractedData = JSON.parse(completion.choices[0].message.content);

        // 3. Deterministic Arithmetic Validation (Node.js engine)
        const calculatedSum = extractedData.line_items.reduce(
            (sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)),
            0
        );
        const statedTotal = Number(extractedData.total_amount);
        const mathMismatch = Math.abs(calculatedSum - statedTotal) > 0.01;

        // 4. Live Supabase Query for Duplicate Check
        const { data: matchedRecords, error: dbError } = await supabase
            .from('invoices')
            .select('id, document_id, vendor_name, total_amount')
            .ilike('vendor_name', extractedData.vendor_name)
            .eq('total_amount', statedTotal);

        if (dbError) console.error("Supabase query error:", dbError);

        const isDuplicate = Boolean(matchedRecords && matchedRecords.length > 0);

        // 5. Final Reconciled ERP Payload
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

        await logAuditEvent(
            finalPayload.document_id,
            finalPayload.validation.is_valid ? 'INGESTED_VERIFIED' : 'INGESTED_ANOMALY_FLAGGED',
            `Extracted with verdict: ${finalPayload.validation.message}`
        );

        return res.json(finalPayload);
    } catch (error) {
        console.error("Extraction error:", error);
        return res.status(500).json({ error: "Failed to extract invoice data", details: error.message });
    }
});

// Commit to ERP & Insert into Supabase Table
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

        await logAuditEvent(
            invoice.document_id,
            'ERP_COMMITTED',
            `Pushed transaction of ₹${invoice.total_amount} to ERP Ledger`
        );

        return res.json({ success: true, message: "Committed to ERP ledger and persisted in Supabase.", record: data[0] });
    } catch (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: "Failed to persist to Supabase ledger", details: error.message });
    }
});

// POST /api/send-alert
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
        <div style="border-bottom: 1px solid #1E293B; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #F43F5E; margin: 0; font-size: 18px; font-weight: bold;">
            🚨 Financial Anomaly Intercepted by Verix Engine
          </h2>
          <p style="color: #94A3B8; font-size: 12px; margin: 4px 0 0 0;">Zero-Hallucination Deterministic Validation Layer</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #64748B; width: 140px;">Invoice ID:</td>
            <td style="padding: 8px 0; color: #F8FAFC; font-weight: bold;">${invoice.document_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;">Vendor:</td>
            <td style="padding: 8px 0; color: #F8FAFC;">${invoice.vendor_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;">Date:</td>
            <td style="padding: 8px 0; color: #F8FAFC;">${invoice.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;">Claimed Amount:</td>
            <td style="padding: 8px 0; color: #F43F5E; font-weight: bold;">₹${Number(invoice.total_amount).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;">Validation Verdict:</td>
            <td style="padding: 8px 0; color: #FBBF24; font-weight: bold;">${invoice.validation?.message || 'Flagged anomaly.'}</td>
          </tr>
        </table>

        <div style="background-color: #111827; border: 1px solid #1F2937; padding: 12px; border-radius: 6px; font-size: 12px; color: #9CA3AF;">
          <strong>Action Taken:</strong> ERP transmission was blocked. Please inspect and resolve in the Verix Operator Portal.
        </div>
      </div>
    `;

    // Note: If using a free testing tier, Resend requires 'to' to be your registered account email
    const { data, error } = await resend.emails.send({
      from: 'Verix Security <onboarding@resend.dev>',
      to: recipientEmail || 'advaitjha111@gmail.com',
      subject: alertSubject,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return res.status(400).json({ error: error.message });
    }

    await logAuditEvent(
      invoice.document_id,
      'ALERT_DISPATCHED',
      `Security alert emailed to ${recipientEmail || 'advaitjha111@gmail.com'}`
    );

    console.log("Resend alert dispatched successfully:", data.id);
    return res.json({ success: true, id: data.id, message: "Alert email dispatched via Resend." });
  } catch (error) {
    console.error("Alert dispatch failed:", error);
    return res.status(500).json({ error: "Failed to dispatch alert", details: error.message });
  }
});

// 4. GET /api/audit-logs/:docId -> Fetch audit history for UI
app.get('/api/audit-logs/:docId', async (req, res) => {
  const { docId } = req.params;
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('document_id', docId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Verix Backend Engine running on http://localhost:${PORT}`));