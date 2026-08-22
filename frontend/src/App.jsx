import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Database,
  Mail,
  FileText,
  FileCheck,
  Building2,
  Calendar,
  Layers,
  Hash,
  LayoutDashboard,
  HardDriveUpload,
  CheckSquare,
  Activity,
  ScanText,
  Cpu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import confetti from 'canvas-confetti';
import mockData from './mockPayload.json';



export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, ingestion, operator
  const [currentScenario, setCurrentScenario] = useState('clean');
  const [data, setData] = useState(mockData.clean);
  
  const [dragActive, setDragActive] = useState(false);
  const [ingestionStage, setIngestionStage] = useState(0); // 0: idle, 1: OCR, 2: LLM, 3: Validation, 4: Done
  const [emailDispatched, setEmailDispatched] = useState(false);

  // Sync Scenario
  const loadScenario = (key) => {
    setCurrentScenario(key);
    setData(mockData[key]);
    setEmailDispatched(false);
  };

  const getConfidenceStyle = (score) => {
    if (score >= 0.90) return "border-emerald-500/80 bg-emerald-500/5 text-emerald-300 focus:border-emerald-400";
    if (score >= 0.70) return "border-amber-500/80 bg-amber-500/5 text-amber-300 focus:border-amber-400";
    return "border-rose-500/80 bg-rose-500/5 text-rose-300 focus:border-rose-400 animate-pulse";
  };

  const handleFileUpload = (e) => {
    e?.preventDefault();
    setDragActive(false);
    setIngestionStage(1);
    
    setTimeout(() => setIngestionStage(2), 1500); // OCR
    setTimeout(() => setIngestionStage(3), 3000); // LLM
    setTimeout(() => {
      setIngestionStage(0);
      setActiveTab('operator');
    }, 4500); // Validation Done -> Go to Operator
  };

  const handlePushToERP = () => {
    if (!data.validation.is_valid) {
      alert("Action Blocked: Anomaly must be resolved before committing to ERP Ledger.");
      return;
    }
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });
  };

  const handleDispatchEmailAlert = () => {
    setEmailDispatched(true);
    setTimeout(() => setEmailDispatched(false), 3500);
  };

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-[#090D16]/90 backdrop-blur-md flex flex-col z-20">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/30">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base">VERIX</span>
              <span className="text-[9px] bg-slate-800 text-slate-300 px-1 rounded font-mono">v1.0</span>
            </div>
            <span className="text-[9px] text-slate-500 block tracking-widest font-mono">INTEGRITY ENGINE</span>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Command Center
          </button>
          
          <button 
            onClick={() => setActiveTab('ingestion')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'ingestion' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <HardDriveUpload className="w-4 h-4" /> Ingestion Pipeline
          </button>

          <button 
            onClick={() => setActiveTab('operator')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'operator' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <CheckSquare className="w-4 h-4" /> Operator Workspace
            {!data.validation.is_valid && (
              <span className="ml-auto w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Zero Hallucination Protocol Active
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header & Demo Switcher */}
        <header className="h-16 border-b border-slate-800 bg-[#090D16]/80 backdrop-blur flex items-center justify-between px-6 shrink-0">
          <h1 className="font-semibold text-sm text-slate-300">
            {activeTab === 'dashboard' && 'Dashboard / Overview'}
            {activeTab === 'ingestion' && 'Pipeline / Document Upload'}
            {activeTab === 'operator' && 'Workspace / Anomaly Resolution'}
          </h1>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500">DEMO FIXTURE:</span>
            <button
              onClick={() => loadScenario('clean')}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${currentScenario === 'clean' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
            >
              Clean
            </button>
            <button
              onClick={() => loadScenario('duplicate')}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${currentScenario === 'duplicate' ? 'bg-rose-600/20 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
            >
              Duplicate Trapped
            </button>
            <button
              onClick={() => loadScenario('mismatch')}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${currentScenario === 'mismatch' ? 'bg-amber-600/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
            >
              Math Mismatch
            </button>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <AnimatePresence mode="wait">
            
            {/* VIEW: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto flex flex-col gap-6"
              >
                {/* Live Anomaly Feed */}
                <section>
                  <h2 className="text-xs font-mono text-slate-500 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-400" /> LIVE ANOMALY FEED
                  </h2>
                  <div className="flex flex-col gap-2">
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                        <div>
                          <span className="text-sm font-bold text-rose-300 block">Duplicate Invoice Blocked</span>
                          <span className="text-xs text-slate-400">Vendor: TechSupply Co | Amount: ₹1,200.00 | Found identical record in Supabase.</span>
                        </div>
                      </div>
                      <button onClick={() => { loadScenario('duplicate'); setActiveTab('operator'); }} className="px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-700 rounded text-slate-300 hover:bg-slate-800">
                        Review
                      </button>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <div>
                          <span className="text-sm font-bold text-amber-300 block">Arithmetic Mismatch Detected</span>
                          <span className="text-xs text-slate-400">Vendor: CloudHost LLC | Extracted Total: ₹500 | Calculated: ₹550.</span>
                        </div>
                      </div>
                      <button onClick={() => { loadScenario('mismatch'); setActiveTab('operator'); }} className="px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-700 rounded text-slate-300 hover:bg-slate-800">
                        Review
                      </button>
                    </div>
                  </div>
                </section>

                {/* KPIs */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-mono uppercase">Processing Volume (24h)</span>
                    <span className="text-3xl font-bold text-slate-200">1,248</span>
                    <span className="text-xs text-emerald-400">+12% vs yesterday</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-mono uppercase">Validation Pass Rate</span>
                    <span className="text-3xl font-bold text-emerald-400">92.4%</span>
                    <span className="text-xs text-slate-400">100% reconciled on pass</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-mono uppercase">Fraudulent Spend Blocked</span>
                    <span className="text-3xl font-bold text-rose-400">₹42,500</span>
                    <span className="text-xs text-slate-400">32 anomalies intercepted</span>
                  </div>
                </section>

                {/* Macro Visualizations */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 h-80 flex flex-col">
                    <span className="text-xs text-slate-500 font-mono uppercase mb-4 block">Spend by GL Category</span>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockData.dashboardData.glSpendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                        <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px'}} />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 h-80 flex flex-col">
                    <span className="text-xs text-slate-500 font-mono uppercase mb-4 block">Ingestion Volume Over Time</span>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockData.dashboardData.volumeData}>
                        <defs>
                          <linearGradient id="colorInvoices" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px'}} />
                        <Area type="monotone" dataKey="invoices" stroke="#10b981" fillOpacity={1} fill="url(#colorInvoices)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </motion.div>
            )}

            {/* VIEW: INGESTION PIPELINE */}
            {activeTab === 'ingestion' && (
              <motion.div
                key="ingestion"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto flex flex-col items-center justify-center h-full gap-8 py-10"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Two-Stage Ingestion Pipeline</h2>
                  <p className="text-slate-400 text-sm">Drop a raw invoice to trigger OCR layout parsing followed by LLM schema extraction.</p>
                </div>

                {ingestionStage === 0 ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleFileUpload}
                    onClick={handleFileUpload}
                    className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'}`}
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-lg">Drop document or click to upload</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">Accepts PDF, PNG, JPG</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-lg flex flex-col gap-6">
                    {/* Stage 1: OCR */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-500 ${ingestionStage >= 1 ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-slate-800 opacity-30'}`}>
                      <ScanText className={`w-6 h-6 ${ingestionStage === 1 ? 'animate-pulse text-indigo-400' : 'text-emerald-400'}`} />
                      <div>
                        <h4 className="font-semibold text-sm">Layout-Aware Parsing (OCR)</h4>
                        <p className="text-xs text-slate-400">Extracting raw text geometries and bounding boxes...</p>
                      </div>
                      {ingestionStage > 1 && <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />}
                    </div>

                    {/* Stage 2: LLM */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-500 ${ingestionStage >= 2 ? 'border-sky-500/50 bg-sky-500/10' : 'border-slate-800 opacity-30'}`}>
                      <Cpu className={`w-6 h-6 ${ingestionStage === 2 ? 'animate-pulse text-sky-400' : 'text-emerald-400'}`} />
                      <div>
                        <h4 className="font-semibold text-sm">Semantic Extraction (GPT-4o-Mini)</h4>
                        <p className="text-xs text-slate-400">Mapping unstructured text to strict JSON schema...</p>
                      </div>
                      {ingestionStage > 2 && <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />}
                    </div>

                    {/* Stage 3: Validation */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-500 ${ingestionStage >= 3 ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-800 opacity-30'}`}>
                      <Database className={`w-6 h-6 ${ingestionStage === 3 ? 'animate-pulse text-amber-400' : 'text-emerald-400'}`} />
                      <div>
                        <h4 className="font-semibold text-sm">Backend Integrity Gate</h4>
                        <p className="text-xs text-slate-400">Checking deterministic math & Supabase duplicate logs...</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW: OPERATOR PORTAL */}
            {activeTab === 'operator' && (
              <motion.div
                key="operator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto flex flex-col gap-5"
              >
                {/* Top Anomaly Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Verification Engine:</span>
                    {data.validation.is_duplicate ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-bold animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5" /> DUPLICATE INVOICE BLOCKED
                      </span>
                    ) : data.validation.math_mismatch ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-bold animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" /> ARITHMETIC MISMATCH (TOTAL DESYNC)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> LEDGER RECONCILED & CLEAN
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    ID: {data.document_id}
                  </div>
                </div>

                {/* 50/50 Split Screen Workspace */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">

                  {/* Left Column: Raw Document Mock View */}
                  <div className="border border-slate-800 bg-[#0B0F17] rounded-xl flex flex-col h-[600px] overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 p-3 bg-slate-900/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        {data.document_id}_raw.pdf
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">ORIGINAL DOCUMENT</span>
                    </div>

                    <div className="flex-1 p-8 font-mono text-sm text-slate-300 relative overflow-y-auto bg-[#e2e8f0] text-slate-800 shadow-inner">
                       {/* Simulating a bright PDF rendering */}
                       <div className="max-w-sm mx-auto bg-white p-8 shadow-sm h-full rounded border border-slate-300 relative flex flex-col justify-between">
                          <div className="space-y-6">
                            <div className="flex justify-between border-b pb-4">
                              <h2 className="text-xl font-bold tracking-tight text-slate-900">INVOICE</h2>
                              <div className="text-right text-xs">
                                <span className="block font-bold">INV #{data.document_id.split('-')[1]}</span>
                                <span className="text-slate-500">{data.date}</span>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-[10px] font-bold text-slate-500 mb-1">BILL FROM</h3>
                              <p className="font-semibold text-slate-800">{data.vendor_name}</p>
                              <p className="text-xs text-slate-500 mt-1">PO REF: {data.po_reference}</p>
                            </div>

                            <table className="w-full text-xs mt-6">
                              <thead className="border-b">
                                <tr className="text-left text-slate-500">
                                  <th className="pb-2">DESCRIPTION</th>
                                  <th className="pb-2 text-right">QTY</th>
                                  <th className="pb-2 text-right">AMOUNT</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {data.line_items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="py-3">{item.description}</td>
                                    <td className="py-3 text-right">{item.quantity}</td>
                                    <td className="py-3 text-right">₹{item.amount.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="border-t pt-4 flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-600">TOTAL DUE</span>
                            <span className="font-bold text-slate-900 text-lg">
                              ₹{data.validation.math_mismatch ? (data.total_amount + 50).toFixed(2) : data.total_amount.toFixed(2)}
                            </span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Right Column: Verified ERP Mapping & Confidence Layer */}
                  <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-4 h-[600px] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        Structured Output (Schema Locked)
                      </div>
                    </div>

                    {/* Form Fields with Confidence Colors */}
                    <div className="grid grid-cols-2 gap-4 font-mono">
                      <div>
                        <label className="text-[10px] text-slate-400 flex items-center gap-1 mb-1.5">
                          <Building2 className="w-3 h-3 text-slate-500" /> Vendor Name
                        </label>
                        <div className={`px-3 py-2 rounded-lg border text-sm flex justify-between items-center ${getConfidenceStyle(data.confidence_scores.vendor_name)}`}>
                          <span className="truncate">{data.vendor_name}</span>
                          <span className="text-[10px] font-bold">{(data.confidence_scores.vendor_name * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 flex items-center gap-1 mb-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" /> Invoice Date
                        </label>
                        <div className={`px-3 py-2 rounded-lg border text-sm flex justify-between items-center ${getConfidenceStyle(data.confidence_scores.date)}`}>
                          <span>{data.date}</span>
                          <span className="text-[10px] font-bold">{(data.confidence_scores.date * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 flex items-center gap-1 mb-1.5">
                          <Hash className="w-3 h-3 text-slate-500" /> PO Reference
                        </label>
                        <div className={`px-3 py-2 rounded-lg border text-sm flex justify-between items-center ${getConfidenceStyle(data.confidence_scores.po_reference)}`}>
                          <span>{data.po_reference}</span>
                          <span className="text-[10px] font-bold">{(data.confidence_scores.po_reference * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 flex items-center gap-1 mb-1.5">
                          <Layers className="w-3 h-3 text-slate-500" /> Auto-GL Code
                        </label>
                        <div className={`px-3 py-2 rounded-lg border text-sm flex justify-between items-center ${getConfidenceStyle(data.confidence_scores.gl_code)}`}>
                          <span className="truncate">{data.gl_code}</span>
                          <span className="text-[10px] font-bold">{(data.confidence_scores.gl_code * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="flex flex-col gap-2 mt-2">
                      <label className="text-[10px] font-mono text-slate-400">Reconciled Line Item Ledger</label>
                      <div className="border border-slate-800 rounded-lg overflow-hidden text-sm font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-slate-800/80 text-slate-400 text-xs">
                            <tr>
                              <th className="p-3">Item Description</th>
                              <th className="p-3 text-right">Qty</th>
                              <th className="p-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                            {data.line_items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="p-3 text-slate-300">{item.description}</td>
                                <td className="p-3 text-right text-slate-400">{item.quantity}</td>
                                <td className="p-3 text-right text-slate-200">₹{item.amount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Arithmetic Status Note */}
                    <div className={`mt-2 p-3 rounded-lg border text-sm font-mono ${data.validation.is_valid
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                        : 'border-rose-500/30 bg-rose-500/5 text-rose-400'
                      }`}>
                      <span className="font-bold block text-xs uppercase mb-1">Engine Status:</span>
                      {data.validation.message}
                    </div>

                    <div className="flex-1"></div>

                    {/* Action Tray */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Calculated Total Payable</span>
                        <span className={`text-2xl font-bold font-mono ${data.validation.math_mismatch ? 'text-rose-400' : 'text-emerald-400'}`}>
                          ₹{data.total_amount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {!data.validation.is_valid && (
                          <button
                            onClick={handleDispatchEmailAlert}
                            className="px-4 py-2.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-mono text-sm transition-all flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            {emailDispatched ? "Alert Sent!" : "Dispatch Alert"}
                          </button>
                        )}

                        <button
                          onClick={handlePushToERP}
                          disabled={!data.validation.is_valid}
                          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${data.validation.is_valid
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                        >
                          <Database className="w-4 h-4" />
                          Commit to ERP
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}