"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/[0.03] blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/[0.02] blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <div className="w-28 h-28 flex items-center justify-center mx-auto mb-6">
            <img src="/logo.png" alt="QueryNexis" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Log in to your QueryNexis
 account</p>
        </div>

        <div className="p-10 rounded-[2.5rem] glassmorphism relative border border-white/10">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl shadow-xl shadow-white/5 hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Don't have an account? <Link href="/register" className="text-white font-black hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
