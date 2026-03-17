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
import { useAuth } from '../../../../lib/auth';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';

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
    <div className="min-h-screen bg-[#030408] text-white selection:bg-blue-600 overflow-y-auto relative custom-scrollbar">
      <div className="max-w-7xl mx-auto min-h-screen flex flex-col pt-12 pb-32 px-8 md:px-12 relative z-10">
        
        {/* HUD Header */}
        <header className="flex justify-between items-center mb-12">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => router.push('/driver')}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all group"
              >
                 <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                 <h2 className="text-sm font-black tracking-[0.4em] uppercase italic text-white/40">QueryNexis Tactical HUD</h2>
                 <p className="text-xl font-bold tracking-tight">Mission: {delivery.order_id.slice(0, 8)}</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4 px-6 py-3 bg-blue-600/5 border border-blue-500/20 rounded-2xl relative">
              <div className="text-right mr-4 hidden md:block">
                 <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Operator</p>
                 <p className="text-sm font-bold text-white">{user?.full_name || "Nexus Unit"}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center relative">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping absolute" />
                 <img src={`https://ui-avatars.com/api/?name=${user?.full_name}&background=transparent&color=fff`} className="w-full h-full rounded-full" />
              </div>
           </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 flex-1 items-start">
           {/* Neural Grid Visualizer */}
           <section className="relative h-full min-h-[400px]">
              <div className="bg-gradient-to-b from-[#1A1C23] to-[#0A0B10] border border-white/5 rounded-[48px] p-1 h-full relative overflow-hidden group shadow-2xl">
                 {/* Grid SVG Background */}
                 <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                       <defs>
                          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                             <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
                          </pattern>
                       </defs>
                       <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                 </div>
                 
                 {/* Sector Map Visualization (Abstract) */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-full h-full max-w-md text-blue-500/20" viewBox="0 0 200 200" fill="none">
                       <path d="M40 60L80 40L160 80L140 160L60 140L40 60Z" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
                       <circle cx="80" cy="40" r="4" fill="currentColor" />
                       <circle cx="160" cy="80" r="4" fill="currentColor" />
                       <circle cx="140" cy="160" r="4" fill="currentColor" />
                       <circle cx="60" cy="140" r="4" fill="currentColor" />
                       <motion.circle 
                         cx="40" cy="60" r="6" 
                         fill="#fff" 
                         animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }} 
                         transition={{ duration: 2, repeat: Infinity }}
                       />
                    </svg>
                 </div>

                 <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                    <div>
                       <div className="flex items-center gap-3 mb-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                          <span className="text-xs font-black tracking-[0.2em] uppercase text-blue-400">Tactical Scan Active</span>
                       </div>
                       <h3 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Sector 7-B</h3>
                       <p className="text-sm text-white/40 font-bold uppercase tracking-[0.3em]">Industrial District</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Status Protocol</p>
                       <p className="text-lg font-black text-blue-500 uppercase italic tracking-tighter">{delivery.status}</p>
                    </div>
                 </div>
              </div>
           </section>

           <div className="space-y-8 flex flex-col justify-center">
              {/* Tactical Metrics Grid */}
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-[#111319]/80 border border-white/5 rounded-[32px] p-8 flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center gap-3 text-white/40">
                       <Clock size={16} />
                       <span className="text-xs font-black uppercase tracking-widest">Arrival ETA</span>
                    </div>
                    <div className="flex items-end gap-2">
                       <span className="text-5xl font-black tracking-tighter italic">08:42</span>
                       <span className="text-xs font-black text-white/20 uppercase tracking-widest mb-2">Minutes</span>
                    </div>
                 </div>
                 <div className="bg-[#111319]/80 border border-white/5 rounded-[32px] p-8 flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center gap-3 text-white/40">
                       <Navigation size={16} className="rotate-45" />
                       <span className="text-xs font-black uppercase tracking-widest">Vector Distance</span>
                    </div>
                    <div className="flex items-end gap-2">
                       <span className="text-5xl font-black tracking-tighter italic">3.3</span>
                       <span className="text-xs font-black text-white/20 uppercase tracking-widest mb-2">KM</span>
                    </div>
                 </div>
              </div>

              {/* Mission Progress Indicator */}
              <div className="bg-[#111319]/80 border border-white/5 rounded-[32px] p-10 shadow-xl">
                 <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                       <Box size={20} className="text-blue-500" />
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mission Saturation</span>
                    </div>
                    <span className="text-4xl font-black italic text-blue-500 tracking-tighter">65%</span>
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <p className="text-lg font-bold tracking-tight">6.2km <span className="text-white/20">/ 9.5km Total</span></p>
                       <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Optimal Path Calculation Active</p>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                       <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: "65%" }} 
                         className="h-full bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]" 
                       />
                    </div>
                 </div>
              </div>

              {/* Tactical Action Matrix */}
              <div className="grid sm:grid-cols-2 gap-4">
                 {delivery.status === 'preparing' || delivery.status === 'ready' ? (
                   <button 
                     onClick={() => updateStatus('out_for_delivery')}
                     className="sm:col-span-2 w-full py-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[32px] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-blue-600/30 group"
                   >
                     <Zap size={28} fill="currentColor" />
                     <span className="text-xl tracking-widest uppercase">Start Delivery</span>
                   </button>
                 ) : delivery.status === 'out_for_delivery' ? (
                   <>
                      <button 
                        onClick={() => updateStatus('delivered')}
                        className="w-full py-8 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-[32px] flex items-center justify-center gap-4 transition-all active:scale-95 group"
                      >
                        <CheckCircle size={24} />
                        <span className="text-lg tracking-widest uppercase">Mark Delivered</span>
                      </button>
                      <button 
                        onClick={() => router.push('/driver')}
                        className="w-full py-8 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-[32px] flex items-center justify-center gap-4 transition-all active:scale-95 group opacity-50"
                      >
                        <Settings size={22} />
                        <span className="text-lg tracking-widest uppercase">Emergency abort</span>
                      </button>
                   </>
                 ) : (
                    <div className="sm:col-span-2 p-8 bg-blue-600/10 border border-blue-500/20 rounded-[32px] text-center">
                       <CheckCircle size={48} className="mx-auto text-blue-500 mb-4" />
                       <h4 className="text-2xl font-black italic uppercase tracking-tighter">Mission Accomplished</h4>
                       <button 
                         onClick={() => router.push('/driver')}
                         className="mt-6 text-sm font-black text-blue-500 uppercase tracking-widest hover:text-blue-400"
                       >
                          Return to Hub Overview
                       </button>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Global HUD Nav */}
        <div className="fixed bottom-0 left-0 w-full bg-[#030408]/95 border-t border-white/5 px-10 pt-4 pb-10 flex justify-center items-center z-50 backdrop-blur-xl gap-12">
           <LayoutGrid size={24} className="text-blue-500 cursor-pointer" />
           <MapPin size={24} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
           <Shield size={24} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
           <Settings size={24} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
        </div>

      </div>

      {/* Atmospheric Background Noise */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
         <div className="w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:32px_32px]" />
      </div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[160px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[160px] rounded-full" />
    </div>
  );
}
