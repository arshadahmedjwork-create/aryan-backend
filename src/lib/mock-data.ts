// Mock data for the entire platform

export type UserRole = 'customer' | 'owner' | 'operations_manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  business_id?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  order_status: 'pending' | 'confirmed' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  total_amount: number;
  items: { product_name: string; quantity: number; price: number }[];
  created_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  delivery_status: 'pending' | 'dispatched' | 'in_transit' | 'delivered' | 'delayed';
  assigned_driver: string;
  estimated_delivery_time: string;
  actual_delivery_time?: string;
  delay_reason?: string;
}

export interface AIAlert {
  id: string;
  alert_type: 'delivery_delay' | 'revenue_drop' | 'inventory_low' | 'negative_feedback';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  resolved: boolean;
}

export interface RevenueMetric {
  date: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Wireless Earbuds Pro', description: 'High-fidelity wireless earbuds with ANC', price: 2999, category: 'Electronics', stock_quantity: 145 },
  { id: 'p2', name: 'Smart Watch Ultra', description: 'Advanced health tracking smartwatch', price: 8999, category: 'Electronics', stock_quantity: 62 },
  { id: 'p3', name: 'Organic Green Tea', description: 'Premium loose leaf green tea, 200g', price: 599, category: 'Beverages', stock_quantity: 320 },
  { id: 'p4', name: 'Bamboo Water Bottle', description: 'Eco-friendly insulated bottle, 750ml', price: 1299, category: 'Lifestyle', stock_quantity: 8 },
  { id: 'p5', name: 'USB-C Hub 7-in-1', description: 'Multi-port adapter for laptops', price: 1899, category: 'Electronics', stock_quantity: 203 },
  { id: 'p6', name: 'Yoga Mat Premium', description: 'Non-slip exercise mat, 6mm thick', price: 1499, category: 'Fitness', stock_quantity: 15 },
  { id: 'p7', name: 'LED Desk Lamp', description: 'Adjustable brightness desk lamp', price: 2499, category: 'Home', stock_quantity: 88 },
  { id: 'p8', name: 'Protein Bar Box', description: 'Mixed flavors, 12 pack', price: 899, category: 'Nutrition', stock_quantity: 410 },
];

export const mockOrders: Order[] = [
  { id: 'ORD-1001', customer_id: 'c1', customer_name: 'Priya Sharma', order_status: 'delivered', total_amount: 11998, items: [{ product_name: 'Wireless Earbuds Pro', quantity: 2, price: 2999 }, { product_name: 'USB-C Hub 7-in-1', quantity: 1, price: 1899 }], created_at: '2026-03-12T10:30:00Z' },
  { id: 'ORD-1002', customer_id: 'c2', customer_name: 'Rahul Verma', order_status: 'in_transit', total_amount: 8999, items: [{ product_name: 'Smart Watch Ultra', quantity: 1, price: 8999 }], created_at: '2026-03-12T14:15:00Z' },
  { id: 'ORD-1003', customer_id: 'c3', customer_name: 'Ananya Patel', order_status: 'confirmed', total_amount: 2798, items: [{ product_name: 'Yoga Mat Premium', quantity: 1, price: 1499 }, { product_name: 'Bamboo Water Bottle', quantity: 1, price: 1299 }], created_at: '2026-03-13T08:00:00Z' },
  { id: 'ORD-1004', customer_id: 'c1', customer_name: 'Priya Sharma', order_status: 'shipped', total_amount: 599, items: [{ product_name: 'Organic Green Tea', quantity: 1, price: 599 }], created_at: '2026-03-13T09:45:00Z' },
  { id: 'ORD-1005', customer_id: 'c4', customer_name: 'Vikram Singh', order_status: 'pending', total_amount: 3398, items: [{ product_name: 'LED Desk Lamp', quantity: 1, price: 2499 }, { product_name: 'Protein Bar Box', quantity: 1, price: 899 }], created_at: '2026-03-13T11:20:00Z' },
  { id: 'ORD-1006', customer_id: 'c5', customer_name: 'Meera Nair', order_status: 'cancelled', total_amount: 2999, items: [{ product_name: 'Wireless Earbuds Pro', quantity: 1, price: 2999 }], created_at: '2026-03-11T16:00:00Z' },
];

export const mockDeliveries: Delivery[] = [
  { id: 'd1', order_id: 'ORD-1001', delivery_status: 'delivered', assigned_driver: 'Arjun K.', estimated_delivery_time: '2026-03-12T18:00:00Z', actual_delivery_time: '2026-03-12T17:30:00Z' },
  { id: 'd2', order_id: 'ORD-1002', delivery_status: 'in_transit', assigned_driver: 'Suresh M.', estimated_delivery_time: '2026-03-13T16:00:00Z' },
  { id: 'd3', order_id: 'ORD-1003', delivery_status: 'pending', assigned_driver: 'Unassigned', estimated_delivery_time: '2026-03-14T12:00:00Z' },
  { id: 'd4', order_id: 'ORD-1004', delivery_status: 'dispatched', assigned_driver: 'Ravi P.', estimated_delivery_time: '2026-03-14T10:00:00Z' },
  { id: 'd5', order_id: 'ORD-1005', delivery_status: 'delayed', assigned_driver: 'Suresh M.', estimated_delivery_time: '2026-03-13T14:00:00Z', delay_reason: 'Vehicle breakdown on NH48' },
];

export const mockAlerts: AIAlert[] = [
  { id: 'a1', alert_type: 'inventory_low', description: 'Bamboo Water Bottle stock critically low (8 units remaining)', severity: 'high', created_at: '2026-03-13T07:00:00Z', resolved: false },
  { id: 'a2', alert_type: 'delivery_delay', description: 'ORD-1005 delayed due to vehicle breakdown — customer Vikram Singh notified', severity: 'medium', created_at: '2026-03-13T10:30:00Z', resolved: false },
  { id: 'a3', alert_type: 'revenue_drop', description: 'Revenue down 12% compared to last Thursday — correlated with 3 cancelled orders', severity: 'high', created_at: '2026-03-13T06:00:00Z', resolved: false },
  { id: 'a4', alert_type: 'negative_feedback', description: 'NPS score dropped to 58 — 3 negative reviews citing slow delivery', severity: 'medium', created_at: '2026-03-12T22:00:00Z', resolved: true },
];

export const mockRevenue: RevenueMetric[] = [
  { date: '2026-03-07', total_orders: 32, total_revenue: 128400, avg_order_value: 4013 },
  { date: '2026-03-08', total_orders: 45, total_revenue: 178200, avg_order_value: 3960 },
  { date: '2026-03-09', total_orders: 38, total_revenue: 152600, avg_order_value: 4016 },
  { date: '2026-03-10', total_orders: 51, total_revenue: 204800, avg_order_value: 4016 },
  { date: '2026-03-11', total_orders: 29, total_revenue: 112400, avg_order_value: 3876 },
  { date: '2026-03-12', total_orders: 47, total_revenue: 189600, avg_order_value: 4034 },
  { date: '2026-03-13', total_orders: 22, total_revenue: 86400, avg_order_value: 3927 },
];

export const mockUser: Record<UserRole, User> = {
  customer: { id: 'c1', email: 'priya@example.com', name: 'Priya Sharma', role: 'customer', business_id: 'b1' },
  owner: { id: 'o1', email: 'raj@example.com', name: 'Raj Mehta', role: 'owner', business_id: 'b1' },
  operations_manager: { id: 'om1', email: 'ops@example.com', name: 'Kavita Reddy', role: 'operations_manager', business_id: 'b1' },
  admin: { id: 'a1', email: 'admin@example.com', name: 'Admin', role: 'admin', business_id: 'b1' },
};
