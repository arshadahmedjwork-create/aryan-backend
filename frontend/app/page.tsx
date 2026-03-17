"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] selection:bg-[#2563EB] selection:text-white overflow-hidden relative">
      {/* Immersive Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Floating Data Nodes */}
        <AnimatePresence>
          {isMounted && [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                opacity: 0 
              }}
              animate={{ 
                y: [null, "-100%"],
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: Math.random() * 20 + 10, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 10
              }}
            />
          ))}
        </AnimatePresence>

        {/* Dynamic Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.1),transparent_50%)]" />
      </div>

      {/* Main Content Layer */}
      <main className="relative z-10 pt-32 px-6 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-8">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Neural Interface v4.28</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tight mb-8">
            Where Queries<br />
            <span className="text-white/20 italic">Become</span><br />
            Intelligence
          </h1>
        </motion.div>

        {/* Central Neural Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-80 h-80 mb-20"
        >
           {/* Animated Concentric Rings */}
           {[1, 2, 3].map((ring) => (
             <motion.div
               key={ring}
               className="absolute inset-0 border border-white/5 rounded-full"
               animate={{ 
                 scale: [1, 1.1, 1],
                 opacity: [0.1, 0.2, 0.1]
               }}
               transition={{ 
                 duration: 4 + ring, 
                 repeat: Infinity, 
                 ease: "easeInOut",
                 delay: ring * 0.5
               }}
             />
           ))}
           
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-white/[0.01] border border-white/5 rounded-[56px] shadow-2xl flex items-center justify-center relative overflow-hidden group backdrop-blur-3xl">
                 <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="w-24 h-24 bg-black border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(37,99,235,0.3)] relative">
                    <motion.div
                      animate={{ 
                        boxShadow: ["0 0 20px rgba(37,99,235,0)", "0 0 40px rgba(37,99,235,0.4)", "0 0 20px rgba(37,99,235,0)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                    />
                    <Zap size={40} fill="#2563EB" className="relative z-10" />
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-sm mb-32 relative z-20">
          <Link href="/products" className="w-full py-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-[32px] flex items-center justify-center text-xl tracking-tight transition-all active:scale-95 shadow-2xl shadow-blue-600/30 group">
            Browse Products
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
          </Link>
          <button className="w-full py-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-[32px] text-lg transition-all active:scale-95 backdrop-blur-md">
            View Live Metrics
          </button>
        </div>

        {/* Feature Stack */}
        <div className="w-full max-w-xl grid md:grid-cols-1 gap-6 mb-40">
          {[
            { 
              icon: <Zap size={20} fill="currentColor" />, 
              title: "Hyper-Speed Execution", 
              desc: "Deploy complex analytical clusters in milliseconds. Our neural engine benchmarks at 1.2M queries per second." 
            },
            { 
              icon: <Shield size={20} fill="currentColor" />, 
              title: "Quantum Encryption", 
              desc: "Military-grade data encapsulation at every node. Your proprietary queries remain dark to the global net." 
            }
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (i * 0.1) }}
              className="p-10 rounded-[40px] border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-all group backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-8 border border-blue-500/20">
                {f.icon}
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">{f.title}</h3>
              <p className="text-white/40 leading-relaxed font-medium text-lg">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Floating Tactical HUD */}
      <div className="fixed bottom-10 left-10 z-50 hidden md:block">
        <div className="glassmorphism p-1 px-4 rounded-full border border-white/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">System Online: 99.9% Uptime</span>
        </div>
      </div>
    </div>
  );
}
