"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
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
  const { addToCart } = useAuth();

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] pt-24 px-4 md:px-8 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Products
          </h1>

          <div className="flex flex-wrap gap-3">
            {["LATEST RELEASE", "BENCHMARKED", "OPEN WEIGHTS"].map((filter) => (
              <button
                key={filter}
                className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/60 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-96 rounded-[32px] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-[#0A0A0A] rounded-[32px] border border-white/[0.05] overflow-hidden flex flex-col"
              >
                {/* Visualization Area */}
                <div className="relative h-64 bg-[#050505] border-b border-white/[0.05] flex items-center justify-center p-8 overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent blur-3xl" />
                  </div>

                  {/* Badge */}
                  <div className="absolute top-6 left-6 px-3 py-1 bg-white/5 border border-white/10 rounded-md">
                    <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">
                      {p.category || "FOUNDATION"}
                    </span>
                  </div>

                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="relative z-10 max-h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="relative z-10 w-48 h-48 border border-white/5 rounded-full flex items-center justify-center">
                      <div className="w-32 h-32 border border-white/10 rounded-full animate-pulse flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-8 pb-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{p.name}</h3>
                    <button className="p-1.5 bg-white/5 rounded-full text-white/30 hover:text-white transition-colors">
                      <Plus className="rotate-45" size={18} /> {/* Info/Close placeholder like icon */}
                    </button>
                  </div>

                  <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-[90%] font-medium">
                    {p.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/[0.05]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-white/40">₹</span>
                      <span className="text-2xl font-bold text-white leading-none">
                        {p.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                    >
                      <Plus size={18} className="text-white" />
                      <span className="text-xs tracking-wider uppercase">Deploy to Cart</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
