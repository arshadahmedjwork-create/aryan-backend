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
    <div className="min-h-screen bg-background pt-32 px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">QueryNexis Selects</h1>
            <p className="text-muted-foreground">Actionable intelligence for your catalog.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search items..." 
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-white outline-none transition-colors" 
              />
            </div>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-[4/5] rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group relative rounded-3xl glassmorphism overflow-hidden cursor-pointer"
              >
                <div className="aspect-[4/5] bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="text-white/5 font-black text-6xl uppercase">{p.name[0]}</div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold group-hover:text-white transition-colors">{p.name}</h3>
                    <span className="text-lg font-black">₹{p.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-4">{p.description}</p>
                  
                  <button 
                    onClick={() => addToCart(p)}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <Plus size={18} /> Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
