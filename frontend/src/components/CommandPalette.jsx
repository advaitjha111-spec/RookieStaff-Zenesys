import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UploadCloud, ShieldAlert, FileText, Layers, Hash } from 'lucide-react';

const actions = [
  { id: 'upload', label: 'Upload Invoice', icon: UploadCloud, shortcut: 'U' },
  { id: 'inspect', label: 'Inspect Latest Anomaly', icon: ShieldAlert, shortcut: 'A' },
  { id: 'export', label: 'Export Audit Logs', icon: FileText, shortcut: 'E' },
  { id: 'demo1', label: 'Switch Demo Scenario: Clean', icon: Layers, shortcut: '1' },
  { id: 'demo2', label: 'Switch Demo Scenario: Duplicates', icon: Layers, shortcut: '2' },
];

export default function CommandPalette({ isOpen, onClose, onAction }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          onAction(filteredActions[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose, onAction]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl bg-obsidian-800 border border-slateBorder rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-slateBorder">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search commands or type a shortcut..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none font-sans text-sm"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-obsidian-900 border border-slateBorder text-slate-400">
                ESC
              </kbd>
            </div>

            <div className="max-h-72 overflow-y-auto py-2">
              {filteredActions.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  No commands found for "{query}"
                </div>
              ) : (
                filteredActions.map((action, index) => {
                  const Icon = action.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        onAction(action.id);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors text-left ${
                        isSelected 
                          ? 'bg-gold-500/10 text-gold-500' 
                          : 'text-slate-300 hover:bg-obsidian-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-3 ${isSelected ? 'text-gold-500' : 'text-slate-400'}`} />
                      <span className="flex-1">{action.label}</span>
                      {action.shortcut && (
                        <kbd className={`px-2 py-0.5 rounded border font-mono text-[10px] ${
                          isSelected 
                            ? 'bg-gold-500/20 border-gold-500/30 text-gold-500' 
                            : 'bg-obsidian-900 border-slateBorder text-slate-500'
                        }`}>
                          {action.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
