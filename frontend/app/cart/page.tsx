"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function CartPage() {
  const { cart, removeFromCart, updateQty } = useAuth();

  const total = cart.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-background pt-32 px-8 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Your Cart</h1>
            <p className="text-muted-foreground">{cart.length} items ready for autonomous delivery</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item: any, i: number) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-3xl glassmorphism flex gap-6 items-center group"
                >
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-black text-blue-500/20 overflow-hidden">
                     {item.image_url ? (
                       <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                     ) : (
                       item.name[0]
                     )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-blue-500 font-black">${item.price}</p>
                  </div>

                  <div className="flex items-center gap-4 bg-white/5 rounded-xl p-1 px-3">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1 hover:text-blue-400 cursor-pointer"><Minus size={16} /></button>
                    <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1 hover:text-blue-400 cursor-pointer"><Plus size={16} /></button>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors cursor-pointer">
                    <X size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {cart.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <ShoppingBag className="mx-auto mb-4 opacity-20" size={64} />
                <p className="text-muted-foreground">Your cart is currently empty.</p>
                <Link href="/products" className="text-blue-500 font-bold mt-4 inline-block hover:underline">Start Shopping</Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] glassmorphism border border-blue-500/20 relative overflow-hidden sticky top-32">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full"></div>
              
              <h3 className="text-xl font-bold mb-8">Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-green-400 font-bold">FREE</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between text-2xl font-black">
                  <span>Total</span>
                  <span className="text-blue-500">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link 
                href={cart.length > 0 ? "/checkout" : "#"}
                className={`w-full py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 ${cart.length === 0 && 'opacity-50 cursor-not-allowed'}`}
              >
                Checkout <Zap size={18} fill="currentColor" />
              </Link>
              
              <p className="text-[10px] text-center mt-6 text-muted-foreground uppercase tracking-widest font-medium italic">
                Securely handled by AI Orchestrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
