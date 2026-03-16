"use client";

import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Package, Home } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full p-12 rounded-[3.5rem] glassmorphism border border-white/20 text-center relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 blur-3xl rounded-full" />
        
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 text-white border border-white/20">
          <CheckCircle size={56} />
        </div>
        
        <h1 className="text-4xl font-black mb-4">Success!</h1>
        <p className="text-muted-foreground mb-12">
          Your autonomous order has been placed successfully. Our delivery bots are already in motion.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/orders" 
            className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-xl shadow-white/5"
          >
            Track Order <Package size={20} />
          </Link>
          
          <Link 
            href="/" 
            className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            Back to Home <Home size={20} />
          </Link>
        </div>
        
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20 mt-12 italic">
          QueryNexis Architecture
        </p>
      </motion.div>
    </div>
  );
}
