import { mockProducts } from '@/lib/mock-data';
import { apiGetProducts } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';
import { StatusBadge } from '@/components/ui/status-badge';
import { Package } from 'lucide-react';

export default function OwnerProducts() {
  const { data: products } = useApiData(() => apiGetProducts(), mockProducts);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display text-foreground">Product Management</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(p => (
          <div key={p.id} className="rounded-lg border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{p.category}</span>
            </div>
            <h3 className="font-semibold font-display text-card-foreground">{p.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold font-display text-foreground">₹{p.price.toLocaleString()}</span>
              <span className={`text-sm font-medium ${p.stock_quantity < 20 ? 'text-status-danger' : 'text-status-success'}`}>
                {p.stock_quantity} in stock
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
