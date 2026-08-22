import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle2, FileText, FileCheck2, Building2, Calendar, Hash, Layers, Mail, Database } from 'lucide-react';

export default function VerificationWorkspace({ invoice: data, currentUser, setView }) {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  if (!data) return null;

  // Confidence Border Styling
  const getConfidenceStyle = (score) => {
    if (score >= 0.90) {
      return "border-emerald-500/70 bg-emerald-500/5 text-emerald-300 focus:border-emerald-400";
    }
    if (score >= 0.70) {
      return "border-amber-500/70 bg-amber-500/5 text-amber-300 focus:border-amber-400";
    }
    return "border-rose-500/80 bg-rose-500/10 text-rose-300 focus:border-rose-400 animate-pulse";
  };

  const handlePushToERP = async () => {
    if (!data.validation.is_valid) {
      alert("Action Blocked: Anomaly must be resolved prior to committing to ERP Ledger.");
      return;
    }

    try {
      await fetch('/api/push-erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice: data }),
      });
      // Optional: Show success alert or navigate
      alert("Successfully pushed to ERP Ledger!");
    } catch (e) {
      console.log("ERP push simulated locally");
    }
  };

  const handleDispatchEmailAlert = async () => {
    setEmailLoading(true);
    setEmailStatus(null);

    try {
      const response = await fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: data,
          recipientEmail: 'advaitjha111@gmail.com'
        }),
      });

      const result = await response.json();
      if (result.success) {
        setEmailStatus({ type: 'success', message: 'Alert delivered to inbox via Resend!' });
        alert("Security Alert Dispatched via Resend!");
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setEmailStatus({ type: 'error', message: err.message || 'Dispatch failed' });
    } finally {
      setEmailLoading(false);
      setTimeout(() => setEmailStatus(null), 4000);
    }
  };

  return (
    <motion.div
      key="workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto space-y-4"
    >
      {/* Incident Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 uppercase">Verification Engine Status:</span>
          {data.validation.is_duplicate ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-bold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" /> DUPLICATE INVOICE DETECTED & BLOCKED
            </span>
          ) : data.validation.math_mismatch ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> ARITHMETIC MISMATCH (TOTAL DESYNC)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED AGAINST LEDGER & AUDIT-READY
            </span>
          )}
        </div>
      </div>

      {/* 50/50 Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Source Document Preview */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FileText className="w-4 h-4 text-indigo-400" />
              Source Ingestion Document: {data.document_id}_raw.pdf
            </div>
            <span className="text-[10px] font-mono text-slate-400">INGESTION COMPLETE</span>
          </div>

          <div className="h-[400px] rounded-lg bg-white border border-slate-200 p-6 font-mono text-xs text-slate-600 flex flex-col justify-between overflow-hidden shadow-inner">
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-200 pb-3">
                <span className="font-bold text-slate-900 tracking-wide text-sm">INVOICE: #{data.document_id}</span>
                <span className="text-slate-500">{data.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] mb-0.5">VENDOR ENTITY</span>
                <span className="font-bold text-slate-800 text-sm">{data.vendor_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] mb-0.5">PURCHASE ORDER</span>
                <span className="text-slate-700">{data.po_reference}</span>
              </div>

              <div className="pt-4">
                <span className="text-slate-400 block text-[10px] mb-2 border-b border-slate-100 pb-1">DOCUMENT LINE ITEMS</span>
                <div className="space-y-2">
                  {data.line_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600 text-xs">
                      <span>{item.quantity}x {item.description}</span>
                      <span className="text-slate-800 font-medium">₹{item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold">TOTAL CLAIMED:</span>
              <span className="text-slate-900 font-bold text-base">₹{data.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right: Verified Structured ERP Mapping */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Structured Verification & Confidence Scores
            </div>
            <span className="text-[10px] font-mono text-indigo-400">SCHEMA LOCKED</span>
          </div>

          {/* Confidence Field Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" /> Vendor Name
              </label>
              <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex justify-between items-center ${getConfidenceStyle(data.confidence_scores.vendor_name)}`}>
                <span className="truncate">{data.vendor_name}</span>
                <span className="text-[10px] font-bold">{(data.confidence_scores.vendor_name * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Invoice Date
              </label>
              <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex justify-between items-center ${getConfidenceStyle(data.confidence_scores.date)}`}>
                <span>{data.date}</span>
                <span className="text-[10px] font-bold">{(data.confidence_scores.date * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3 text-slate-400" /> PO Reference
              </label>
              <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex justify-between items-center ${getConfidenceStyle(data.confidence_scores.po_reference)}`}>
                <span>{data.po_reference}</span>
                <span className="text-[10px] font-bold">{(data.confidence_scores.po_reference * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" /> Auto-GL Code
              </label>
              <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex justify-between items-center ${getConfidenceStyle(data.confidence_scores.gl_code)}`}>
                <span className="truncate">{data.gl_code}</span>
                <span className="text-[10px] font-bold">{(data.confidence_scores.gl_code * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Reconciled Line Item Ledger */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-slate-400">Reconciled Line Item Ledger</label>
            <div className="border border-slate-800 rounded-lg overflow-hidden text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-800/80 text-slate-400 text-[10px]">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {data.line_items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 text-slate-300">{item.description}</td>
                      <td className="p-2 text-right text-slate-400">{item.quantity}</td>
                      <td className="p-2 text-right text-slate-200">₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Message */}
          <div className={`p-2.5 rounded-lg border text-xs font-mono ${data.validation.is_valid
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
              : 'border-rose-500/30 bg-rose-500/5 text-rose-400'
            }`}>
            <span className="font-bold block text-[10px] uppercase">Engine Status:</span>
            {data.validation.message}
          </div>

          {/* Action Bar */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Payable</span>
              <span className={`text-lg font-bold font-mono ${data.validation.math_mismatch ? 'text-rose-400 line-through' : 'text-emerald-400'}`}>
                ₹{data.total_amount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!data.validation.is_valid && (
                <button
                  onClick={handleDispatchEmailAlert}
                  className="px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-mono text-xs transition-all flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {emailLoading ? "Dispatching..." : emailStatus?.message || "Dispatch Email Alert"}
                </button>
              )}

              <button
                onClick={handlePushToERP}
                disabled={!data.validation.is_valid}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-2 shadow-lg ${data.validation.is_valid
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white shadow-emerald-600/20 cursor-pointer'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  }`}
              >
                <Database className="w-4 h-4" />
                Commit to ERP Ledger
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
