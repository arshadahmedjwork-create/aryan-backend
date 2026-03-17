"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Zap, Search, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';

export default function CartPage() {
  const { cart, removeFromCart, updateQty } = useAuth();

  const subtotal = cart.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;
  const totalUnits = cart.reduce((acc: number, item: any) => acc + item.qty, 0);

  return (
    <div className="min-h-screen bg-[#000000] pt-24 px-4 md:px-8 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Bar Placeholder/Mock */}
        <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
          <div className="flex items-center gap-6">
             <Link href="/products" className="text-white/60 hover:text-white transition-colors">
               <X className="rotate-225" size={24} /> {/* Placeholder for back arrow like icon */}
             </Link>
             <h1 className="text-xl font-bold tracking-tight text-white uppercase">QueryNexis</h1>
          </div>
          <div className="flex items-center gap-6">
             <Search size={20} className="text-white/60" />
             <div className="relative">
               <ShoppingBag size={20} className="text-white" />
               <span className="absolute -top-2 -right-2 bg-[#2563EB] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                 {totalUnits}
               </span>
             </div>
          </div>
        </div>

        <div className="flex justify-between items-baseline mb-12">
          <h2 className="text-4xl font-bold text-white tracking-tight">Your Cart</h2>
          <span className="text-lg text-white/40 italic font-medium">
            {totalUnits} units selected
          </span>
        </div>

        <div className="space-y-12 mb-20 border-t border-white/5 pt-12">
          <AnimatePresence>
            {cart.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col md:flex-row gap-8 items-start md:items-center"
              >
                {/* Image Area */}
                <div className="w-full md:w-56 aspect-square bg-[#0A0A0A] rounded-[32px] border border-white/[0.05] flex items-center justify-center overflow-hidden p-6 group">
                   {p.image_url ? (
                     <img src={p.image_url} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center text-4xl font-black text-white/10 uppercase italic">
                       {p.name[0]}
                     </div>
                   )}
                </div>

                {/* Info Area */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight max-w-[70%]">
                      {p.name}
                    </h3>
                    <span className="text-2xl font-bold text-white tracking-tighter">
                      ₹{p.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-white/40 mb-8 max-w-[80%] leading-relaxed font-medium">
                    {p.description || "Limited Archive Edition / Obsidian Interface Implementation"}
                  </p>

                  <div className="flex items-center gap-8">
                     {/* Qty Switcher */}
                     <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full p-1.5 px-4">
                        <button 
                          onClick={() => updateQty(p.id, p.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-lg font-bold text-white min-w-[1.5rem] text-center">
                          {p.qty}
                        </span>
                        <button 
                          onClick={() => updateQty(p.id, p.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                     </div>

                     <button 
                       onClick={() => removeFromCart(p.id)}
                       className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-white/30 hover:text-red-400 transition-colors uppercase"
                     >
                        <X size={14} className="stroke-[3px]" /> Remove
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {cart.length === 0 && (
            <div className="text-center py-24 bg-white/5 rounded-[48px] border border-dashed border-white/10">
              <ShoppingBag className="mx-auto mb-6 opacity-10" size={64} />
              <p className="text-white/40 font-medium text-lg italic">Your repository is empty.</p>
              <Link href="/products" className="mt-8 inline-block px-8 py-3 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform active:scale-95">
                RETURN TO PRODUCTS
              </Link>
            </div>
          )}
        </div>

        {/* Order Summary Section */}
        {cart.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#050505] rounded-[48px] border border-white/5 p-10 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <h3 className="text-sm font-black text-white/40 tracking-[0.4em] uppercase mb-12 text-center md:text-left">
              Order Summary
            </h3>

            <div className="space-y-6 mb-12 border-b border-white/5 pb-12">
               <div className="flex justify-between items-center">
                  <span className="text-white/60 font-medium tracking-tight">Subtotal</span>
                  <span className="text-xl font-bold text-white">₹{subtotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-white/60 font-medium tracking-tight">Shipping</span>
                  <span className="text-sm font-black text-white tracking-[0.1em] uppercase">Complimentary</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-white/60 font-medium tracking-tight">Estimated Tax</span>
                  <span className="text-xl font-bold text-white">₹{tax.toLocaleString()}</span>
               </div>
            </div>

            <div className="flex justify-between items-center mb-12">
               <span className="text-2xl font-black text-white uppercase tracking-tighter">Total</span>
               <span className="text-4xl font-black text-[#2563EB] tracking-tighter italic">
                  ₹{total.toLocaleString()}
               </span>
            </div>

            <Link href="/checkout" className="block">
              <button className="w-full py-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-[28px] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-blue-600/20 group">
                <span className="text-lg tracking-[0.2em] uppercase">Checkout</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>

            <p className="text-[10px] text-center mt-8 text-white/20 uppercase tracking-[0.2em] font-black">
              Secure Encrypted Transaction via NexisPay
            </p>

            <div className="mt-12 p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-6">
               <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                  <Truck size={24} />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-white mb-1">Free Express Delivery</h4>
                  <p className="text-[11px] text-white/40 font-medium">Estimated arrival: Oct 24 - 26</p>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
