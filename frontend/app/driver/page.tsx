"use client";

import { motion } from 'framer-motion';
import { Truck, MapPin, Package, CheckCircle, Navigation, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      const res = await api.get('/delivery/my');
      setDeliveries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'driver' || user?.role === 'admin') {
      fetchDeliveries();
    }
  }, [user]);

  const updateStatus = async (deliveryId: string, status: string) => {
    try {
      // For status updates, we can pass dummy lat/lng for now
      await api.put(`/delivery/update/${deliveryId}/`, {
        lat: 40.7128,
        lng: -74.0060,
        status: status
      });
      fetchDeliveries();
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role !== 'driver' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500 text-center px-8">Access Denied. Drivers Only.</h1>
      </div>
    );
  }

  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');

  return (
    <div className="min-h-screen bg-background pt-32 px-8 pb-20">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 flex items-center justify-center">
              <img src="/logo.png" alt="QueryNexis" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1">Tactical Grid</h1>
              <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Autonomous Deployment Unit: {user.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-2xl shadow-lg shadow-white/5">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Deployment Active</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Active Tasks */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Navigation className="text-white" /> Current Missions
            </h2>

            {activeDeliveries.length === 0 ? (
              <div className="p-20 text-center bg-white/2 rounded-[3rem] border border-dashed border-white/5">
                <Truck className="mx-auto mb-4 opacity-20" size={48} />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">No active deliveries assigned.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {activeDeliveries.map(delivery => (
                  <motion.div 
                    key={delivery.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-[2.5rem] glassmorphism border border-white/10 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Truck size={120} />
                    </div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">Order #{delivery.order_id.slice(0, 8)}</h3>
                        <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Protocol: {delivery.status}</p>
                      </div>
                      <button 
                        onClick={() => window.location.href=`/orders/${delivery.order_id}`}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                      >
                        <ExternalLink size={20} />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8 relative z-10">
                       <div className="space-y-4">
                          <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                              <MapPin size={20} />
                            </div>
                            <div>
                               <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Destination</p>
                               <p className="text-sm font-bold">Neural District, Sector 7G</p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                              <Package size={20} />
                            </div>
                            <div>
                               <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Items</p>
                               <p className="text-sm font-bold">Encrypted AI Core x1</p>
                            </div>
                          </div>
                       </div>

                       <div className="flex flex-col justify-center gap-3">
                          {delivery.status === 'preparing' && (
                            <button 
                              onClick={() => updateStatus(delivery.id, 'out_for_delivery')}
                              className="w-full py-4 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-tighter text-lg shadow-xl shadow-white/5 active:scale-95 transition-all"
                            >
                              Commence Delivery
                            </button>
                          )}
                          {delivery.status === 'out_for_delivery' && (
                            <button 
                              onClick={() => updateStatus(delivery.id, 'delivered')}
                              className="w-full py-4 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-tighter text-lg shadow-xl shadow-white/10 active:scale-95 transition-all"
                            >
                              Mark Delivered
                            </button>
                          )}
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* History / Stats Sidebar */}
          <div className="space-y-8">
             <div className="p-8 rounded-[3rem] glassmorphism border border-white/5">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <BarChart3 className="text-white" /> Metrics
                </h3>
                <div className="space-y-6">
                   <div className="p-4 bg-white/5 rounded-2xl">
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Completed Today</p>
                     <p className="text-3xl font-black">{completedDeliveries.length}</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl">
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Avg. Delivery Time</p>
                     <p className="text-3xl font-black">12m</p>
                   </div>
                </div>
             </div>

             <div className="p-8 rounded-[3rem] glassmorphism border border-white/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <CheckCircle className="text-white" /> Recent History
                </h3>
                <div className="space-y-4">
                   {completedDeliveries.slice(0, 5).map(delivery => (
                     <div key={delivery.id} className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                        <span className="text-xs font-bold text-muted-foreground">#{delivery.order_id.slice(0,8)}</span>
                        <span className="text-[10px] font-black uppercase text-white/50 tracking-widest leading-none">Complete</span>
                     </div>
                   ))}
                   {completedDeliveries.length === 0 && (
                     <p className="text-xs text-muted-foreground italic text-center py-4">No completed tasks today.</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart3({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
