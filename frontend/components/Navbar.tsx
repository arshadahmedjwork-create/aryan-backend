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
    <nav className="fixed top-0 w-full z-50 glassmorphism px-8 py-4 flex justify-between items-center border-b border-border">
      <Link href="/" className="flex items-center">
        <img src="/logo.png" alt="QueryNexis" className="h-10 w-auto" />
      </Link>
      
      <div className="flex gap-8 items-center text-sm font-medium">
        <Link href="/products" className="hover:text-primary transition-colors hidden md:block">Shop</Link>
        
        <Link href="/cart" className="relative group">
          <ShoppingCart size={20} className="group-hover:text-white transition-colors" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black"
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all shadow-lg shadow-primary/5"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[12px] text-primary-foreground font-black shadow-inner">
                {user.full_name?.[0] || 'U'}
              </div>
              <span className="hidden sm:inline font-semibold text-primary">{user.full_name || 'User'}</span>
            </button>
            
            <AnimatePresence>
              {showProfile && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl glassmorphism border border-primary/20 p-2 z-50 shadow-2xl overflow-hidden"
                  >
                   <div className="px-4 py-3 bg-primary/5 border-b border-primary/10 mb-2">
                      <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black">Account Role</p>
                      <p className="text-sm font-bold mt-1 text-foreground capitalize">{user.role}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 rounded-xl transition-colors text-primary font-bold">
                        Admin Dashboard
                      </Link>
                    )}
                    {user.role === 'customer' && (
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl transition-colors">
                        My Orders
                      </Link>
                    )}
                    {user.role === 'driver' && (
                      <Link href="/driver" className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl transition-colors text-white font-bold italic">
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
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/login" className="px-5 py-2.5 bg-[#2563EB] text-white rounded-xl font-bold hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-blue-600/20">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
