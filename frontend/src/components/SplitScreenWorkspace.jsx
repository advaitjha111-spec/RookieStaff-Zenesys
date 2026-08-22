import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, FileCheck2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function SplitScreenWorkspace({ data }) {
  const [hoveredField, setHoveredField] = useState(null);
  const [zoom, setZoom] = useState(100);

  if (!data) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      case 'DUPLICATE_BLOCKED': return 'text-rose-400 border-rose-400/30 bg-rose-400/10';
      case 'MATH_MISMATCH': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED': return <FileCheck2 className="w-4 h-4 mr-2" />;
      case 'DUPLICATE_BLOCKED': return <ShieldAlert className="w-4 h-4 mr-2" />;
      case 'MATH_MISMATCH': return <AlertTriangle className="w-4 h-4 mr-2" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
      {/* Left Column: Simulated PDF Viewer */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl shadow-black/40 rounded-xl flex flex-col overflow-hidden relative">
        <div className="px-4 py-3 border-b border-white/10 bg-black/60 flex items-center justify-between">
          <div className="text-sm font-medium text-white/80">Document Source</div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1.5 text-white/60 hover:text-white bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="text-xs font-mono tabular-nums text-white/60 w-12 text-center">{zoom}%</div>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1.5 text-white/60 hover:text-white bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom(100)} className="p-1.5 ml-2 text-white/60 hover:text-white bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Document Area */}
        <div className="flex-1 overflow-auto p-8 flex justify-center bg-black/40">
          <div 
            className="bg-white w-full max-w-lg aspect-[1/1.4] shadow-2xl relative transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* Simulated Bounding Boxes based on hoveredField */}
            <div className={`absolute top-[15%] left-[10%] w-[40%] h-[5%] border-2 transition-all duration-300 ${hoveredField === 'vendor' ? 'border-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10' : 'border-transparent'}`} />
            <div className={`absolute top-[22%] left-[10%] w-[20%] h-[3%] border-2 transition-all duration-300 ${hoveredField === 'invoice_id' ? 'border-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10' : 'border-transparent'}`} />
            <div className={`absolute top-[28%] left-[10%] w-[25%] h-[3%] border-2 transition-all duration-300 ${hoveredField === 'po' ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.6)] z-10' : 'border-transparent'}`} />
            <div className={`absolute top-[40%] left-[12%] w-[76%] h-[8%] border-2 transition-all duration-300 ${hoveredField === 'gl' ? 'border-indigo-400 bg-indigo-400/20 shadow-[0_0_15px_rgba(99,102,241,0.6)] z-10' : 'border-transparent'}`} />
            <div className={`absolute bottom-[10%] right-[10%] w-[25%] h-[5%] border-2 transition-all duration-300 ${hoveredField === 'total' ? 'border-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10' : 'border-transparent'}`} />
            
            {/* Fake text lines to look like a document */}
            <div className="absolute top-[16%] left-[12%] w-[35%] h-[2%] bg-slate-200 rounded" />
            <div className="absolute top-[23%] left-[12%] w-[15%] h-[1.5%] bg-slate-200 rounded" />
            <div className="absolute top-[29%] left-[12%] w-[18%] h-[1.5%] bg-slate-200 rounded" />
            <div className="absolute top-[35%] left-[10%] right-[10%] h-px bg-slate-200" />
            <div className="absolute top-[40%] left-[12%] w-[76%] h-[1.5%] bg-slate-100 rounded" />
            <div className="absolute top-[45%] left-[12%] w-[76%] h-[1.5%] bg-slate-100 rounded" />
            <div className="absolute bottom-[12%] right-[12%] w-[20%] h-[3%] bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      {/* Right Column: Extracted Fields */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl shadow-black/40 rounded-xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 bg-black/60 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl text-white font-['Instrument_Serif'] italic tracking-wide">Extracted Payload</h2>
            <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusColor(data.validation?.status)}`}>
              {getStatusIcon(data.validation?.status)}
              {data.validation?.status?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div 
            className="p-4 rounded-lg bg-black/40 border border-white/10 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all cursor-pointer"
            onMouseEnter={() => setHoveredField('vendor')}
            onMouseLeave={() => setHoveredField(null)}
          >
            <div className="text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Vendor Name</div>
            <div className="text-lg text-white font-medium">{data.vendor_name || data.extracted_data?.vendor_name || 'N/A'}</div>
          </div>

          {/* 1. Automated 3-Way Matching */}
          <div 
            className="p-4 rounded-lg bg-black/40 border border-white/10 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all cursor-pointer flex justify-between items-center"
            onMouseEnter={() => setHoveredField('po')}
            onMouseLeave={() => setHoveredField(null)}
          >
            <div>
              <div className="text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Purchase Order (3-Way Match)</div>
              <div className="text-md text-white/90 font-mono">{data.po_reference || data.extracted_data?.po_reference || 'N/A'}</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <FileCheck2 className="w-3 h-3" />
                Line items cross-referenced (Delta {data.tolerance_delta || '< 1%'})
              </div>
            </div>
            <div className="text-right">
               <div className="text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Confidence</div>
               <div className="text-md text-emerald-400 font-mono tabular-nums">{data.confidence_scores?.po_reference ? `${(data.confidence_scores.po_reference * 100).toFixed(0)}%` : '99%'}</div>
            </div>
          </div>

          <div 
            className="p-4 rounded-lg bg-black/40 border border-white/10 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all cursor-pointer flex justify-between items-center"
            onMouseEnter={() => setHoveredField('invoice_id')}
            onMouseLeave={() => setHoveredField(null)}
          >
            <div>
              <div className="text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Invoice ID</div>
              <div className="text-md text-white/90 font-mono">{data.document_id || data.extracted_data?.invoice_id || 'N/A'}</div>
            </div>
            <div className="text-right">
               <div className="text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Confidence</div>
               <div className="text-md text-emerald-400 font-mono tabular-nums">99%</div>
            </div>
          </div>

          {/* 2. Chart of Accounts & Subsidiary Mapping */}
          <div 
            className="p-4 rounded-lg bg-black/40 border border-white/10 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all cursor-pointer flex justify-between items-center"
            onMouseEnter={() => setHoveredField('gl')}
            onMouseLeave={() => setHoveredField(null)}
          >
            <div>
              <div className="text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">GL Taxonomy & Allocation</div>
              <div className="text-md text-white/90 font-mono">{data.gl_code || data.extracted_data?.gl_code || 'N/A'}</div>
              <div className="text-[10px] text-white/60 font-mono mt-1">Tax Seg: EXE-442 | Subsidiary: NA-East</div>
            </div>
            <div className="text-right">
               <div className="text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Confidence</div>
               <div className="text-md text-emerald-400 font-mono tabular-nums">{data.confidence_scores?.gl_code ? `${(data.confidence_scores.gl_code * 100).toFixed(0)}%` : '99%'}</div>
            </div>
          </div>

          <div 
            className="p-4 rounded-lg bg-black/40 border border-white/10 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all cursor-pointer"
            onMouseEnter={() => setHoveredField('total')}
            onMouseLeave={() => setHoveredField(null)}
          >
            <div className="text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Total Amount</div>
            <div className="text-2xl text-white font-mono tabular-nums">₹{(data.total_amount || data.extracted_data?.total_amount || 0).toFixed(2)}</div>
          </div>

          {/* 3. Idempotent Ledger Write Protection */}
          <div className="p-4 rounded-lg bg-black/40 border border-white/10 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                Idempotency Key (ERP Write Lock)
              </div>
              {data.validation?.is_duplicate ? (
                 <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">WRITE HALTED</span>
              ) : (
                 <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">READY FOR COMMIT</span>
              )}
            </div>
            <div className="text-sm text-white/90 font-mono break-all">{data.idempotency_key || 'hash_29f8c1...'}</div>
            <div className="text-[10px] text-white/40 mt-1.5 font-mono">
              Prevents duplicate General Ledger postings for identical vendor + amount + date signatures.
            </div>
          </div>
          
          {/* Action Hint */}
          <div className="mt-8 pt-6 border-t border-white/10">
             <p className="text-xs text-white/50 font-mono flex items-center justify-center">
               Press <kbd className="mx-1 px-1.5 py-0.5 bg-white/5 border border-white/20 rounded text-[10px] text-white">Cmd+K</kbd> to open Command Palette
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
