"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import api from '@/lib/api';

import { useAuth } from '@/lib/auth';

export default function AIChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize with role-based welcome
  useState(() => {
    const role = user?.role || 'customer';
    const welcome = role === 'admin' 
      ? 'Welcome to Command Intelligence. Tactical metrics and fleet status are available for analysis.' 
      : role === 'driver'
      ? 'Tactical Coordination active. Ready for mission briefing and route optimization.'
      : 'Hello! I am QueryNexis Concierge. How can I assist with your orders today?';
    
    setMessages([{ role: 'assistant', content: welcome }]);
  });

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: input });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the agents. Please check if you're logged in." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 z-50 text-primary-foreground"
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-28 right-8 w-[400px] h-[600px] glassmorphism rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-white flex justify-between items-center text-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold">QueryNexis Intelligence</h3>
                  <div className="flex items-center gap-1.5 text-[10px] opacity-80 font-black uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.5)]"></span> Active
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-white text-black rounded-tr-none shadow-lg' 
                      : 'bg-white/5 border border-white/10 rounded-tl-none text-white backdrop-blur-md'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none animate-pulse">...</div>
                </div>
              )}

              {/* Quick Actions */}
              {!loading && messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {user?.role === 'admin' ? (
                    <>
                      <button onClick={() => setInput('Show revenue summary')} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all">Revenue Analytics</button>
                      <button onClick={() => setInput('Fleet tactical status')} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all">Fleet Status</button>
                    </>
                  ) : user?.role === 'driver' ? (
                    <>
                      <button onClick={() => setInput('My active missions')} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">My Missions</button>
                      <button onClick={() => setInput('Sync coordinates')} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">Sync GPS</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setInput('Track my order')} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">Track Order</button>
                      <button onClick={() => setInput('I want to cancel an order')} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">Order Cancellation</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Inquire about orders, metrics..." 
                  className="w-full pl-4 pr-12 py-3 bg-white/5 border border-border rounded-xl outline-none focus:border-primary transition-colors text-sm"
                />
                <button 
                  onClick={sendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg text-black hover:bg-neutral-200 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
