"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Info } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function AIAgentPulse() {
  const { user } = useAuth();
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkPulse = async () => {
      try {
        const res = await api.get('/ai/pulse');
        if (res.data.alert) {
          // If it's a new alert we haven't shown yet
          if (!activeAlert || activeAlert.id !== res.data.alert.id) {
            setActiveAlert(res.data.alert);
            setShowNotification(true);
            
            // Auto hide after 10 seconds
            setTimeout(() => setShowNotification(false), 10000);
          }
        }
      } catch (e) {
        console.error('Pulse check failed', e);
      }
    };

    const interval = setInterval(checkPulse, 30000); // Check every 30s
    checkPulse();

    return () => clearInterval(interval);
  }, [user, activeAlert]);

  if (!user) return null;

  return (
    <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {showNotification && activeAlert && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-4 rounded-2xl bg-black/90 border border-primary/30 backdrop-blur-xl shadow-2xl shadow-primary/20 max-w-sm pointer-events-auto"
          >
            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-lg bg-primary/10">
                {activeAlert.severity === 'critical' ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                ) : (
                  <Info className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-1">Autonomous Insight</p>
                <p className="text-sm text-white font-medium leading-relaxed">{activeAlert.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          scale: showNotification ? [1, 1.1, 1] : 1,
          boxShadow: showNotification 
            ? ["0 0 0px var(--primary)", "0 0 40px var(--primary)", "0 0 0px var(--primary)"] 
            : "0 0 20px rgba(255,255,255,0.05)"
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`p-4 rounded-full bg-black border ${showNotification ? 'border-primary' : 'border-white/10'} pointer-events-auto shadow-2xl relative group`}
      >
        <Brain className={`w-6 h-6 ${showNotification ? 'text-primary' : 'text-white/40'} group-hover:text-primary transition-colors`} />
        
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl -z-10 group-hover:bg-primary/40 transition-all" />
      </motion.div>
    </div>
  );
}
