"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle, Truck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      api.get('/orders').then(res => {
        setOrders(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="text-white" size={18} />;
      case 'shipped': return <Truck className="text-white" size={18} />;
      default: return <Clock className="text-muted-foreground" size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 px-8 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary">
            <Package size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Order History</h1>
            <p className="text-muted-foreground">Track and manage your autonomous purchases.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 w-full bg-white/5 rounded-3xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            <Link href="/products" className="text-white font-bold mt-4 inline-block hover:underline">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  href={`/orders/${order.id}`}
                  className="p-6 rounded-3xl glassmorphism border border-white/5 flex items-center justify-between hover:border-white/30 transition-all group"
                >
                  <div className="flex gap-6 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                      <Package className="text-muted-foreground group-hover:text-white transition-colors" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total</p>
                      <p className="text-lg font-black text-white">₹{order.total_price.toFixed(2)}</p>
                    </div>
                    <ChevronRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
