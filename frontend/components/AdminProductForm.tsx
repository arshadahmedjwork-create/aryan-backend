"use client";

import { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProductForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Hardware',
    price: '',
    image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/products/', {
        ...formData,
        price: parseFloat(formData.price)
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload(); 
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl bg-[#0a0a0a] rounded-[3rem] border border-white/10 p-10 relative z-10 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold mb-8">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Product Name</label>
            <input 
              required
              type="text" 
              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-primary transition-colors"
              placeholder="e.g., Master AI Chipset"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Price ($)</label>
              <input 
                required
                type="number" 
                step="0.01"
                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-primary transition-colors"
                placeholder="499.99"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Category</label>
              <select 
                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-primary transition-colors appearance-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Hardware">Hardware</option>
                <option value="Processors">Processors</option>
                <option value="Storage">Storage</option>
                <option value="AI Modules">AI Modules</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description</label>
            <textarea 
              required
              rows={3}
              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-primary transition-colors resize-none"
              placeholder="Explain why this upgrade is essential..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Image URL</label>
            <input 
              type="text" 
              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-primary transition-colors"
              placeholder="https://images.unsplash.com/..."
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || success}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${success ? 'bg-white text-black' : 'bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-xl shadow-white/5'}`}
          >
            {success ? <><Check /> Product Added</> : loading ? 'Adding Product...' : 'Confirm Upload'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
