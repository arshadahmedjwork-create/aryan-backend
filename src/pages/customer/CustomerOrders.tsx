import { mockOrders } from '@/lib/mock-data';
import { apiGetOrders } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';
import { StatusBadge } from '@/components/ui/status-badge';

export default function CustomerOrders() {
  const { data: allOrders } = useApiData(() => apiGetOrders(), mockOrders.filter(o => o.customer_id === 'c1'));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display text-foreground">My Orders</h1>
      <div className="space-y-4">
        {allOrders.map(order => (
          <div key={order.id} className="rounded-lg border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold font-display text-foreground">{order.id}</span>
              <StatusBadge status={order.order_status} />
            </div>
            <div className="space-y-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.product_name} × {item.quantity}</span>
                  <span className="text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
              <span className="font-semibold font-display text-foreground">₹{order.total_amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
