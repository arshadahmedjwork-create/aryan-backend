"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Plus, X, ChevronRight, History, Shield, Mail, Lock } from 'lucide-react';
import api from '@/lib/api';

export default function AdminFleetManager() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', email: '', password: '' });

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/auth/drivers');
      setDrivers(res.data);
    } catch (e) {
      console.error('Fetch drivers failed', e);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchMissions = async (driver: any) => {
    setSelectedDriver(driver);
    setLoading(true);
    try {
      const res = await api.get(`/auth/drivers/${driver.id}/missions/`);
      setMissions(res.data);
    } catch (e) {
      console.error('Fetch missions failed', e);
    } finally {
      setLoading(false);
    }
  };

  const addDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/auth/register/driver`, 
        { full_name: newUnit.name, email: newUnit.email, role: 'driver' },
        { params: { password: newUnit.password } }
      );
      setShowAddUnit(false);
      setNewUnit({ name: '', email: '', password: '' });
      fetchDrivers();
    } catch (e) {
      console.error('Add driver failed', e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fleet Tactical</h2>
          <p className="text-sm text-muted-foreground mt-1">Operational unit management and status oversight.</p>
        </div>
        <button 
          onClick={() => setShowAddUnit(true)}
          className="px-6 py-3 bg-white text-black font-bold rounded-2xl flex items-center gap-2 hover:bg-neutral-200 transition-all"
        >
          <Plus size={20} /> Register Unit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {drivers.map(driver => (
          <motion.div 
            key={driver.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[2rem] glassmorphism border border-border hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => fetchMissions(driver)}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                {driver.full_name[0]}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</span>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">{driver.full_name}</h3>
            <p className="text-xs text-muted-foreground mb-4">{driver.email}</p>
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <History size={14} /> Mission Intelligence
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddUnit && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-lg bg-background border border-border rounded-[3rem] p-8 relative shadow-2xl"
            >
              <button onClick={() => setShowAddUnit(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full">
                <X size={24} />
              </button>
              <div className="mb-8">
                <h2 className="text-3xl font-black mb-2">Register Unit</h2>
                <p className="text-muted-foreground">Authorize a new tactical operative for QueryNexis.</p>
              </div>
              <form onSubmit={addDriver} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Unit Name</label>
                  <div className="relative">
                    <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. ALPHA-01"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                      value={newUnit.name}
                      onChange={e => setNewUnit({...newUnit, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Email Protocol</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input 
                      required
                      type="email" 
                      placeholder="unit@autonomiq.ai"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                      value={newUnit.email}
                      onChange={e => setNewUnit({...newUnit, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Encryption Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input 
                      required
                      type="password" 
                      placeholder="••••••••"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                      value={newUnit.password}
                      onChange={e => setNewUnit({...newUnit, password: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full h-16 bg-white text-black font-black rounded-2xl text-lg hover:bg-neutral-200 transition-all shadow-xl shadow-white/5">
                  Authorize Operative
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {selectedDriver && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl bg-background border border-border rounded-[3rem] p-8 relative shadow-2xl"
            >
              <button onClick={() => setSelectedDriver(null)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full">
                <X size={24} />
              </button>
              <div className="mb-8">
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">Unit Intelligence</span>
                <h2 className="text-3xl font-black mt-1">{selectedDriver.full_name}</h2>
                <p className="text-muted-foreground">{selectedDriver.email}</p>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {missions.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-muted-foreground font-bold tracking-widest text-sm uppercase">No Mission Logs Found</p>
                  </div>
                ) : (
                  missions.map(m => (
                    <div key={m.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Mission ID</p>
                        <p className="font-bold">#MS-{m.order_id.slice(0, 6).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Status</p>
                        <p className={`font-black uppercase text-xs ${m.status === 'delivered' ? 'text-green-500' : 'text-primary'}`}>{m.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
