import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import OpenAI from 'openai';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { createClient } from '@supabase/supabase-js';
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

        return res.json({ success: true, message: "Committed to ERP ledger and persisted in Supabase.", record: data[0] });
    } catch (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: "Failed to persist to Supabase ledger", details: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Verix Backend Engine running on http://localhost:${PORT}`));