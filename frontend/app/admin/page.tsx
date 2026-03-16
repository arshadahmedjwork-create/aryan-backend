"use client";

import { motion } from 'framer-motion';
import { Package, Truck, BarChart3, Plus, Search, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AdminProductForm from '@/components/AdminProductForm';
import AdminOrderManager from '@/components/AdminOrderManager';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('orders');
  const [showProductForm, setShowProductForm] = useState(false);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500 text-center px-8">Access Denied. Admins Only.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">QueryNexis Intelligence</h1>
            <p className="text-muted-foreground mt-2">Autonomous Operations Dashboard</p>
          </div>
          
          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-white/5'}`}
            >
              <Truck size={18} /> Orders
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${activeTab === 'products' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-white/5'}`}
            >
              <Package size={18} /> Inventory
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-white/5'}`}
            >
              <BarChart3 size={18} /> Revenue
            </button>
          </div>
        </div>

        <section className="space-y-8">
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <AdminOrderManager />
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Product Catalog</h2>
                <button 
                  onClick={() => setShowProductForm(true)}
                  className="px-6 py-3 bg-white text-black font-bold rounded-2xl flex items-center gap-2 hover:bg-neutral-200 transition-all shadow-xl shadow-white/5"
                >
                  <Plus size={20} /> Add Product
                </button>
              </div>
              <AdminProductListing onEdit={() => {}} />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-8">
                <div className="p-8 rounded-[2.5rem] glassmorphism border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Total Revenue</p>
                  <h3 className="text-4xl font-black text-primary">$12,840.00</h3>
                  <p className="text-xs text-green-400 mt-2 font-bold">+14% from last week</p>
                </div>
                <div className="p-8 rounded-[2.5rem] glassmorphism border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Orders Today</p>
                  <h3 className="text-4xl font-black">24</h3>
                  <p className="text-xs text-primary mt-2 font-bold">8 awaiting bot assignment</p>
                </div>
                <div className="p-8 rounded-[2.5rem] glassmorphism border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Delivery NPCs</p>
                  <h3 className="text-4xl font-black">12</h3>
                  <p className="text-xs text-muted-foreground mt-2 font-bold">85% efficiency rate</p>
                </div>
            </motion.div>
          )}
        </section>

        {showProductForm && (
          <AdminProductForm onClose={() => setShowProductForm(false)} />
        )}
      </div>
    </div>
  );
}

function AdminProductListing({ onEdit }: { onEdit: (p: any) => void }) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(p => (
        <div key={p.id} className="p-6 rounded-3xl glassmorphism border border-border group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg">{p.name}</h3>
            <span className="text-primary font-black">${p.price}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{p.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{p.category}</span>
            <button className="text-sm font-bold text-primary hover:text-white transition-colors">Edit Details</button>
          </div>
        </div>
      ))}
    </div>
  );
}
