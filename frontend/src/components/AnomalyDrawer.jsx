import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export default function AnomalyDrawer({ isOpen, onClose, anomalyData, onResolve }) {
  const [auditNote, setAuditNote] = useState('');

  if (!anomalyData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 w-full max-w-2xl h-full bg-obsidian-900 border-l border-slateBorder shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slateBorder bg-obsidian-800">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mr-4">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 font-sans">Anomaly Resolution Required</h2>
                  <p className="text-sm text-slate-400 font-mono mt-0.5">{anomalyData.id}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100 transition-colors rounded-lg hover:bg-obsidian-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Conflict Context */}
              <div className="bg-obsidian-800 border border-slateBorder rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />
                  Conflict Analysis
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Current Document */}
                  <div className="p-4 rounded-lg bg-obsidian-900 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
                    <div className="text-xs text-rose-400 font-semibold mb-3 uppercase tracking-wider">Current Ingestion</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Vendor</div>
                        <div className="text-sm font-medium">{anomalyData.vendor}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Amount</div>
                        <div className="text-lg font-mono tabular-nums text-rose-400">₹{anomalyData.amount?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Date Extracted</div>
                        <div className="text-sm font-mono tabular-nums text-slate-300">2026-08-22</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Historical Ledger */}
                  <div className="p-4 rounded-lg bg-obsidian-900 border border-slateBorder relative">
                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-obsidian-800 rounded-full border border-slateBorder flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </div>
                    <div className="text-xs text-emerald-400 font-semibold mb-3 uppercase tracking-wider">Historical Match</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Vendor</div>
                        <div className="text-sm font-medium">{anomalyData.vendor}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Amount</div>
                        <div className="text-lg font-mono tabular-nums text-emerald-400">₹{anomalyData.amount?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Date Posted</div>
                        <div className="text-sm font-mono tabular-nums text-slate-300">2026-08-15</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Trail Note */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Immutable Audit Note</label>
                <textarea
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  placeholder="Provide justification for overriding or rejecting..."
                  className="w-full bg-obsidian-800 border border-slateBorder rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-all resize-none h-24"
                />
              </div>

            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-slateBorder bg-obsidian-800 grid grid-cols-2 gap-3">
              <button 
                onClick={() => onResolve('reject', auditNote)}
                className="w-full flex justify-center items-center py-2.5 px-4 bg-obsidian-900 border border-rose-500/50 hover:bg-rose-500/10 text-rose-400 rounded-lg text-sm font-medium transition-colors"
              >
                Reject & Blacklist
              </button>
              <button 
                onClick={() => onResolve('override', auditNote)}
                className="w-full flex justify-center items-center py-2.5 px-4 bg-gold-500 hover:bg-gold-400 text-obsidian-900 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(246,200,36,0.3)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Override & Force Commit
                <kbd className="ml-2 text-[10px] bg-black/20 px-1.5 py-0.5 rounded border border-black/10 font-mono hidden sm:inline-block">↵ Enter</kbd>
              </button>
              <button 
                onClick={() => onResolve('alert', auditNote)}
                className="col-span-2 w-full flex justify-center items-center py-2.5 px-4 bg-transparent border border-slateBorder hover:bg-obsidian-700 text-slate-300 rounded-lg text-sm font-medium transition-colors mt-1"
              >
                <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />
                Dispatch Security Alert
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
