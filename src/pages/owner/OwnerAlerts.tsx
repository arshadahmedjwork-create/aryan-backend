import { mockAlerts } from '@/lib/mock-data';
import { apiGetAlerts } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';
import { AlertTriangle, TrendingDown, Package, MessageSquareWarning, CheckCircle2 } from 'lucide-react';

const alertIcons = {
  delivery_delay: AlertTriangle,
  revenue_drop: TrendingDown,
  inventory_low: Package,
  negative_feedback: MessageSquareWarning,
};

const severityStyles = {
  low: 'border-l-muted-foreground',
  medium: 'border-l-status-warning',
  high: 'border-l-status-danger',
  critical: 'border-l-status-danger',
};

export default function OwnerAlerts() {
  const { data: alerts } = useApiData(() => apiGetAlerts(), mockAlerts);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display text-foreground">AI Alerts</h1>
      <div className="space-y-3">
        {alerts.map(alert => {
          const Icon = alertIcons[alert.alert_type];
          return (
            <div key={alert.id} className={`flex items-start gap-4 rounded-lg border border-l-4 bg-card p-5 shadow-card ${severityStyles[alert.severity]} ${alert.resolved ? 'opacity-60' : ''}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                alert.severity === 'high' || alert.severity === 'critical' ? 'bg-status-danger/10 text-status-danger' : 'bg-status-warning/10 text-status-warning'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">{alert.alert_type.replace('_', ' ')}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    alert.severity === 'high' || alert.severity === 'critical' ? 'bg-status-danger/10 text-status-danger' : 'bg-status-warning/10 text-status-warning'
                  }`}>{alert.severity}</span>
                  {alert.resolved && <CheckCircle2 className="h-4 w-4 text-status-success" />}
                </div>
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
