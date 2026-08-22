import React from 'react';
import { LayoutDashboard, UploadCloud, FileCheck2, UserCircle2, Sun, Moon } from 'lucide-react';

export default function Sidebar({ view, setView, currentUser, onOpenAuth, onSignOut, isDark, toggleTheme }) {
  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center bg-slate-900/5 dark:bg-white/5 backdrop-blur-md border border-slate-900/10 dark:border-white/10 rounded-full py-6 px-2 gap-4 shadow-2xl transition-colors duration-300">
      <div className="w-10 h-10 rounded-full bg-slate-900/10 dark:bg-white/10 border border-slate-900/20 dark:border-white/20 flex items-center justify-center font-bold text-lg text-slate-900 dark:text-white mb-2 shadow-inner">
        V
      </div>

      <nav className="flex flex-col gap-3 flex-1">
        <button
          onClick={() => setView('command')}
          className={`relative p-3 rounded-full flex items-center justify-center transition-all group ${view === 'command'
              ? 'bg-slate-900/10 text-slate-900 border-slate-900/20 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:bg-white/10 dark:text-white dark:border-white/20 dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
              : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white border border-transparent'
            }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-white/20 rounded-lg text-xs font-medium text-slate-900 dark:text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Command Center
          </span>
        </button>

        <button
          onClick={() => setView('ingest')}
          className={`relative p-3 rounded-full flex items-center justify-center transition-all group ${view === 'ingest'
              ? 'bg-slate-900/10 text-slate-900 border-slate-900/20 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:bg-white/10 dark:text-white dark:border-white/20 dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
              : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white border border-transparent'
            }`}
        >
          <UploadCloud className="w-5 h-5" />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-white/20 rounded-lg text-xs font-medium text-slate-900 dark:text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Ingestion Pipeline
          </span>
        </button>

        <button
          onClick={() => setView('workspace')}
          className={`relative p-3 rounded-full flex items-center justify-center transition-all group ${view === 'workspace'
              ? 'bg-slate-900/10 text-slate-900 border-slate-900/20 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:bg-white/10 dark:text-white dark:border-white/20 dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
              : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white border border-transparent'
            }`}
        >
          <FileCheck2 className="w-5 h-5" />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-white/20 rounded-lg text-xs font-medium text-slate-900 dark:text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Verification Workspace
          </span>
        </button>
      </nav>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="relative p-3 mt-2 rounded-full flex items-center justify-center transition-all group text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white border border-transparent"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        <span className="absolute left-full ml-4 px-3 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-white/20 rounded-lg text-xs font-medium text-slate-900 dark:text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      </button>

      {/* Operator Badge Hover Area */}
      <div className="mt-4 relative group">
        <button
          className={`relative p-3 rounded-full flex items-center justify-center transition-all border border-transparent ${
            currentUser 
              ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400' 
              : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white'
          }`}
        >
          {currentUser ? (
            <span className="font-mono text-xs font-bold">{currentUser.email.slice(0, 2).toUpperCase()}</span>
          ) : (
            <UserCircle2 className="w-5 h-5" />
          )}
        </button>

        {/* Hover Popout Badge */}
        <div className="absolute left-full ml-4 bottom-0 p-3 w-[200px] bg-white/90 dark:bg-[#11131A]/90 backdrop-blur-md border border-slate-200 dark:border-[#232733] rounded-xl flex items-center justify-between opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-2xl">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-gray-200 truncate max-w-[110px]">
                {currentUser ? (currentUser.user_metadata?.full_name || currentUser.email.split('@')[0]) : 'Demo Operator'}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">SYS_AUTHORIZED</span>
            </div>
          </div>
          <button
            onClick={currentUser ? onSignOut : () => onOpenAuth('signin')}
            className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer ml-2 whitespace-nowrap"
          >
            {currentUser ? 'Sign Out' : 'Sign In'}
          </button>
        </div>
      </div>
    </aside>
  );
}
