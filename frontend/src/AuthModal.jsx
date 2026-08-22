import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Lock, Mail, User, ArrowRight, X } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AuthModal({ isOpen, initialIsSignUp = false, onClose, onAuthSuccess }) {
    const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    if (!isOpen) return null;

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName, role: 'Finance Controller' }
                    }
                });
                if (error) throw error;
                
                // Supabase requires email verification by default
                if (!data.session) {
                    setErrorMsg("Success! Please check your email to verify your account before signing in.");
                    setLoading(false);
                    return;
                }
                
                onAuthSuccess(data.user);
                onClose();
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onAuthSuccess(data.user);
                onClose();
            }
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full max-w-sm bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#2B2B2B] rounded-2xl p-6 shadow-2xl relative transition-colors duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:text-[#777] dark:hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="text-center mb-5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#222] border border-slate-200 dark:border-[#333] flex items-center justify-center mx-auto mb-2 text-[#F6C824]">
                        <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {isSignUp ? 'Create Operator Account' : 'Operator Authentication'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#777] mt-0.5">Zero-Trust Enterprise Financial Access</p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-mono">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-3 font-mono text-xs">
                    {isSignUp && (
                        <div>
                            <label className="block text-slate-500 dark:text-[#888] mb-1 text-[10px] uppercase">Full Name</label>
                            <div className="relative">
                                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-[#555]" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-slate-50 dark:bg-[#0D0D0D] border border-slate-200 dark:border-[#262626] rounded-lg py-2 pl-9 pr-3 text-slate-900 dark:text-white focus:border-[#F6C824] dark:focus:border-[#F6C824] outline-none transition-colors duration-300"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-slate-500 dark:text-[#888] mb-1 text-[10px] uppercase">Work Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-[#555]" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="controller@company.internal"
                                className="w-full bg-slate-50 dark:bg-[#0D0D0D] border border-slate-200 dark:border-[#262626] rounded-lg py-2 pl-9 pr-3 text-slate-900 dark:text-white focus:border-[#F6C824] dark:focus:border-[#F6C824] outline-none transition-colors duration-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-500 dark:text-[#888] mb-1 text-[10px] uppercase">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-[#555]" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-slate-50 dark:bg-[#0D0D0D] border border-slate-200 dark:border-[#262626] rounded-lg py-2 pl-9 pr-3 text-slate-900 dark:text-white focus:border-[#F6C824] dark:focus:border-[#F6C824] outline-none transition-colors duration-300"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-[#F6C824] hover:bg-[#E5B81B] text-black font-sans font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                </form>

                <div className="mt-4 text-center border-t border-slate-200 dark:border-[#222] pt-3">
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
                        className="text-xs text-slate-500 dark:text-[#888] hover:text-[#F6C824] dark:hover:text-[#F6C824] transition-colors cursor-pointer"
                    >
                        {isSignUp ? 'Already registered? Sign In' : "Don't have an operator profile? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}