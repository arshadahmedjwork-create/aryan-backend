"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Truck, ShieldCheck, ArrowRight, Lock, Headphones } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
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
      // Create actual order in Supabase
      const orderItems = cart.map((item: any) => ({
        product_id: item.id,
        quantity: item.qty,
        price: item.price
      }));
      
      const res = await api.post('/orders/', { items: orderItems });
      
      // Clear cart on success
      clearCart();
      router.push('/order-success');
    } catch (err) {
      console.error("Checkout failed:", err);
      // Fallback for demo if backend is finicky, but ideally show error
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
            Complete your order for the Nexis Intelligence Suite. Your data is encrypted and secure.
          </p>
        </div>

        {/* Checkout Card */}
        <div className="bg-[#0A0A0A] rounded-[48px] border border-white/[0.05] p-8 md:p-12 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="space-y-16">
            {/* Shipping Details */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-[#2563EB]/10 rounded-xl flex items-center justify-center text-[#2563EB]">
                  <Truck size={24} />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Shipping Details</h2>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    defaultValue={user?.full_name || ''} 
                    className="w-full bg-[#050505] border border-white/5 rounded-2xl p-5 text-white placeholder:text-white/10 outline-none focus:border-white/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@querynexis.com" 
                    defaultValue={user?.email || ''} 
                    className="w-full bg-[#050505] border border-white/5 rounded-2xl p-5 text-white placeholder:text-white/10 outline-none focus:border-white/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Street Address</label>
                  <input 
                    type="text" 
                    placeholder="123 Analytics Way" 
                    className="w-full bg-[#050505] border border-white/5 rounded-2xl p-5 text-white placeholder:text-white/10 outline-none focus:border-white/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">City</label>
                   <input 
                     type="text" 
                     placeholder="San Francisco" 
                     className="w-full bg-[#050505] border border-white/5 rounded-2xl p-5 text-white placeholder:text-white/10 outline-none focus:border-white/20 transition-all font-medium"
                   />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">State</label>
                    <input type="text" placeholder="CA" className="w-full bg-[#050505] border border-white/5 rounded-2xl p-5 text-white placeholder:text-white/10 outline-none focus:border-white/20 transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">ZIP</label>
                    <input type="text" placeholder="94103" className="w-full bg-[#050505] border border-white/5 rounded-2xl p-5 text-white placeholder:text-white/10 outline-none focus:border-white/20 transition-all font-medium" />
                  </div>
                </div>
              </div>
            </section>

            {/* Order Summary */}
            <section>
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                       <CreditCard size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Order Summary</h2>
                 </div>
                 <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">INR</span>
              </div>

              <div className="bg-[#050505] rounded-[32px] border border-white/5 p-8 space-y-6">
                 {cart.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                       <span className="text-white/60 font-medium">{item.name} Unit x{item.qty}</span>
                       <span className="font-bold text-white">₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                 ))}
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60 font-medium">Shipping Protocol</span>
                    <span className="text-[10px] font-black text-[#22C55E] tracking-widest uppercase">Complimentary</span>
                 </div>
                 <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xl font-bold text-white tracking-tight">Total Amount</span>
                    <span className="text-4xl font-black text-white tracking-tighter italic">₹{total.toLocaleString()}</span>
                 </div>
              </div>
            </section>

            {/* CTA */}
            <div className="space-y-8">
              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-[28px] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-blue-600/20 group disabled:opacity-50"
              >
                <span className="text-lg tracking-[0.1em] uppercase">{loading ? "Synchronizing..." : "Complete Order"}</span>
                {!loading && <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                 <Lock size={14} fill="currentColor" />
                 <span>Encrypted 256-bit AES Connection</span>
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
