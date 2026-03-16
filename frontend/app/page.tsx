"use client";

import { motion } from 'framer-motion';
import { ShoppingCart, Star, ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Hero */}
      <main className="pt-32 px-8 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl lg:text-8xl font-black leading-none mb-6">
              Where <span className="text-white">Queries</span><br/>Become Intelligence.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-lg">
              The next generation of agentic commerce systems. Connected, intelligent, and autonomous.
            </p>
            <div className="flex gap-4">
              <Link href="/products" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform">
                Browse Products <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 overflow-hidden glassmorphism flex items-center justify-center p-12">
               <div className="w-full h-full rounded-2xl bg-black border border-white/10 shadow-2xl flex items-center justify-center">
                  <Zap size={120} className="text-white animate-pulse" />
               </div>
               {/* Floating elements */}
               <div className="absolute top-10 right-10 glassmorphism p-4 rounded-2xl shadow-xl animate-bounce">
                  <ShoppingCart className="text-white" />
               </div>
               <div className="absolute bottom-10 left-10 glassmorphism p-4 rounded-2xl shadow-xl animate-bounce [animation-delay:0.5s]">
                  <Truck className="text-white" />
               </div>
            </div>
          </motion.div>
        </div>

        {/* Features Preview */}
        <div className="mt-40 grid md:grid-cols-3 gap-8">
          {[
            { icon: <Zap />, title: "Instant Delivery", desc: "Predicted by delivery agents." },
            { icon: <Shield />, title: "Secure Checkout", desc: "Bank-grade encryption." },
            { icon: <Star />, title: "AI Guided", desc: "Proactive business insights." }
          ].map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-6 text-white border border-white/10">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
