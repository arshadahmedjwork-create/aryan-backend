import { cn } from '@/lib/utils';

type StatusType = 'pending' | 'confirmed' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'dispatched' | 'delayed';

const statusStyles: Record<StatusType, string> = {
  pending: 'bg-secondary text-secondary-foreground',
  confirmed: 'bg-primary/10 text-primary',
  shipped: 'bg-primary/10 text-primary',
  dispatched: 'bg-primary/10 text-primary',
  in_transit: 'bg-status-warning/10 text-status-warning',
  delivered: 'bg-status-success/10 text-status-success',
  cancelled: 'bg-status-danger/10 text-status-danger',
  delayed: 'bg-status-danger/10 text-status-danger',
};

export function StatusBadge({ status }: { status: StatusType }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", statusStyles[status] || 'bg-secondary text-secondary-foreground')}>
      {status.replace('_', ' ')}
    </span>
  );
}
