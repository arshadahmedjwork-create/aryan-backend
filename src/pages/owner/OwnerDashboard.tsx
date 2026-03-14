import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockRevenue, mockOrders, mockAlerts, mockProducts } from '@/lib/mock-data';
import { apiChat, apiGetRevenue, apiGetOrders, apiGetAlerts } from '@/lib/api';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Bot, Send } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';

interface ChatMsg { role: 'user' | 'assistant'; content: string }

const defaultAiMsg = "I'm your AI Business Copilot. I can analyze revenue trends, identify top products, detect anomalies, and provide operational insights. Try asking about your revenue or top products!";

// Quick mock responses (fallback)
const aiResponses: Record<string, string> = {
  'default': defaultAiMsg,
  'revenue': "📊 This week's revenue is ₹1,052,400 across 264 orders. Tuesday saw the highest spike at ₹204,800 (51 orders). Today's revenue is tracking lower at ₹86,400 — likely due to 3 cancelled orders and a delivery delay affecting customer sentiment.",
  'product': "🏆 **Top selling products this week:**\n1. Wireless Earbuds Pro — 89 units\n2. Protein Bar Box — 72 units\n3. USB-C Hub 7-in-1 — 54 units\n\n⚠️ Bamboo Water Bottle is critically low at 8 units. Recommend restocking immediately.",
  'drop': "📉 Revenue dropped 12% vs. last Thursday. Root cause analysis:\n- 3 cancelled orders (₹8,997 lost)\n- Delivery delay on NH48 impacted 2 orders\n- NPS dipped to 58, suggesting customer dissatisfaction with delivery times.",
};

function getQuickResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('revenue') || lower.includes('sales')) return aiResponses.revenue;
  if (lower.includes('product') || lower.includes('sold') || lower.includes('top')) return aiResponses.product;
  if (lower.includes('drop') || lower.includes('why') || lower.includes('decline')) return aiResponses.drop;
  return aiResponses.default;
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const hasToken = !!localStorage.getItem('access_token');

  // Data state (falls back to mock)
  const [revenue, setRevenue] = useState(mockRevenue);
  const [orders, setOrders] = useState(mockOrders);
  const [alerts, setAlerts] = useState(mockAlerts);

  // Load real data if token exists
  useEffect(() => {
    if (hasToken) {
      apiGetRevenue(7).then(setRevenue).catch(() => {});
      apiGetOrders().then(setOrders).catch(() => {});
      apiGetAlerts().then(setAlerts).catch(() => {});
    }
  }, [hasToken]);

  const totalRevenue = revenue.reduce((s, r) => s + r.total_revenue, 0);
  const totalOrders = revenue.reduce((s, r) => s + r.total_orders, 0);
  const avgOrder = Math.round(totalRevenue / totalOrders) || 0;
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
  const lowStock = mockProducts.filter(p => p.stock_quantity < 20).length;

  // AI Copilot state
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: defaultAiMsg }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      if (hasToken) {
        const response = await apiChat(userMsg);
        setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
      } else {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: getQuickResponse(userMsg) }]);
        }, 800);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: getQuickResponse(userMsg) }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {user?.name || 'Raj'}. Here's your business overview.</p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard title="Weekly Revenue" value={`₹${(totalRevenue / 1000).toFixed(0)}K`} change="+8.2% vs last week" changeType="positive" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard title="Total Orders" value={totalOrders} change="+12 today" changeType="positive" icon={<ShoppingCart className="h-5 w-5" />} />
        <KpiCard title="Avg Order Value" value={`₹${avgOrder}`} change="-2.1%" changeType="negative" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard title="Active Alerts" value={unresolvedAlerts} change={`${lowStock} low stock items`} changeType="negative" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      {/* Revenue Chart */}
      <div className="mb-6 rounded-lg border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold font-display text-card-foreground">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenue}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="total_revenue" stroke="hsl(239, 84%, 67%)" fill="url(#revenueGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold font-display text-card-foreground">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-foreground">{order.id}</td>
                  <td className="py-3 text-foreground">{order.customer_name}</td>
                  <td className="py-3 text-foreground">₹{order.total_amount.toLocaleString()}</td>
                  <td className="py-3"><StatusBadge status={order.order_status} /></td>
                  <td className="py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Copilot FAB */}
      <button
        onClick={() => setCopilotOpen(!copilotOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-ai text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* AI Copilot Panel */}
      <AnimatePresence>
        {copilotOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col rounded-2xl border bg-card shadow-xl"
          >
            <div className="flex items-center gap-3 rounded-t-2xl gradient-ai px-4 py-3">
              <Bot className="h-5 w-5 text-primary-foreground" />
              <span className="font-semibold font-display text-primary-foreground">AI Business Copilot</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[90%] rounded-xl bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.15s' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>●</span>
                  </span>
                </motion.div>
              )}
            </div>
            <div className="border-t p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about your business..."
                  disabled={isLoading}
                  className="flex-1 rounded-lg border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
                <button onClick={sendMessage} disabled={isLoading} className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
