import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import LandingPage from './LandingPage'; 
import CommandCenter from './components/CommandCenter';
import IngestionPipeline from './components/IngestionPipeline';
import VerificationWorkspace from './components/VerificationWorkspace';
import Sidebar from './components/Sidebar';
import mockData from './mockPayload.json';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  // 1. Landing page as default entry view
  const [view, setView] = useState('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [isDark, setIsDark] = useState(true);

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // 2. Fetch session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setCurrentUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const handleSelectInvoice = (scenarioKey, invoiceData) => {
    setActiveInvoice(mockData[scenarioKey]);
    setView('workspace');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex overflow-x-hidden selection:bg-indigo-500/30 dark:selection:bg-white/20 font-sans transition-colors duration-300">
      {/* 3. Conditional Navigation Shell */}
      {view !== 'landing' && (
        <Sidebar
          view={view}
          setView={setView}
          currentUser={currentUser}
          onOpenAuth={(mode) => { setAuthMode(mode || 'signin'); setIsAuthOpen(true); }}
          onSignOut={handleSignOut}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {view === 'landing' && (
          <LandingPage
            onGetStarted={() => setView('command')}
            onOpenAuth={(mode) => { setAuthMode(mode || 'signin'); setIsAuthOpen(true); }}
            currentUser={currentUser}
            isDark={isDark}
            toggleTheme={toggleTheme}
          />
        )}

        <AnimatePresence mode="wait">
          {view === 'command' && (
            <div className="p-6">
              <CommandCenter
                setView={setView}
                onSelectInvoice={handleSelectInvoice}
                isDark={isDark}
              />
            </div>
          )}

          {view === 'ingest' && (
            <div className="p-6">
              <IngestionPipeline
                onExtracted={(inv) => { setActiveInvoice(inv); setView('workspace'); }}
              />
            </div>
          )}

          {view === 'workspace' && (
            <div className="p-6">
              <VerificationWorkspace
                invoice={activeInvoice}
                currentUser={currentUser}
                setView={setView}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. Global Auth Modal */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          initialIsSignUp={authMode === 'signup'}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(user) => setCurrentUser(user)}
        />
      )}
    </div>
  );
}