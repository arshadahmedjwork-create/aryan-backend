import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  className?: string;
}

export function KpiCard({ title, value, change, changeType = 'neutral', icon, className }: KpiCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-bold font-display text-card-foreground">{value}</p>
      {change && (
        <p className={cn("mt-1 text-sm font-medium", {
          "text-status-success": changeType === 'positive',
          "text-status-danger": changeType === 'negative',
          "text-muted-foreground": changeType === 'neutral',
        })}>
          {change}
        </p>
      )}
    </div>
  );
}
