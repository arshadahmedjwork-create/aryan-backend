import { mockAlerts } from '@/lib/mock-data';
import { apiGetAlerts } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';
import { AlertTriangle, TrendingDown, Package, MessageSquareWarning } from 'lucide-react';

const alertIcons = {
  delivery_delay: AlertTriangle,
  revenue_drop: TrendingDown,
  inventory_low: Package,
  negative_feedback: MessageSquareWarning,
};

export default function OpsAlerts() {
  const { data: allAlerts } = useApiData(() => apiGetAlerts(), mockAlerts);
  const opsAlerts = allAlerts.filter(a => a.alert_type === 'delivery_delay' || a.alert_type === 'inventory_low');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display text-foreground">Operational Alerts</h1>
      <div className="space-y-3">
        {opsAlerts.map(alert => {
          const Icon = alertIcons[alert.alert_type];
          return (
            <div key={alert.id} className="flex items-start gap-4 rounded-lg border bg-card p-5 shadow-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-status-warning/10 text-status-warning">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground">{alert.alert_type.replace('_', ' ')}</span>
                <p className="mt-1 text-sm text-foreground">{alert.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
