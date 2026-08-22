import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  UploadCloud,
  FileCheck2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Database,
  Mail,
  FileText,
  Building2,
  Calendar,
  Layers,
  Hash,
  ArrowRight,
  TrendingUp,
  Activity,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import confetti from 'canvas-confetti';
import mockData from './mockPayload.json';

// Analytics Dataset
const spendByGLData = [
  { category: 'GL-500 H/W', amount: 48500 },
  { category: 'GL-400 S/W', amount: 32000 },
  { category: 'GL-300 Cloud', amount: 18400 },
  { category: 'GL-600 Travel', amount: 9200 },
  { category: 'GL-100 Office', amount: 4100 },
];

const volumeTimeSeriesData = [
  { time: '08:00', total: 12, flagged: 1 },
  { time: '10:00', total: 38, flagged: 3 },
  { time: '12:00', total: 64, flagged: 2 },
  { time: '14:00', total: 95, flagged: 8 },
  { time: '16:00', total: 120, flagged: 4 },
  { time: '18:00', total: 142, flagged: 5 },
];

const recentLedgerFeed = [
  { id: 'INV-9982', vendor: 'TechSupply Co', amount: 1200.00, gl: 'GL-500', status: 'VERIFIED', time: '12m ago', confidence: '98%' },
  { id: 'INV-4102', vendor: 'CloudScale Systems', amount: 4200.00, gl: 'GL-400', status: 'MATH_MISMATCH', time: '24m ago', confidence: '42%' },
  { id: 'INV-8831', vendor: 'Datadog Infra', amount: 2450.00, gl: 'GL-300', status: 'VERIFIED', time: '1h ago', confidence: '99%' },
  { id: 'INV-9982-D', vendor: 'TechSupply Co', amount: 1200.00, gl: 'GL-500', status: 'DUPLICATE_BLOCKED', time: '2h ago', confidence: '91%' },
  { id: 'INV-0193', vendor: 'Apex Logistics', amount: 890.00, gl: 'GL-600', status: 'VERIFIED', time: '3h ago', confidence: '96%' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentScenario, setCurrentScenario] = useState('clean');
  const [data, setData] = useState(mockData.clean);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Scenario Switcher
  const loadScenario = (key) => {
    setCurrentScenario(key);
    setData(mockData[key]);
    setEmailStatus(null);
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

  // Upload and Ingestion Execution
  const processUploadedFile = async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingStage(1);

    const stageTimer1 = setTimeout(() => setProcessingStage(2), 700);
    const stageTimer2 = setTimeout(() => setProcessingStage(3), 1500);

    const formData = new FormData();
    formData.append('invoice', file);

    try {
      const response = await fetch('http://localhost:5000/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.warn("Backend offline or unreachable, utilizing fixture fallback:", err);
      setData(mockData.clean);
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setTimeout(() => {
        setIsProcessing(false);
        setActiveTab('workspace');
      }, 2000);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handlePushToERP = async () => {
    if (!data.validation.is_valid) {
      alert("Action Blocked: Anomaly must be resolved prior to committing to ERP Ledger.");
      return;
    }

    try {
      await fetch('http://localhost:5000/api/push-erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice: data }),
      });
    } catch (e) {
      console.log("ERP push simulated locally");
    }

    confetti({ particleCount: 75, spread: 60, origin: { y: 0.85 } });
  };

  const handleDispatchEmailAlert = async () => {
    setEmailLoading(true);
    setEmailStatus(null);

    try {
      const response = await fetch('http://localhost:5000/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: data,
          recipientEmail: 'advaitjha111@gmail.com' // Replace with your Resend account email
        }),
      });

      const result = await response.json();
      if (result.success) {
        setEmailStatus({ type: 'success', message: 'Alert delivered to inbox via Resend!' });
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
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans">

      {/* 1. Persistent Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#090D16] flex flex-col justify-between flex-shrink-0 z-30">
        <div>
          {/* Brand Header */}
          <div className="px-5 py-4 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/30 text-white">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-sm text-white">VERIX</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">v1.0</span>
              </div>
              <span className="text-[9px] text-slate-400 block tracking-widest font-mono uppercase">Financial Control Room</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'dashboard'
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => setActiveTab('ingest')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'ingest'
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingestion Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'workspace'
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Verification Workspace</span>
            </button>
          </nav>
        </div>

        {/* Protocol Status Badge */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ENGINE ARMED
            </div>
            <span className="text-[10px] text-slate-400">Zero Hallucination Moat & Duplicate Gate Active</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Operational Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {activeTab === 'dashboard' && 'Command Center // Macro Spend & Incident Feed'}
              {activeTab === 'ingest' && 'Ingestion // Intake & Pipeline Routing'}
              {activeTab === 'workspace' && `Workspace // Review: ${data.document_id}`}
            </span>
          </div>

          {/* Quick Demo Scenario Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">Scenario Fixture:</span>
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 font-mono text-xs">
              <button
                onClick={() => loadScenario('clean')}
                className={`px-2.5 py-1 rounded transition-all ${currentScenario === 'clean' ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Clean Valid
              </button>
              <button
                onClick={() => loadScenario('duplicate')}
                className={`px-2.5 py-1 rounded transition-all ${currentScenario === 'duplicate' ? 'bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Duplicate Trap
              </button>
              <button
                onClick={() => loadScenario('mismatch')}
                className={`px-2.5 py-1 rounded transition-all ${currentScenario === 'mismatch' ? 'bg-amber-600/30 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Math Desync
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* VIEW A: High-Density Command Center */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-7xl mx-auto space-y-5"
              >
                {/* 1. Compact Live Anomaly Feed */}
                <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/80">
                    <span className="flex items-center gap-2 font-bold text-slate-300 uppercase">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      Live Financial Incident Stream
                    </span>
                    <span className="text-[10px] text-slate-400">2 Actions Required</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="text-rose-300 font-bold">[CRITICAL_DUPLICATE]</span>
                        <span className="text-slate-300">TechSupply Co (₹1,200.00) matches existing committed record INV-9982.</span>
                      </div>
                      <button
                        onClick={() => { loadScenario('duplicate'); setActiveTab('workspace'); }}
                        className="px-2.5 py-1 rounded bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-[11px] font-semibold text-rose-200"
                      >
                        Inspect & Block →
                      </button>
                    </div>

                    <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-amber-300 font-bold">[MATH_DESYNC]</span>
                        <span className="text-slate-300">CloudScale Systems stated ₹4,200.00 total vs ₹3,650.00 line item sum.</span>
                      </div>
                      <button
                        onClick={() => { loadScenario('mismatch'); setActiveTab('workspace'); }}
                        className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-[11px] font-semibold text-amber-200"
                      >
                        Inspect & Block →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Key Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">24H Ingested Volume</span>
                    <div className="text-2xl font-bold font-mono text-white mt-1">1,248</div>
                    <span className="text-[11px] text-emerald-400 font-mono mt-1 block">+14.2% from last cycle</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Validation Pass Rate</span>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">94.8%</div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">Deterministic zero-delta match</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Fraudulent Spend Intercepted</span>
                    <div className="text-2xl font-bold font-mono text-rose-400 mt-1">₹42,500.00</div>
                    <span className="text-[11px] text-rose-300 font-mono mt-1 block">32 Duplicate/Faulty records blocked</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Average Field Confidence</span>
                    <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">96.4%</div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">Schema-enforced accuracy</span>
                  </div>
                </div>

                {/* 3. Macro Spend & Volume Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Spend by GL Category Bar Chart */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-mono text-slate-300 font-bold uppercase">Spend Breakdown by GL Code</span>
                      <span className="text-[10px] font-mono text-indigo-400">Total: ₹112,200.00</span>
                    </div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={spendByGLData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                          <XAxis dataKey="category" stroke="#64748B" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', fontSize: '11px', fontFamily: 'monospace' }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Committed Spend']}
                          />
                          <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Processing Velocity Area Chart */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-mono text-slate-300 font-bold uppercase">Ingestion Velocity & Anomalies</span>
                      <span className="text-[10px] font-mono text-emerald-400">Live Telemetry</span>
                    </div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={volumeTimeSeriesData}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                          <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', fontSize: '11px', fontFamily: 'monospace' }} />
                          <Area type="monotone" dataKey="total" stroke="#10B981" fillOpacity={1} fill="url(#colorTotal)" name="Ingested" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 4. Dense Recent Ingestion Stream */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-mono text-slate-300 font-bold uppercase">Recent Ingestion Stream</span>
                    <button
                      onClick={() => setActiveTab('ingest')}
                      className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      Process New Document <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Invoice ID</th>
                          <th className="pb-2">Vendor</th>
                          <th className="pb-2">GL Tag</th>
                          <th className="pb-2 text-right">Amount</th>
                          <th className="pb-2 text-right">Confidence</th>
                          <th className="pb-2 text-right">Time</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {recentLedgerFeed.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5">
                              {row.status === 'VERIFIED' && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">VERIFIED</span>}
                              {row.status === 'MATH_MISMATCH' && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">MATH_DESYNC</span>}
                              {row.status === 'DUPLICATE_BLOCKED' && <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">DUPLICATE</span>}
                            </td>
                            <td className="py-2.5 font-bold text-slate-200">{row.id}</td>
                            <td className="py-2.5 text-slate-300">{row.vendor}</td>
                            <td className="py-2.5 text-slate-400">{row.gl}</td>
                            <td className="py-2.5 text-right font-bold text-slate-200">₹{row.amount.toFixed(2)}</td>
                            <td className="py-2.5 text-right text-emerald-400">{row.confidence}</td>
                            <td className="py-2.5 text-right text-slate-400 text-[10px]">{row.time}</td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => {
                                  if (row.status === 'DUPLICATE_BLOCKED') loadScenario('duplicate');
                                  else if (row.status === 'MATH_MISMATCH') loadScenario('mismatch');
                                  else loadScenario('clean');
                                  setActiveTab('workspace');
                                }}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW B: Ingestion Pipeline Upload */}
            {activeTab === 'ingest' && (
              <motion.div
                key="ingest"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-3xl mx-auto space-y-6 pt-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Two-Stage Ingestion Pipeline</h2>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Layout parsing separates structural OCR from semantic classification before enforcing the deterministic validation gate.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${dragActive
                      ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'
                    }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                      {dragActive ? "Drop file to process" : "Drop invoice or click to browse"}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">Supports PDF, PNG, JPG (Buffer extraction + GPT-4o-mini)</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Stage 01</span>
                    <span className="font-semibold text-slate-300">OCR & Layout Extraction</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Stage 02</span>
                    <span className="font-semibold text-slate-300">Schema-Locked LLM</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Stage 03</span>
                    <span className="font-semibold text-slate-300">Deterministic Math Gate</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW C: Operator Verification Workspace */}
            {activeTab === 'workspace' && (
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

                    <div className="h-[400px] rounded-lg bg-[#070A10] border border-slate-800/80 p-5 font-mono text-xs text-slate-300 flex flex-col justify-between overflow-hidden">
                      <div className="space-y-3.5">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-white tracking-wide">INVOICE: #{data.document_id}</span>
                          <span className="text-slate-400">{data.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">VENDOR ENTITY</span>
                          <span className="font-bold text-slate-200">{data.vendor_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">PURCHASE ORDER</span>
                          <span className="text-slate-300">{data.po_reference}</span>
                        </div>

                        <div className="pt-2">
                          <span className="text-slate-400 block text-[10px] mb-1.5">DOCUMENT LINE ITEMS</span>
                          <div className="space-y-1.5">
                            {data.line_items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-slate-400 text-xs">
                                <span>{item.quantity}x {item.description}</span>
                                <span className="text-slate-200">₹{item.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold">TOTAL CLAIMED:</span>
                        <span className="text-white font-bold">₹{data.total_amount.toFixed(2)}</span>
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
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 cursor-pointer'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                            }`}
                        >
                          <Database className="w-4 h-4" />
                          Commit to ERP Ledger
                        </button>
                      </div>
                    </div>

                    {/* Audit Trail & Operator History Panel */}
                    <div className="border border-slate-800 bg-slate-950/60 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          Audit & Compliance Traceability
                        </span>
                        <span className="text-[10px] text-slate-500">IMMUTABLE LOG</span>
                      </div>

                      <div className="space-y-2.5">
                        {/* Event 1 */}
                        <div className="flex items-start gap-2.5 text-[11px]">
                          <span className="text-slate-500 text-[10px] mt-0.5">13:42:10</span>
                          <div>
                            <span className="text-indigo-300 font-semibold">Auto-Ingestion Engine:</span>
                            <span className="text-slate-400 block text-[10px]">Extracted fields & verified arithmetic parity (Zero Delta).</span>
                          </div>
                        </div>

                        {/* Event 2 */}
                        <div className="flex items-start gap-2.5 text-[11px]">
                          <span className="text-slate-500 text-[10px] mt-0.5">13:44:02</span>
                          <div>
                            <span className="text-emerald-400 font-semibold">John Doe (Lead Controller):</span>
                            <span className="text-slate-400 block text-[10px]">
                              {data.validation.is_valid 
                                ? "Approved extraction confidence and authorized ERP commit." 
                                : "Triggered fraud alert dispatch to finance operations."}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* 3. Staged Pipeline Visualizer Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Verix Pipeline Execution</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                {processingStage >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                <span className={processingStage >= 1 ? "text-slate-200" : "text-slate-400"}>Stage 1: Document Intake & OCR Buffer Extraction</span>
              </div>
              <div className="flex items-center gap-3">
                {processingStage >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                <span className={processingStage >= 2 ? "text-slate-200" : "text-slate-400"}>Stage 2: OpenAI Schema-Locked Semantic Parse</span>
              </div>
              <div className="flex items-center gap-3">
                {processingStage >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                <span className={processingStage >= 3 ? "text-indigo-300 font-semibold" : "text-slate-400"}>Stage 3: Deterministic Arithmetic & Supabase Match</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}