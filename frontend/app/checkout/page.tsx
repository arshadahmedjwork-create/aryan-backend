"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Truck, ShieldCheck, ArrowRight, Lock, Headphones } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function CheckoutPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const { cart, clearCart, user } = useAuth();
  const router = useRouter();

  const subtotal = cart.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const orderItems = cart.map((item: any) => ({
        product_id: item.id,
        quantity: item.qty,
        price: item.price
      }));
      
      await api.post('/orders/', { items: orderItems });
      clearCart();
      router.push('/order-success');
    } catch (err) {
      console.error("Checkout failed:", err);
      setLoading(false);
    }
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-background pt-40 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => router.push('/products')} className="text-white font-bold hover:underline">Go back to shop</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pt-24 px-4 md:px-8 pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-[0.02em]">
            Secure Checkout
          </h1>
          <p className="text-white/40 font-medium text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Finalize your intelligence acquisition. Tactical encryption active.
          </p>
        </div>

        {/* Tactical Payment Module */}
        <div className="space-y-12">
          {/* Animated Card Section */}
          <div className="perspective-1000 h-64 w-full max-w-md mx-auto relative">
            <motion.div 
              className="w-full h-full relative"
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front of Card */}
              <div 
                className="absolute inset-0 w-full h-full rounded-[32px] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 p-8 flex flex-col justify-between shadow-2xl backface-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                    <CreditCard className="text-[#2563EB]" />
                  </div>
                  <span className="text-[10px] font-black text-white/20 tracking-widest uppercase italic">QueryNexis Core</span>
                </div>
                <div>
                   <p className="text-lg font-mono text-white tracking-[0.2em] mb-4">•••• •••• •••• 9921</p>
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Holder</p>
                         <p className="text-xs font-bold text-white uppercase tracking-wider">{user?.full_name || "Nexus Unit"}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Expiry</p>
                         <p className="text-xs font-bold text-white uppercase tracking-wider">12 / 29</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Back of Card */}
              <div 
                className="absolute inset-0 w-full h-full rounded-[32px] bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] border border-white/10 p-8 flex flex-col justify-center shadow-2xl backface-hidden"
                style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
              >
                <div className="h-10 w-full bg-white/5 mb-8 rounded-lg" />
                <div className="flex flex-col items-center gap-4">
                   <div className="w-32">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block text-center mb-2">Security CVV</label>
                      <input 
                        type="text" 
                        maxLength={3}
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center text-white font-mono text-xl tracking-widest outline-none focus:border-[#2563EB] transition-colors"
                      />
                   </div>
                   <p className="text-[9px] text-white/20 font-medium uppercase text-center italic">Verified by Neural Shield v4.0</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="bg-[#0A0A0A] rounded-[48px] border border-white/[0.05] p-8 md:p-12 shadow-2xl relative">
            <div className="space-y-12">
               {/* Order Summary Module */}
               <div className="bg-[#050505] rounded-[32px] border border-white/5 p-8 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <Lock size={14} className="text-blue-500" />
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Synchronized Intelligence Order</span>
                  </div>
                  {cart.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                       <span className="text-white/60 font-medium">{item.name} x{item.qty}</span>
                       <span className="font-bold text-white">₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                     <span className="text-lg font-bold text-white tracking-tight">Total</span>
                     <span className="text-3xl font-black text-white tracking-tighter italic">₹{total.toLocaleString()}</span>
                  </div>
               </div>

               {/* Smart Action Button */}
               {!isFlipped ? (
                 <button 
                   onClick={() => setIsFlipped(true)}
                   className="w-full py-6 bg-white text-black font-black rounded-[28px] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl group"
                 >
                   <span className="text-lg tracking-[0.1em] uppercase italics">Pay ₹{total.toLocaleString()}</span>
                   <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                 </button>
               ) : (
                 <button 
                   onClick={handleCheckout}
                   disabled={loading || cvv.length < 3}
                   className="w-full py-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-[28px] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-blue-600/20 group disabled:opacity-50"
                 >
                   <span className="text-lg tracking-[0.1em] uppercase">{loading ? "Executing..." : "Confirm Tactical Pay"}</span>
                   {!loading && <ShieldCheck size={24} className="group-hover:scale-110 transition-transform" /> }
                 </button>
               )}

               <div className="flex items-center justify-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                     <Lock size={12} />
                     <span>SECURE CORE</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <ShieldCheck size={12} />
                     <span>VETTED</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Protection Badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-12">
            <div className="flex items-center gap-3 text-white/40">
               <ShieldCheck size={20} className="text-blue-500/60" />
               <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
            </div>
            <div className="flex items-center gap-3 text-white/40">
               <Truck size={20} className="text-blue-500/60" />
               <span className="text-[10px] font-black uppercase tracking-widest">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-white/40">
               <Headphones size={20} className="text-blue-500/60" />
               <span className="text-[10px] font-black uppercase tracking-widest">24/7 Support</span>
            </div>
        </div>
      </div>
    </div>
  );
}
