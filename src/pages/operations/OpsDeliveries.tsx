import { mockDeliveries } from '@/lib/mock-data';
import { apiGetDeliveries } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';
import { StatusBadge } from '@/components/ui/status-badge';

export default function OpsDeliveries() {
  const { data: deliveries } = useApiData(() => apiGetDeliveries(), mockDeliveries);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display text-foreground">All Deliveries</h1>
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Driver</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">ETA</th>
                <th className="pb-3 font-medium">Actual</th>
                <th className="pb-3 font-medium">Delay</th>
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
                  <td className="py-3 text-muted-foreground">{d.actual_delivery_time ? new Date(d.actual_delivery_time).toLocaleString() : '—'}</td>
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
