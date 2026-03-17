"use client";

import { motion } from 'framer-motion';
import { Package, Truck, BarChart3, Plus, Search, UserCheck, Users, Zap } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminProductForm from '../../components/AdminProductForm';
import AdminOrderManager from '../../components/AdminOrderManager';
import AdminFleetManager from '../../components/AdminFleetManager';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'fleet' | 'logistics'>('metrics');

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <h1 className="text-2xl font-black text-red-500 uppercase tracking-tighter">Access Denied // Admin Only</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-[#2563EB] selection:text-white pt-24 pb-32">
       <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-12">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-xl flex items-center justify-center text-[#2563EB]">
                   <BarChart3 size={24} />
                </div>
                <div>
                   <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                      QueryNexis <span className="text-white/20">Admin</span>
                   </h1>
                </div>
             </div>
             <div className="flex items-center gap-6">
                <div className="relative">
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]" />
                   <div className="text-white/40 hover:text-white transition-colors">
                      <Search size={24} className="rotate-90" /> {/* Placeholder for Bell icon */}
                   </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden">
                   <img src="https://ui-avatars.com/api/?name=Admin+User&background=020617&color=fff" alt="Profile" />
                </div>
             </div>
          </header>

          <div className="mb-16">
             <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Executive Overview</h2>
             <p className="text-white/40 font-medium">Real-time logistics and revenue analytics.</p>
          </div>

          {/* Tactical Tabs */}
          <div className="bg-white/[0.03] border border-white/5 p-1 rounded-2xl flex mb-12">
             {['METRICS', 'FLEET', 'LOGISTICS'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase() as any)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === tab.toLowerCase() ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/60'}`}
                >
                  {tab}
                </button>
             ))}
          </div>

          <div className="space-y-8 mt-4">
             {activeTab === 'metrics' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                   {/* Revenue Card */}
                   <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-[40px] p-10 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-sm font-bold text-white/40">Total Revenue</span>
                         <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-lg border border-green-500/20">+12.5%</span>
                      </div>
                      <div className="text-5xl font-black text-white mb-10 tracking-tighter italic">
                         ₹1,240,500
                      </div>
                      {/* Sparse Wave Path */}
                      <div className="h-16 relative">
                         <svg className="w-full h-full text-blue-500 opacity-40" viewBox="0 0 400 64" fill="none">
                            <path d="M0 48C40 48 60 16 100 16C140 16 160 48 200 48C240 48 260 16 300 16C340 16 360 48 400 48" stroke="currentColor" strokeWidth="2" />
                         </svg>
                      </div>
                   </div>

                   {/* Fleet Density */}
                   <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-[40px] p-10">
                      <div className="flex justify-between items-start mb-8">
                         <div>
                            <span className="text-sm font-bold text-white/40">Active Fleet</span>
                            <div className="text-4xl font-black text-white mt-1">482 <span className="text-lg text-white/20 font-bold">/500 units</span></div>
                         </div>
                         <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg border border-red-500/20">-2.1%</span>
                      </div>
                      <div className="flex items-end gap-3 h-20">
                         {[0.4, 0.7, 0.3, 0.8, 0.5, 0.9].map((h, i) => (
                            <div 
                              key={i} 
                              style={{ height: h * 100 + "%" }} 
                              className={`flex-1 rounded-sm ${i === 5 ? 'bg-[#2563EB]' : 'bg-white/5'}`} 
                            />
                         ))}
                      </div>
                   </div>

                   {/* Delivery Rate */}
                   <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-[40px] p-10">
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-sm font-bold text-white/40">Delivery Rate</span>
                         <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-lg border border-green-500/20">+0.5%</span>
                      </div>
                      <div className="text-5xl font-black text-white mb-8">98.4%</div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: "98.4%" }} className="h-full bg-[#2563EB]" />
                      </div>
                      <div className="flex justify-between mt-4">
                         <span className="text-[10px] font-black text-[#2563EB] tracking-widest uppercase">Optimal</span>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'fleet' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                   <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-[48px] p-8 md:p-12">
                      <div className="flex items-center justify-between mb-12">
                         <h3 className="text-2xl font-black text-white">Live Fleet Status</h3>
                         <button className="text-[10px] font-black text-blue-500 tracking-widest uppercase">View All Units</button>
                      </div>

                      <div className="space-y-12">
                         <table className="w-full text-left">
                            <thead className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5">
                               <tr>
                                  <th className="pb-6">Vehicle ID</th>
                                  <th className="pb-6">Driver</th>
                                  <th className="pb-6 text-right">Status</th>
                               </tr>
                            </thead>
                            <tbody className="text-sm text-white/80">
                               {[
                                  { id: "QN-7721", name: "Alex Rivera", status: "In Transit", color: "text-green-500" },
                                  { id: "QN-4412", name: "Marcus Chen", status: "Loading", color: "text-yellow-500" },
                                  { id: "QN-9031", name: "Sarah Jenkins", status: "Off Duty", color: "text-white/20" }
                               ].map((u, i) => (
                                  <tr key={i} className="group">
                                     <td className="py-8 font-black uppercase tracking-tighter text-lg">{u.id}</td>
                                     <td className="py-8">
                                        <div className="flex items-center gap-4">
                                           <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                                              <img src={`https://ui-avatars.com/api/?name=${u.name}&background=0A0A0A&color=fff`} alt={u.name} />
                                           </div>
                                           <span className="font-bold text-white/60 group-hover:text-white transition-colors">{u.name}</span>
                                        </div>
                                     </td>
                                     <td className={`py-8 text-right font-black italic ${u.color}`}>{u.status}</td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'logistics' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                   <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-[48px] p-12">
                      <h3 className="text-2xl font-black text-white mb-12">Route Distribution</h3>
                      <div className="flex justify-center mb-16 relative">
                         {/* Donut Chart */}
                         <div className="w-64 h-64 rounded-full border-[24px] border-[#2563EB] relative flex items-center justify-center">
                            <div className="absolute inset-[-24px] border-[24px] border-white/5 rounded-full [mask-image:conic-gradient(#000_75%,transparent_0)]" />
                            <div className="text-center">
                               <div className="text-5xl font-black text-white italic">75%</div>
                               <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Urban</div>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-blue-500" />
                               <span className="text-xs font-bold text-white/60">Metropolitan Area</span>
                            </div>
                            <span className="text-sm font-black text-white italic">362 units</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-white/10" />
                               <span className="text-xs font-bold text-white/60">Regional Transport</span>
                            </div>
                            <span className="text-sm font-black text-white italic">120 units</span>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}
          </div>

          {/* System Optimized Badge */}
          <div className="mt-12 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-[32px] p-10 relative overflow-hidden group shadow-2xl shadow-blue-500/20">
             <div className="relative z-10">
                <h4 className="text-2xl font-black text-white mb-2 italic">System Optimized</h4>
                <p className="text-white/80 font-medium mb-8 leading-relaxed">
                   AI routing has reduced fuel consumption by 14% this month.
                </p>
                <button className="w-full py-4 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-black rounded-2xl uppercase tracking-widest transition-all">
                   Download Report
                </button>
             </div>
             <Zap size={120} fill="white" className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-1000" />
          </div>
       </div>

       {/* Bottom Navigation Mock */}
       <div className="fixed bottom-0 left-0 w-full bg-[#030303] border-t border-white/5 px-8 pt-4 pb-10 flex justify-between items-center z-50">
          {[
            { label: 'Home', icon: <Package size={20} /> },
            { label: 'Metrics', icon: <BarChart3 size={20} /> },
            { label: 'Fleet', icon: <Truck size={20} /> },
            { label: 'Settings', icon: <UserCheck size={20} /> }
          ].map((item, i) => (
             <div key={i} className={`flex flex-col items-center gap-1.5 ${i === 0 ? 'text-[#2563EB]' : 'text-white/20'}`}>
                {item.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
             </div>
          ))}
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
            <span className="text-primary font-black">₹{p.price}</span>
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
