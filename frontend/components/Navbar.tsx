"use client";

import Link from 'next/link';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, cart } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const cartCount = cart.reduce((acc: number, item: any) => acc + item.qty, 0);

  return (
    <nav className="fixed top-0 w-full z-50 glassmorphism px-8 py-4 flex justify-between items-center border-b border-white/5">
      <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-500">
        AutonomIQ
      </Link>
      
      <div className="flex gap-8 items-center text-sm font-medium">
        <Link href="/products" className="hover:text-primary transition-colors hidden md:block">Shop</Link>
        
        <Link href="/cart" className="relative group">
          <ShoppingCart size={20} className="group-hover:text-blue-400 transition-colors" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-blue-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">
                {user.full_name?.[0] || 'U'}
              </div>
              <span className="hidden sm:inline">{user.full_name || 'User'}</span>
            </button>
            
            <AnimatePresence>
              {showProfile && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl glassmorphism border border-white/10 p-2 z-50 shadow-2xl"
                  >
                    <div className="px-4 py-2 border-b border-white/5 mb-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Role: {user.role}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl transition-colors text-blue-400 font-bold">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl transition-colors">
                      My Orders
                    </Link>
                    {user.role === 'driver' && (
                      <Link href="/driver" className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl transition-colors text-green-400 font-bold">
                        Driver Hub
                      </Link>
                    )}
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-red-400 rounded-xl transition-colors mt-1"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link href="/login" className="px-5 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform active:scale-95">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
