"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, X, ChevronRight, Check } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToCart } = useAuth();

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  const handleDeploy = async () => {
    if (!selectedProduct) return;
    setIsAdding(true);
    
    // Simulate tactical deployment
    await new Promise(r => setTimeout(r, 800));
    
    // Add to cart multiple times based on quantity
    for(let i=0; i < quantity; i++) {
      addToCart(selectedProduct);
    }
    
    setIsAdding(false);
    setIsSuccess(true);
    
    // Close modal after success feedback (snappier)
    setTimeout(() => {
      setSelectedProduct(null);
      setIsSuccess(false);
      setQuantity(1);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#000000] pt-24 px-4 md:px-8 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-16">
           <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase">
             Product Catalog
           </h1>
           <div className="flex flex-wrap gap-4">
             {["Featured", "New Arrivals", "Best Sellers"].map((filter) => (
               <button
                 key={filter}
                 className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black text-white/40 hover:text-white hover:border-white/20 transition-all uppercase tracking-[0.2em]"
               >
                 {filter}
               </button>
             ))}
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-96 rounded-[40px] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-[#0A0A0A] rounded-[48px] border border-white/[0.05] overflow-hidden flex flex-col hover:border-white/10 transition-all shadow-2xl"
              >
                {/* Visualization Area */}
                <div className="relative h-80 bg-[#050505] border-b border-white/[0.05] flex items-center justify-center p-12 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />

                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="relative z-10 max-h-full object-contain group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <div className="relative z-10 w-48 h-48 border border-white/5 rounded-full flex items-center justify-center">
                      <div className="w-32 h-32 border border-white/10 rounded-full animate-pulse flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-12">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-3xl font-black text-white tracking-tight uppercase">{p.name}</h3>
                    <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  <p className="text-base text-white/40 leading-relaxed mb-10 font-medium">
                    {p.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-10 border-t border-white/[0.05]">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Price</span>
                       <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-white/40">₹</span>
                          <span className="text-3xl font-black text-white tracking-tight">
                            {p.price.toLocaleString()}
                          </span>
                       </div>
                    </div>

                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="px-10 py-5 bg-white text-black hover:bg-neutral-200 font-black rounded-3xl flex items-center gap-4 transition-all active:scale-95 shadow-2xl uppercase tracking-wider text-xs"
                    >
                      <Plus size={18} strokeWidth={3} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Product Details Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-[#0F0F0F] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <div className="grid md:grid-cols-2">
                   {/* Left side: Product Image */}
                   <div className="bg-[#050505] p-16 flex items-center justify-center border-r border-white/5">
                      {selectedProduct.image_url ? (
                         <motion.img 
                           initial={{ scale: 0.9, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           src={selectedProduct.image_url} 
                           className="w-full h-auto object-contain max-h-[400px]" 
                         />
                      ) : (
                         <BoxIcon className="w-32 h-32 text-white/10" />
                      )}
                   </div>

                   {/* Right side: Product Actions */}
                   <div className="p-16 flex flex-col justify-between">
                      <div>
                         <div className="flex justify-between items-start mb-10">
                            <div>
                               <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-3">{selectedProduct.name}</h2>
                               <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                  {selectedProduct.category || "General"}
                               </span>
                            </div>
                            <button 
                              onClick={() => setSelectedProduct(null)}
                              className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all"
                            >
                               <X size={20} />
                            </button>
                         </div>

                         <div className="mb-12">
                            <p className="text-lg text-white/40 leading-relaxed font-medium">
                               {selectedProduct.description}
                            </p>
                         </div>

                         <div className="space-y-8">
                            <div className="flex items-center justify-between">
                               <span className="text-sm font-black uppercase tracking-widest text-white/20">Set Quantity</span>
                               <div className="flex items-center gap-8 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
                                  <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold text-xl"
                                  >
                                     -
                                  </button>
                                  <span className="text-xl font-black text-white min-w-[20px] text-center">{quantity}</span>
                                  <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold text-xl"
                                  >
                                     +
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between gap-12">
                         <div className="flex flex-col min-w-fit">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Subtotal</span>
                            <div className="flex items-baseline gap-1">
                               <span className="text-sm font-bold text-white/40">₹</span>
                               <span className="text-5xl font-black text-white tracking-tighter">
                                 {(selectedProduct.price * quantity).toLocaleString()}
                               </span>
                            </div>
                         </div>
                         <button
                           onClick={handleDeploy}
                           disabled={isAdding || isSuccess}
                           className={`flex-1 min-h-[80px] px-12 py-6 rounded-3xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-4 transition-all active:scale-95 ${
                             isSuccess 
                             ? 'bg-green-600 text-white' 
                             : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xl shadow-blue-500/20'
                           } ${isAdding ? 'opacity-70 cursor-wait' : ''}`}
                         >
                           {isAdding ? (
                              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                           ) : isSuccess ? (
                              <Check size={20} strokeWidth={3} />
                           ) : (
                              <Plus size={20} strokeWidth={3} />
                           )}
                           {isSuccess ? 'Added to Cart' : isAdding ? 'Adding...' : 'Add to Cart'}
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BoxIcon({ className }: { className?: string }) {
   return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
         <path d="m3.3 7 8.7 5 8.7-5" />
         <path d="M12 22V12" />
      </svg>
   );
}
