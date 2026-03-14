import { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiChat, apiGetChatHistory } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface ChatMsg { role: 'user' | 'assistant'; content: string }

const quickResponses: Record<string, string> = {
  default: "Hi! 👋 I'm your AI shopping assistant. I can help you track orders, find products, or answer questions about your deliveries.",
  order: "📦 Your recent orders:\n• **ORD-1001** — Delivered ✅\n• **ORD-1004** — Shipped, arriving by Mar 14\n\nWould you like more details on any order?",
  delivery: "🚚 ORD-1004 is currently shipped and in transit with driver Ravi P. Estimated delivery: March 14, 10:00 AM. I'll notify you when it arrives!",
  product: "🛍️ Our top picks right now:\n1. **Wireless Earbuds Pro** — ₹2,999\n2. **Smart Watch Ultra** — ₹8,999\n3. **USB-C Hub 7-in-1** — ₹1,899\n\nWant me to add any to your cart?",
};

function getQuickResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('order') || lower.includes('status')) return quickResponses.order;
  if (lower.includes('deliver') || lower.includes('track') || lower.includes('ship')) return quickResponses.delivery;
  if (lower.includes('product') || lower.includes('recommend') || lower.includes('buy')) return quickResponses.product;
  return quickResponses.default;
}

export default function CustomerChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: quickResponses.default }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const hasToken = !!localStorage.getItem('access_token');

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      if (hasToken) {
        // Real API call
        const response = await apiChat(userMsg);
        setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
      } else {
        // Mock fallback
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: getQuickResponse(userMsg) }]);
        }, 600);
      }
    } catch (err) {
      // Fallback on error
      setMessages(prev => [...prev, { role: 'assistant', content: getQuickResponse(userMsg) }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <h1 className="mb-4 text-2xl font-bold font-display text-foreground">AI Support Chat</h1>
      <div className="flex-1 overflow-y-auto rounded-t-lg border bg-card p-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="rounded-2xl bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.15s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>●</span>
              </span>
            </div>
          </motion.div>
        )}
      </div>
      <div className="flex gap-2 rounded-b-lg border border-t-0 bg-card p-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about orders, products, deliveries..."
          disabled={isLoading}
          className="flex-1 rounded-lg border bg-secondary/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
        <button onClick={send} disabled={isLoading} className="rounded-lg bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
