"use client";

import { motion } from 'framer-motion';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Shield, 
  Settings, 
  LayoutGrid, 
  CheckCircle,
  ArrowLeft,
  Zap,
  Box
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function DriverHUD() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/delivery/my`).then(res => {
      const found = res.data.find((d: any) => d.id === id);
      setDelivery(found);
      setLoading(false);
    });
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/delivery/update/${id}/`, {
        lat: 40.7128,
        lng: -74.0060,
        status: status
      });
      router.refresh();
      // Refetch local state
      api.get(`/delivery/my`).then(res => {
        const found = res.data.find((d: any) => d.id === id);
        setDelivery(found);
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Zap className="text-white animate-pulse" size={48} />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <h1 className="text-white font-black text-2xl mb-4 italic">Mission Lost // Unrecognized Signal</h1>
        <button onClick={() => router.push('/driver')} className="text-blue-500 font-bold uppercase tracking-widest text-xs">Return to Grid</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030408] text-white selection:bg-blue-600 overflow-hidden relative">
      <div className="max-w-md mx-auto h-screen flex flex-col pt-12 pb-24 px-6 relative z-10">
        
        {/* HUD Header */}
        <header className="flex justify-between items-center mb-8">
           <button 
             onClick={() => router.push('/driver')}
             className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
           >
              <ArrowLeft size={18} />
           </button>
           <h2 className="text-sm font-black tracking-[0.3em] uppercase italic text-white/80">QueryNexis HUD</h2>
           <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center relative">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping absolute" />
              <img src={`https://ui-avatars.com/api/?name=${user?.full_name}&background=transparent&color=fff`} className="w-full h-full rounded-full" />
           </div>
        </header>

        {/* Neural Grid Visualizer */}
        <section className="mb-8 relative">
           <div className="bg-gradient-to-b from-[#1A1C23] to-[#0A0B10] border border-white/5 rounded-[40px] p-1 h-80 relative overflow-hidden group">
              {/* Grid SVG Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                       <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                       </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                 </svg>
              </div>
              
              {/* Sector Map Visualization (Abstract) */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-64 h-64 text-blue-500/40" viewBox="0 0 200 200" fill="none">
                    <path d="M40 60L80 40L160 80L140 160L60 140L40 60Z" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="80" cy="40" r="3" fill="currentColor" />
                    <circle cx="160" cy="80" r="3" fill="currentColor" />
                    <circle cx="140" cy="160" r="3" fill="currentColor" />
                    <circle cx="60" cy="140" r="3" fill="currentColor" />
                    <circle cx="40" cy="60" r="3" fill="#fff" className="animate-pulse" />
                 </svg>
              </div>

              <div className="absolute bottom-8 left-8">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-blue-400">Live Tracking Active</span>
                 </div>
                 <h3 className="text-2xl font-black italic tracking-tight uppercase">Sector 7-B Industrial</h3>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Ref: {delivery.order_id.slice(0, 8)}</p>
              </div>
           </div>
        </section>

        {/* Tactical Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-[#111319]/80 border border-white/5 rounded-3xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white/40">
                 <Clock size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">ETA</span>
              </div>
              <div className="flex items-end gap-1.5">
                 <span className="text-3xl font-black tracking-tighter italic">08:42</span>
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1.5">Min</span>
              </div>
           </div>
           <div className="bg-[#111319]/80 border border-white/5 rounded-3xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white/40">
                 <Navigation size={14} className="rotate-45" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Distance</span>
              </div>
              <div className="flex items-end gap-1.5">
                 <span className="text-3xl font-black tracking-tighter italic">3.3</span>
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1.5">KM</span>
              </div>
           </div>
        </div>

        {/* Mission Progress Indicator */}
        <div className="bg-[#111319]/80 border border-white/5 rounded-3xl p-8 mb-8">
           <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mission Progress</span>
              <span className="text-2xl font-black italic text-blue-500">65%</span>
           </div>
           <div className="space-y-4">
              <div className="text-sm font-bold tracking-tight">6.2km / 9.5km</div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: "65%" }} 
                   className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                 />
              </div>
           </div>
        </div>

        {/* Tactical Action Matrix */}
        <div className="flex flex-col gap-4 mt-auto">
           {delivery.status === 'preparing' || delivery.status === 'ready' ? (
             <button 
               onClick={() => updateStatus('out_for_delivery')}
               className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-blue-600/20 group"
             >
               <Zap size={24} fill="currentColor" />
               <span className="text-lg tracking-widest uppercase">Initiate Delivery</span>
             </button>
           ) : (
             <button 
               onClick={() => updateStatus('delivered')}
               className="w-full py-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95 group"
             >
               <CheckCircle size={24} />
               <span className="text-lg tracking-widest uppercase">Mission Complete</span>
             </button>
           )}
        </div>

        {/* Global HUD Nav */}
        <div className="fixed bottom-0 left-0 w-full bg-[#030408]/95 border-t border-white/5 px-10 pt-4 pb-10 flex justify-between items-center z-50 backdrop-blur-xl">
           <LayoutGrid size={22} className="text-blue-500" />
           <MapPin size={22} className="text-white/20" />
           <Shield size={22} className="text-white/20" />
           <Settings size={22} className="text-white/20" />
        </div>

      </div>

      {/* Atmospheric Background Noise */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
         <div className="w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full" />
    </div>
  );
}
