import { mockOrders } from '@/lib/mock-data';
import { apiGetOrders } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';
import { StatusBadge } from '@/components/ui/status-badge';

export default function OwnerOrders() {
  const { data: orders } = useApiData(() => apiGetOrders(), mockOrders);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display text-foreground">Orders Overview</h1>
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-foreground">{order.id}</td>
                  <td className="py-3 text-foreground">{order.customer_name}</td>
                  <td className="py-3 text-muted-foreground">{order.items.length} items</td>
                  <td className="py-3 text-foreground">₹{order.total_amount.toLocaleString()}</td>
                  <td className="py-3"><StatusBadge status={order.order_status} /></td>
                  <td className="py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
