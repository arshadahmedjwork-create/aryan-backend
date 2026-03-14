import { mockProducts } from '@/lib/mock-data';
import { apiGetProducts } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';
import { ShoppingCart, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomerProducts() {
  const { data: products } = useApiData(() => apiGetProducts(), mockProducts);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold font-display text-foreground">Product Catalog</h1>
      <p className="mb-6 text-sm text-muted-foreground">Browse and shop our latest products</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-lg border bg-card overflow-hidden shadow-card transition-shadow hover:shadow-card-hover"
          >
            <div className="flex h-40 items-center justify-center bg-secondary">
              <Package className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <div className="p-4">
              <span className="text-xs font-medium text-muted-foreground">{p.category}</span>
              <h3 className="mt-1 font-semibold font-display text-card-foreground">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold font-display text-foreground">₹{p.price.toLocaleString()}</span>
                <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
