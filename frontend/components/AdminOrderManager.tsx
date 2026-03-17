"use client";

import { useState, useEffect } from 'react';
import { Truck, CheckCircle, Clock, ChevronRight, User } from 'lucide-react';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminOrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, driversRes] = await Promise.all([
          api.get('/orders/'),
          api.get('/auth/drivers') // Need to add this endpoint or similar filtering
        ]);
        setOrders(ordersRes.data);
        setDrivers(driversRes.data || [
           { id: '00000000-0000-0000-0000-000000000003', full_name: 'Autonomous Bot v2' }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      await api.post(`/delivery/assign/${orderId}?driver_id=${driverId}`);
      // Refresh orders
      const res = await api.get('/orders/');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const otherOrders = orders.filter(o => o.status !== 'pending');

  return (
    <div className="space-y-12">
      {/* Pending Orders - Call to Action */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Awaiting Bot Assignment</h2>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="p-12 text-center bg-white/2 rounded-[2.5rem] border border-dashed border-white/5 text-muted-foreground">
            No pending orders at the moment.
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingOrders.map(order => (
              <div key={order.id} className="p-8 rounded-[2.5rem] glassmorphism border border-white/10 flex flex-wrap items-center justify-between gap-8 group">
                <div className="flex gap-6 items-center">
                  <div className="p-4 bg-white/10 rounded-2xl text-white border border-white/20">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-muted-foreground text-sm">₹{order.total_price.toFixed(2)} • {new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-1 max-w-md">
                   <div className="flex-1 space-y-2">
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-2">Select Delivery NPC</p>
                     <select 
                       className="w-full bg-white/5 border border-border rounded-xl p-3 outline-none focus:border-primary text-sm"
                       onChange={(e) => assignDriver(order.id, e.target.value)}
                       defaultValue=""
                     >
                       <option value="" disabled>Choose a driver...</option>
                       {drivers.map(d => (
                         <option key={d.id} value={d.id}>{d.full_name}</option>
                       ))}
                     </select>
                   </div>
                    <button className="p-4 bg-white text-black rounded-2xl mt-6 hover:bg-neutral-200 transition-colors">
                     <Truck size={20} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Orders */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <CheckCircle className="text-white" size={24} /> 
          In-transit & Completed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherOrders.map(order => (
            <div key={order.id} className="p-6 rounded-3xl glassmorphism border border-border hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold">#{order.id.slice(0,8)}</h4>
                <div className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold rounded-full uppercase border border-white/20">
                  {order.status}
                </div>
              </div>
              <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                 <p className="flex justify-between"><span>Items:</span> <span className="text-white font-bold">{order.order_items?.length || 0}</span></p>
                  <p className="flex justify-between"><span>Total:</span> <span className="text-white font-bold">₹{order.total_price.toFixed(2)}</span></p>
                  {order.status === 'cancelled' && order.cancellation_reason && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">Cancellation Logic</p>
                      <p className="text-white text-xs italic">"{order.cancellation_reason}"</p>
                    </div>
                  )}
              </div>
              <button 
                onClick={() => window.location.href=`/orders/${order.id}`}
                className="w-full py-3 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                Track Live <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
