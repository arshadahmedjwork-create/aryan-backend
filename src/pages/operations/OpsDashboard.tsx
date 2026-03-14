import { mockDeliveries } from '@/lib/mock-data';
import { apiGetDeliveries } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Truck, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function OpsDashboard() {
  const { data: deliveries } = useApiData(() => apiGetDeliveries(), mockDeliveries);

  const delivered = deliveries.filter(d => d.delivery_status === 'delivered').length;
  const inTransit = deliveries.filter(d => d.delivery_status === 'in_transit' || d.delivery_status === 'dispatched').length;
  const delayed = deliveries.filter(d => d.delivery_status === 'delayed').length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display text-foreground">Operations Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard title="Total Deliveries" value={deliveries.length} icon={<Truck className="h-5 w-5" />} />
        <KpiCard title="In Transit" value={inTransit} icon={<Clock className="h-5 w-5" />} />
        <KpiCard title="Delivered" value={delivered} change="On time" changeType="positive" icon={<CheckCircle className="h-5 w-5" />} />
        <KpiCard title="Delayed" value={delayed} change={delayed > 0 ? `${delayed} critical` : 'None'} changeType={delayed > 0 ? "negative" : "positive"} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold font-display text-card-foreground">Delivery Board</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Delivery ID</th>
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Driver</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">ETA</th>
                <th className="pb-3 font-medium">Delay Reason</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(d => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-foreground">{d.id}</td>
                  <td className="py-3 text-foreground">{d.order_id}</td>
                  <td className="py-3 text-foreground">{d.assigned_driver}</td>
                  <td className="py-3"><StatusBadge status={d.delivery_status} /></td>
                  <td className="py-3 text-muted-foreground">{new Date(d.estimated_delivery_time).toLocaleString()}</td>
                  <td className="py-3 text-sm text-status-danger">{d.delay_reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
