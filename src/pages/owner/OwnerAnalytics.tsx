import { mockRevenue } from '@/lib/mock-data';
import { apiGetRevenue } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function OwnerAnalytics() {
  const { data: revenue } = useApiData(() => apiGetRevenue(7), mockRevenue);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display text-foreground">Revenue Analytics</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold font-display text-card-foreground">Daily Revenue</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="total_revenue" fill="hsl(239, 84%, 67%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold font-display text-card-foreground">Orders & Avg Value</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }} />
              <Tooltip />
              <Line type="monotone" dataKey="total_orders" stroke="hsl(239, 84%, 67%)" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
              <Line type="monotone" dataKey="avg_order_value" stroke="hsl(271, 81%, 56%)" strokeWidth={2} dot={{ r: 4 }} name="Avg Value (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
