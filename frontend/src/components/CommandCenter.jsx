import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, AlertTriangle, ChevronRight } from 'lucide-react';
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

export default function CommandCenter({ setView, onSelectInvoice, isDark }) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-7xl mx-auto space-y-5"
    >
      {/* 1. Compact Live Anomaly Feed */}
      <div className="border border-slate-900/10 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 backdrop-blur-md rounded-xl p-3.5 flex flex-col gap-2 shadow-xl shadow-black/50">
        <div className="flex items-center justify-between text-xs font-mono text-slate-900 dark:text-white/60 pb-2 border-b border-slate-900/10 dark:border-white/10">
          <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase">
            <Activity className="w-3.5 h-3.5 text-slate-900 dark:text-white/80" />
            Live Financial Incident Stream
          </span>
          <span className="text-[10px] text-slate-900 font-bold dark:text-white/50">2 Actions Required</span>
        </div>

        <div className="space-y-1.5">
          <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-rose-600 dark:text-rose-300 font-bold">[CRITICAL_DUPLICATE]</span>
              <span className="text-slate-900 font-medium dark:text-white/80">TechSupply Co (₹1,200.00) matches existing committed record INV-9982.</span>
            </div>
            <button
              onClick={() => onSelectInvoice('duplicate', { type: 'DUPLICATE', vendor: 'TechSupply Co', amount: 1200.00 })}
              className="px-2.5 py-1 rounded bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-[11px] font-semibold text-rose-200"
            >
              Inspect & Block →
            </button>
          </div>

          <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="text-amber-600 dark:text-amber-300 font-bold">[MATH_DESYNC]</span>
              <span className="text-slate-900 font-medium dark:text-white/80">CloudScale Systems stated ₹4,200.00 total vs ₹3,650.00 line item sum.</span>
            </div>
            <button
              onClick={() => onSelectInvoice('mismatch', { type: 'MATH_MISMATCH', vendor: 'CloudScale Systems', amount: 4200.00 })}
              className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-[11px] font-semibold text-amber-200"
            >
              Inspect & Block →
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/5 dark:bg-white/5 backdrop-blur-md border border-slate-900/10 dark:border-white/10 shadow-lg shadow-black/40">
          <span className="text-[10px] font-mono text-slate-900 dark:text-white/50 uppercase font-bold">24H Ingested Volume</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">1,248</div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">+14.2% from last cycle</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/5 dark:bg-white/5 backdrop-blur-md border border-slate-900/10 dark:border-white/10 shadow-lg shadow-black/40">
          <span className="text-[10px] font-mono text-slate-900 dark:text-white/50 uppercase font-bold">Validation Pass Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">94.8%</div>
          <span className="text-[10px] text-slate-900 dark:text-white/50 font-mono mt-1 block">Deterministic zero-delta match</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/5 dark:bg-white/5 backdrop-blur-md border border-slate-900/10 dark:border-white/10 shadow-lg shadow-black/40">
          <span className="text-[10px] font-mono text-slate-900 dark:text-white/50 uppercase font-bold">Fraudulent Spend Intercepted</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">₹42,500.00</div>
          <span className="text-[11px] text-rose-300 font-mono mt-1 block">32 Duplicate/Faulty records blocked</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/5 dark:bg-white/5 backdrop-blur-md border border-slate-900/10 dark:border-white/10 shadow-lg shadow-black/40">
          <span className="text-[10px] font-mono text-slate-900 dark:text-white/50 uppercase font-bold">Average Field Confidence</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">96.4%</div>
          <span className="text-[10px] text-slate-900 dark:text-white/50 font-mono mt-1 block">Schema-enforced accuracy</span>
        </div>
      </div>

      {/* 3. Macro Spend & Volume Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spend by GL Category Bar Chart */}
        <div className="p-4 rounded-xl bg-slate-900/5 dark:bg-white/5 backdrop-blur-md border border-slate-900/10 dark:border-white/10 shadow-lg shadow-black/40 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-900/10 dark:border-white/10 pb-2">
            <span className="text-xs font-mono text-slate-900 dark:text-white/80 font-bold uppercase">Spend Breakdown by GL Code</span>
            <span className="text-[10px] font-mono text-slate-900 dark:text-white/50 font-bold">Total: ₹112,200.00</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendByGLData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} vertical={false} />
                <XAxis dataKey="category" stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', opacity: 1 }}
                  contentStyle={{ backgroundColor: isDark ? '#111' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', fontSize: '11px', fontFamily: 'monospace', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Committed Spend']}
                />
                <Bar dataKey="amount" fill="#F6C824" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Processing Velocity Area Chart */}
        <div className="p-4 rounded-xl bg-slate-900/5 dark:bg-white/5 backdrop-blur-md border border-slate-900/10 dark:border-white/10 shadow-lg shadow-black/40 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-900/10 dark:border-white/10 pb-2">
            <span className="text-xs font-mono text-slate-900 dark:text-white/80 font-bold uppercase">Ingestion Velocity & Anomalies</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Live Telemetry</span>
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
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} vertical={false} />
                <XAxis dataKey="time" stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#111' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', fontSize: '11px', fontFamily: 'monospace', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }} 
                  itemStyle={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                />
                <Area type="monotone" dataKey="total" stroke="#10B981" fillOpacity={1} fill="url(#colorTotal)" name="Ingested" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Dense Recent Ingestion Stream */}
      <div className="p-4 rounded-xl bg-slate-900/5 dark:bg-white/5 backdrop-blur-md border border-slate-900/10 dark:border-white/10 shadow-lg shadow-black/40 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-900/10 dark:border-white/10 pb-2">
          <span className="text-xs font-mono text-slate-900 dark:text-white/80 font-bold uppercase">Recent Ingestion Stream</span>
          <button
            onClick={() => setView('ingest')}
            className="text-[11px] font-mono text-slate-900 dark:text-white/60 hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors font-bold"
          >
            Process New Document <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-slate-900 dark:text-white/50 text-[10px] uppercase font-bold border-b border-slate-900/10 dark:border-white/10">
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
            <tbody className="divide-y divide-white/5">
              {recentLedgerFeed.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/5 dark:bg-white/5 transition-colors">
                  <td className="py-2.5">
                    {row.status === 'VERIFIED' && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">VERIFIED</span>}
                    {row.status === 'MATH_MISMATCH' && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">MATH_DESYNC</span>}
                    {row.status === 'DUPLICATE_BLOCKED' && <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">IDEMPOTENT LOCK</span>}
                  </td>
                  <td className="py-2.5 font-bold text-slate-900 dark:text-white">{row.id}</td>
                  <td className="py-2.5 text-slate-900 dark:text-white/80 font-medium">{row.vendor}</td>
                  <td className="py-2.5 text-slate-900 dark:text-white/50">{row.gl}</td>
                  <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">₹{row.amount.toFixed(2)}</td>
                  <td className="py-2.5 text-right text-emerald-400 font-bold">{row.confidence}</td>
                  <td className="py-2.5 text-right text-slate-900 dark:text-white/50 text-[10px]">{row.time}</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => {
                        let scenario = 'clean';
                        if (row.vendor === 'Apex Logistics') scenario = 'clean_apex';
                        else if (row.status === 'DUPLICATE_BLOCKED') scenario = 'duplicate';
                        else if (row.status === 'MATH_MISMATCH') scenario = 'mismatch';
                        onSelectInvoice(scenario, null);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-900/10 dark:bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white text-[10px] border border-slate-900/20 dark:border-white/20 transition-colors"
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
  );
}
