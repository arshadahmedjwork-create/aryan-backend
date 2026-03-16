"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Truck, MapPin, Package, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await api.get(`/orders/${id}`);
        setOrder(orderRes.data);
        
        try {
          const deliveryRes = await api.get(`/delivery/track/${id}`);
          setDelivery(deliveryRes.data);
        } catch (e) {
          // Delivery might not be assigned yet
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen pt-40 text-center">Loading tracker...</div>;
  if (!order) return <div className="min-h-screen pt-40 text-center">Order not found</div>;

  const steps = [
    { label: 'Confirmed', sub: 'Order received', active: true, done: true },
    { label: 'Processing', sub: 'Preparing for shipment', active: order.status !== 'pending', done: ['shipped', 'delivered'].includes(order.status) },
    { label: 'On its way', sub: 'Out for delivery', active: order.status === 'shipped', done: order.status === 'delivered' },
    { label: 'Delivered', sub: 'Reached destination', active: order.status === 'delivered', done: order.status === 'delivered' }
  ];

  return (
    <div className="min-h-screen bg-background pt-32 px-8 pb-20">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/orders')}
          className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to History
        </button>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <header className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">Tracking</h1>
                <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Order ID: {id}</p>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-full text-white font-bold border border-white/20">
                {order.status.toUpperCase()}
              </div>
            </header>

            {/* Progress Stepper */}
            <div className="p-8 rounded-[2.5rem] glassmorphism border border-white/5 space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-6 relative">
                  {i < steps.length - 1 && (
                    <div className={`absolute left-4 top-10 w-0.5 h-10 ${step.done ? 'bg-white' : 'bg-white/10'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${step.done ? 'bg-white text-black' : step.active ? 'bg-white/10 text-white border border-white' : 'bg-white/5 text-white/20'}`}>
                    {step.done ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div>
                    <h3 className={`font-bold ${step.active ? 'text-white' : 'text-white/20'}`}>{step.label}</h3>
                    <p className="text-sm text-muted-foreground">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Map / Info */}
            {delivery && (
              <div className="p-8 rounded-[2.5rem] bg-white text-black shadow-2xl shadow-white/5 relative overflow-hidden">
                <Truck className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Truck /> Real-time Delivery Status
                </h3>
                <div className="grid grid-cols-2 gap-8 relative z-10">
                  <div>
                    <p className="text-xs uppercase opacity-60 font-bold tracking-widest mb-1">Driver</p>
                    <p className="text-lg font-bold">Autonomous Bot v2</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase opacity-60 font-bold tracking-widest mb-1">ETA</p>
                    <p className="text-lg font-bold">12:45 PM Today</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] glassmorphism border border-white/5">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Package size={18} /> Order Summary
              </h3>
              <div className="space-y-4 text-sm">
                {order.order_items?.map((item: any) => (
                   <div key={item.id} className="flex justify-between">
                     <span className="text-muted-foreground">x{item.quantity} Product</span>
                     <span className="font-bold">${item.price_at_purchase.toFixed(2)}</span>
                   </div>
                ))}
                <div className="border-t border-white/10 pt-4 flex justify-between font-black text-xl text-white">
                  <span>Total</span>
                  <span>${order.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] glassmorphism border border-white/5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MapPin size={18} /> Delivery Address
              </h3>
              <p className="text-sm text-muted-foreground">
                123 AI Boulevard,<br />
                Neural District,<br />
                Tech City, 90210
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
