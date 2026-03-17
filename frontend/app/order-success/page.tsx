"use client";

import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Success Icon Animation */}
        <motion.div 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-32 h-32 bg-green-500/10 border border-green-500/20 rounded-[40px] flex items-center justify-center mx-auto mb-12 shadow-[0_0_80px_rgba(34,197,94,0.15)]"
        >
          <CheckCircle size={64} className="text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-black text-white mb-6 tracking-tight uppercase italic">
            Mission Successful
          </h1>
          <p className="text-white/40 font-medium mb-12 leading-relaxed">
            Your intelligence units have been deployed. Tactical tracking is now active. You will receive a notification when the fleet arrives at your coordinates.
          </p>

          <div className="grid gap-4">
            <button 
              onClick={() => router.push('/orders')}
              className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all active:scale-95 uppercase tracking-widest text-sm"
            >
              <Truck size={18} />
              Track Fleet
            </button>
            <Link 
              href="/"
              className="w-full py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
            >
              Return to Intelligence Core
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Tactical Footer */}
        <div className="mt-20 pt-8 border-t border-white/5 flex justify-center gap-8 opacity-20">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
              <Package size={12} />
              <span>Packaged</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
              <Truck size={12} />
              <span>Routed</span>
           </div>
        </div>
      </div>
    </div>
  );
}
