# ⚡ Verix — Deterministic Financial Document Integrity Engine

> A deterministic AI firewall for enterprise ERP systems. Verix eliminates LLM math hallucinations, intercepts duplicate invoice fraud in real time, audits field-level confidence, and ensures zero unverified financial data enters your General Ledger.

Built by **Team RookieStaff** for the **Zenesys Hackathon** (Comet / Suitepedia).

---

## 🎯 The Problem

Standard document extraction tools pass raw OCR text to an LLM and commit the resulting JSON straight to ERP databases. This creates two critical enterprise vulnerabilities:

1. **Silent arithmetic hallucination** — LLMs frequently miscalculate line-item sums, discounts, and tax totals without flagging errors.
2. **Duplicate payment exposure** — generative models have no transactional memory, so duplicate invoices can slip through and get approved twice.

**Verix's approach:** the LLM is restricted strictly to semantic layout extraction under a rigid schema. All arithmetic balancing (`sum(qty × price) == total`), duplicate signature detection, and GL code categorization are enforced deterministically in the backend — never left to the model.

---

## 🏗️ Ingestion Pipeline
Raw File (PDF / PNG / JPG)
│
▼
Stage 1 — Buffer Intake & OCR
(Multer in-memory streaming + pdf-parse layout extraction)
│
▼
Stage 2 — Schema-Locked Semantic Parse
(OpenAI gpt-4o-mini, strict JSON Schema output)
│
▼
Stage 3 — Deterministic Financial Firewall
├─ Server Arithmetic Gate: Node.js recalculates line-item sum vs. claimed total (Δ = 0.00)
├─ PostgreSQL Signature Check: Supabase verifies (vendor_name, total_amount, date)
└─ Allowlisted Chart-of-Accounts: auto GL tagging (GL-500, GL-400, GL-300, ...)
│
├──────────────────────────┐
▼ ▼
✅ AUDIT VERIFIED 🚨 ANOMALY INTERCEPTED
├─ Confidence borders ├─ ERP commit blocked
├─ One-click ERP commit ├─ Incident logged to stream
└─ Immutable row → Supabase └─ Alert email fired via Resend


---

## ✨ Key Features

- **Command Center Dashboard** — operator UI with a live incident stream, real-time KPI metrics, and telemetry charts.
- **Split-Screen Verification Workspace** — raw source document side-by-side with extracted, schema-locked fields.
- **Field-Level Confidence Auditing** — dynamic borders per field showing extraction certainty:
  - 🟢 High confidence (≥ 90%) — emerald border
  - 🟡 Medium confidence (70–89%) — amber border
  - 🔴 Low confidence / anomaly (< 70%) — pulsing rose border
- **Duplicate Invoice Interceptor** — checks Supabase history before approval to block repeat billings.
- **Live Alert Dispatch** — Resend API integration notifies finance controllers when fraud or a math mismatch is caught.
- **Pitch-Ready Scenario Switcher** — built-in fixture toggles (**Clean**, **Duplicate Trap**, **Math Error**) for a fail-safe live demo.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, Motion (Framer Motion), Recharts, Lucide Icons, Canvas Confetti |
| Backend | Node.js (ES Modules), Express.js, Multer, pdf-parse |
| AI Extraction | OpenAI `gpt-4o-mini` (strict structured outputs / JSON Schema) |
| Database & Ledger | Supabase (PostgreSQL) |
| Notifications | Resend API |

---

## 🚀 Quickstart

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [OpenAI API key](https://platform.openai.com/api-keys)
- [Supabase](https://supabase.com/) account
- [Resend](https://resend.com/) account & API key

### 2. Database Setup (Supabase)

In **Supabase Dashboard → SQL Editor**, run:

```sql
-- Invoices ledger
create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  document_id text not null,
  vendor_name text not null,
  date text not null,
  total_amount numeric not null,
  gl_code text,
  status text default 'COMMITTED',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Immutable audit trail
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  document_id text not null,
  action text not null,
  actor_name text default 'John Doe',
  actor_role text default 'Lead Finance Controller',
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed record to demonstrate duplicate interception
insert into invoices (document_id, vendor_name, date, total_amount, gl_code)
values ('INV-9982', 'TechSupply Co', '2026-08-21', 1200.00, 'GL-500: Hardware');
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:


Start the server:

```bash
node server.js
```

Runs on `http://localhost:5000`.

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

---

## 📡 API Reference

### `POST /api/extract`
Accepts a raw invoice file and runs it through the two-stage parsing and validation engine.

**Payload:** `multipart/form-data`, field name `invoice` (PDF, PNG, or JPG).

**Response:**

```json
{
  "document_id": "INV-9982",
  "vendor_name": "TechSupply Co",
  "date": "2026-08-21",
  "po_reference": "PO-7741",
  "gl_code": "GL-500: Hardware",
  "line_items": [
    { "description": "Server Rack 42U", "quantity": 1, "unit_price": 800, "amount": 800 },
    { "description": "Cat6 Patch Cables (Pack of 10)", "quantity": 2, "unit_price": 200, "amount": 400 }
  ],
  "total_amount": 1200.00,
  "confidence_scores": {
    "vendor_name": 0.98,
    "date": 0.95,
    "po_reference": 0.92,
    "gl_code": 0.94
  },
  "validation": {
    "is_valid": true,
    "is_duplicate": false,
    "math_mismatch": false,
    "calculated_sum": 1200.00,
    "message": "Reconciled against Supabase ledger and verified."
  }
}
```

### `POST /api/push-erp`
Commits an approved, verified transaction to Supabase. Returns `400 Bad Request` if the payload has unresolved validation flags.

### `POST /api/send-alert`
Dispatches an emergency incident report to finance controllers via Resend.

---

## 🎭 Live Demo Script (3 Minutes)

**The Hook (0:00–0:30)**
> "Every enterprise uses OCR and LLMs to read invoices, but generative AI hallucinates calculations and blindly approves duplicate submissions. Verix is the deterministic firewall that protects corporate balance sheets."

**The Clean Flow (0:30–1:15)**
- Drop a clean invoice, or select the **Clean** scenario.
- Highlight the split-screen view, auto-GL tag, and green confidence borders.
- Click **Commit to ERP Ledger** to show the validated commit landing in Supabase.

**The Interception (1:15–2:30)**
- Select **Duplicate Trap** (or upload a duplicate). Show the red banner — the backend queries Supabase, catches the matching signature, and disables the commit button.
- Select **Math Error**. Show the deterministic engine catching the line-item sum discrepancy and unlocking the **Dispatch Alert** button.
- Click **Dispatch Email Alert** and show it arrive via Resend.

**Close (2:30–3:00)**
> "Verix doesn't just read documents — it guarantees financial correctness before bad data touches your ERP."

---

## 📂 File Structure
├── backend/
│ ├── extractSchema.js # Strict JSON schema for OpenAI structured outputs
│ ├── server.js # Express server, validation logic, Supabase & Resend integration
│ ├── package.json
│ └── .env # API credentials (git-ignored)
│
├── frontend/
│ ├── src/
│ │ ├── mockPayload.json # Pitch fixtures (Clean, Duplicate, Math Desync)
│ │ ├── App.jsx # Command Center, ingestion pipeline & operator workspace
│ │ ├── index.css # Tailwind setup and font imports
│ │ └── main.jsx
│ ├── tailwind.config.js
│ ├── postcss.config.js
│ └── package.json
│
├── .gitignore # Blocks .env and node_modules
└── README.md