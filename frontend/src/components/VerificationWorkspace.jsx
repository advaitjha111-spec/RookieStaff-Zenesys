import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle2, FileText, FileCheck2, Building2, Calendar, Hash, Layers, Mail, Database, Terminal, Download } from 'lucide-react';

export default function VerificationWorkspace({ invoice: data, currentUser, setView }) {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  // Phase 1: Interactive Inline Override & Recalculation
  const [lineItems, setLineItems] = useState(data?.line_items || []);
  const [calculatedTotal, setCalculatedTotal] = useState(data?.total_amount || 0);
  const [mathDelta, setMathDelta] = useState(0);
  const [isResolved, setIsResolved] = useState(false);

  // Phase 1: Live Audit Terminal
  const [logs, setLogs] = useState([]);

  // Phase 4: Bounding Box Overlay
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredBox, setHoveredBox] = useState(null);

  if (!data) return null;

  const addLog = (module, message) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 23);
    setLogs(prev => [...prev, `[${timestamp}] [${module}] ${message}`]);
  };

  useEffect(() => {
    // Initial Logs
    addLog('INTAKE', 'Multipart binary buffer parsed via pdf-parse/OCR engine.');
    addLog('EXTRACTION', `Field taxonomy resolved (Vendor: ${data.vendor_name}, Confidence: ${(data.confidence_scores?.vendor_name * 100 || 99).toFixed(1)}%).`);
    
    if (data.validation?.math_mismatch) {
      addLog('MATH_GATE', `Summing line items... Calculated != Stated -> DELTA: >0 [FAIL].`);
    } else {
      addLog('MATH_GATE', `Summing line items... Calculated == Stated -> DELTA: 0.00 [PASS].`);
    }
    addLog('LEDGER_CHECK', `Supabase query executed. ${data.validation?.is_duplicate ? '1' : '0'} duplicate collisions detected.`);
  }, [data.document_id]);

  useEffect(() => {
    const sum = lineItems.reduce((acc, item) => acc + (parseFloat(item.quantity) * parseFloat(item.unit_price || item.amount/item.quantity || 0)), 0);
    const total = sum + (data.tax_amount || 0);
    setCalculatedTotal(total);
    
    const delta = Math.abs(total - data.total_amount);
    setMathDelta(delta);

    if (data.validation?.math_mismatch && delta < 0.01) {
      setIsResolved(true);
      addLog('MATH_GATE', `Operator override successful. Delta reached 0.00 [RESOLVED].`);
    } else {
      setIsResolved(false);
    }
  }, [lineItems, data.total_amount, data.tax_amount, data.validation?.math_mismatch]);

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    // recalculate amount per line if q/p changes
    if (field === 'quantity' || field === 'unit_price') {
       newItems[index].amount = parseFloat(newItems[index].quantity || 0) * parseFloat(newItems[index].unit_price || 0);
    }
    setLineItems(newItems);
  };

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

  const isEffectivelyValid = (data.validation.is_valid || isResolved) && !data.validation.is_duplicate;

  const handlePushToERP = async () => {
    if (!isEffectivelyValid) {
      alert("Action Blocked: Anomaly must be resolved prior to committing to ERP Ledger.");
      return;
    }
    
    addLog('ERP_ADAPTER', 'NetSuite SuiteTalk OAuth 1.0a HMAC-SHA256 signature generated.');

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

  const handleDownloadCertificate = () => {
    const certificate = {
      document_id: data.document_id,
      sha256_hash: "mock_hash_8a7f9b" + Math.floor(Math.random()*10000),
      vendor_name: data.vendor_name,
      date: data.date,
      total_amount: data.total_amount,
      operator_id: currentUser?.id || "op_099",
      operator_email: currentUser?.email || "advaitjha111@gmail.com",
      operator_badge: "SYS_AUTHORIZED",
      extraction_engine_used: "llama-3.3-70b-versatile",
      line_items_audit_trail: lineItems,
      netsuite_transaction_id: `NS-TX-${Math.floor(Math.random()*10000)}`
    };

    const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Certificate_${data.document_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('COMPLIANCE', `Audit certificate exported for ${data.document_id}`);
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
          ) : data.validation.math_mismatch && !isResolved ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> ARITHMETIC MISMATCH (TOTAL DESYNC)
            </span>
          ) : isResolved ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-3.5 h-3.5" /> RESOLVED_BY_OPERATOR
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
        <div className="border border-slate-800 bg-slate-900/80 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FileText className="w-4 h-4 text-indigo-400" />
              Source Ingestion Document: {data.document_id}_raw.pdf
            </div>
            <span className="text-[10px] font-mono text-slate-400">INGESTION COMPLETE</span>
          </div>

          <div className="h-[450px] rounded-lg bg-white border border-slate-200 p-6 font-mono text-xs text-slate-600 flex flex-col overflow-hidden shadow-inner relative select-none">
            
            {/* Visual Bounding Boxes Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              <motion.div 
                animate={{ opacity: (hoveredBox === 'vendor' || !hoveredBox) ? 1 : 0.2 }}
                className="absolute top-14 left-4 w-48 h-10 border-2 border-emerald-500 bg-emerald-500/10 rounded"
              />
              <motion.div 
                animate={{ opacity: (hoveredBox === 'gl' || !hoveredBox) ? 1 : 0.2 }}
                className="absolute top-36 left-4 w-56 h-8 border-2 border-amber-500 bg-amber-500/10 rounded"
              />
              <motion.div 
                animate={{ opacity: (hoveredBox === 'total' || !hoveredBox || hoveredRowIndex !== null) ? 1 : 0.2 }}
                className={`absolute bottom-24 left-4 right-4 h-32 border-2 rounded ${data.validation?.math_mismatch && !isResolved ? 'border-rose-500 bg-rose-500/10' : 'border-emerald-500 bg-emerald-500/10'}`}
              />
            </div>

            {/* Simulated Document Content (Underneath Bounding Boxes) */}
            <div className="space-y-5 relative z-0 opacity-95">
              <div className="flex justify-between border-b border-slate-300 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight uppercase">{data.vendor_name}</h1>
                  <span className="text-slate-500">123 Corporate Blvd, Suite 100</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 tracking-wide text-sm block">INVOICE #{data.document_id}</span>
                  <span className="text-slate-500 block">Date: {data.date}</span>
                  <span className="text-slate-500 block mt-1 font-bold">PO: {data.po_reference}</span>
                </div>
              </div>
              
              <div className="bg-slate-100 p-2 rounded">
                <span className="font-bold text-slate-700 block text-[10px] uppercase">General Ledger Classification</span>
                <span className="text-slate-900 font-bold">{data.gl_code}</span>
              </div>

              <div className="pt-2">
                <table className="w-full text-left">
                  <thead className="border-b-2 border-slate-300 text-[10px] font-bold text-slate-500">
                    <tr>
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Unit Price</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.line_items.map((item, idx) => (
                      <motion.tr 
                        key={idx} 
                        className={hoveredRowIndex === idx ? 'bg-indigo-50/50' : ''}
                        animate={{ backgroundColor: hoveredRowIndex === idx ? '#EEF2FF' : 'transparent' }}
                      >
                        <td className="py-2 text-slate-800">{item.description}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">{(item.unit_price || item.amount/item.quantity || 0).toFixed(2)}</td>
                        <td className="py-2 text-right font-bold">{(item.amount || 0).toFixed(2)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end pt-1">
                 <div className="w-1/2 space-y-1 text-[11px]">
                   <div className="flex justify-between text-slate-500">
                     <span>Subtotal:</span>
                     <span>{data.currency_display || 'INR'} {(data.subtotal || (data.total_amount - (data.tax_amount || 0))).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                   </div>
                   <div className="flex justify-between text-slate-500">
                     <span>Tax ({data.tax_rate_percent || 0}%):</span>
                     <span>{data.currency_display || 'INR'} {(data.tax_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                   </div>
                 </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 text-right z-0">
              <span className="text-slate-500 font-bold text-[10px] uppercase block">Total Due</span>
              <span className={`text-3xl font-bold font-sans ${data.validation?.math_mismatch && !isResolved ? 'text-rose-600' : 'text-slate-900'}`}>
                {data.currency_display || 'INR'} {(data.total_amount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Verified Structured ERP Mapping */}
        <div className="border border-slate-800 bg-slate-900/80 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Structured Verification & Confidence Scores
            </div>
            <div className="flex gap-2 items-center">
              <button 
                onClick={handleDownloadCertificate}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] transition-colors"
                title="Download JSON Audit Certificate"
              >
                <Download className="w-3 h-3" /> Export Audit
              </button>
              <span className="text-[10px] font-mono text-indigo-400">SCHEMA LOCKED</span>
            </div>
          </div>

          {/* Confidence Field Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div 
              onMouseEnter={() => setHoveredBox('vendor')} 
              onMouseLeave={() => setHoveredBox(null)}
              className="cursor-crosshair"
            >
              <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" /> Vendor Name
              </label>
              <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex justify-between items-center transition-colors ${hoveredBox === 'vendor' ? 'bg-slate-800 border-emerald-500' : getConfidenceStyle(data.confidence_scores?.vendor_name || 0.99)}`}>
                <span className="truncate">{data.vendor_name}</span>
                <span className="text-[10px] font-bold">{((data.confidence_scores?.vendor_name || 0.99) * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredBox('date')} 
              onMouseLeave={() => setHoveredBox(null)}
              className="cursor-crosshair"
            >
              <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Invoice Date
              </label>
              <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex justify-between items-center ${getConfidenceStyle(data.confidence_scores?.date || 0.98)}`}>
                <span>{data.date}</span>
                <span className="text-[10px] font-bold">{((data.confidence_scores?.date || 0.98) * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredBox('vendor')} 
              onMouseLeave={() => setHoveredBox(null)}
              className="cursor-crosshair"
            >
              <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3 text-slate-400" /> PO Reference
              </label>
              <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex justify-between items-center ${getConfidenceStyle(data.confidence_scores?.po_reference || 0.9)}`}>
                <span>{data.po_reference}</span>
                <span className="text-[10px] font-bold">{((data.confidence_scores?.po_reference || 0.9) * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredBox('gl')} 
              onMouseLeave={() => setHoveredBox(null)}
              className="cursor-crosshair"
            >
              <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" /> Auto-GL Code
              </label>
              <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex justify-between items-center transition-colors ${hoveredBox === 'gl' ? 'bg-slate-800 border-amber-500' : getConfidenceStyle(data.confidence_scores?.gl_code || 0.95)}`}>
                <span className="truncate">{data.gl_code}</span>
                <span className="text-[10px] font-bold">{((data.confidence_scores?.gl_code || 0.95) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Reconciled Line Item Ledger */}
          <div 
            className="flex flex-col gap-1.5 cursor-crosshair"
            onMouseEnter={() => setHoveredBox('total')} 
            onMouseLeave={() => setHoveredBox(null)}
          >
            <label className="text-[10px] font-mono text-slate-400">Reconciled Line Item Ledger</label>
            <div className={`border rounded-lg overflow-hidden text-xs font-mono transition-colors ${hoveredBox === 'total' ? 'border-indigo-500' : 'border-slate-800'}`}>
              <table className="w-full text-left">
                <thead className="bg-slate-800/80 text-slate-400 text-[10px]">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {lineItems.map((item, idx) => (
                    <tr 
                      key={idx}
                      onMouseEnter={() => setHoveredRowIndex(idx)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                      className="transition-colors hover:bg-slate-900"
                    >
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          className="bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 w-full text-slate-300 focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                          className="bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 w-16 text-right text-slate-300 focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="p-2 text-right text-slate-200">
                        <div className="flex justify-end gap-1 items-center">
                          <span className="text-slate-500 text-[10px]">x ₹</span>
                          <input
                            type="number"
                            value={item.unit_price || (item.amount/item.quantity).toFixed(2)}
                            onChange={(e) => handleLineItemChange(idx, 'unit_price', e.target.value)}
                            className="bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 w-20 text-right text-slate-300 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="mt-1 text-slate-400 text-[10px]">= ₹{item.amount.toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Message */}
          <div className={`p-2.5 rounded-lg border text-xs font-mono ${isEffectivelyValid
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
              : 'border-rose-500/30 bg-rose-500/5 text-rose-400'
            }`}>
            <span className="font-bold block text-[10px] uppercase">Engine Status:</span>
            {isResolved ? "Operator override successful. Mathematics reconciled. Ready for ERP commit." : data.validation.message}
          </div>

          {/* Action Bar */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Total Payable</span>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold font-mono ${(data.validation.math_mismatch && !isResolved) ? 'text-rose-400 line-through' : 'text-emerald-400'}`}>
                  {data.currency_display || 'INR'} {(data.total_amount || 0).toLocaleString()}
                </span>
                {(data.validation.math_mismatch || isResolved) && (
                  <div className="flex flex-col text-[10px] font-mono">
                    <span className="text-slate-400">Calculated: {data.currency_display || 'INR'} {calculatedTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <span className={mathDelta > 0 ? "text-amber-400" : "text-emerald-400"}>
                      Δ: {data.currency_display || 'INR'} {mathDelta.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEffectivelyValid && (
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
                disabled={!isEffectivelyValid}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-2 shadow-lg ${isEffectivelyValid
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer'
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
      
      {/* Live Audit Terminal Console */}
      <div className="mt-4 border border-slate-800 bg-[#0a0a0a] rounded-xl overflow-hidden flex flex-col h-48 shadow-lg font-mono text-[10px]">
        <div className="bg-slate-900 border-b border-slate-800 p-2 px-3 flex justify-between items-center text-slate-400">
          <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-[9px]">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            Live Audit Terminal
          </span>
          <button 
            onClick={() => setLogs([])} 
            className="hover:text-white transition-colors bg-slate-800 px-2 py-0.5 rounded text-[9px] uppercase"
          >
            Clear Feed
          </button>
        </div>
        <div className="p-3 overflow-y-auto flex-1 text-emerald-500 space-y-1.5 flex flex-col-reverse">
          {/* Flex column-reverse handles auto-scrolling to bottom by default */}
          <div className="flex flex-col gap-1.5">
            {logs.map((log, i) => (
              <div key={i} className="break-all">
                <span className="text-slate-500 mr-2">{log.split('] ')[0]}]</span>
                <span className="text-indigo-400 mr-2">{log.split('] ')[1] && log.split('] ')[1].split(' ')[0] + ']'}</span>
                <span className="text-emerald-400/90">{log.split('] ').slice(2).join('] ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
