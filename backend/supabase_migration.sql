-- =============================================================================
-- Supabase SQL Migration — AI Business Operations Platform
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'owner', 'operations_manager', 'admin')),
    business_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Businesses ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    owner_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Products ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    business_id TEXT NOT NULL REFERENCES businesses(id),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT,
    stock_quantity INTEGER DEFAULT 0,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Orders ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    business_id TEXT NOT NULL REFERENCES businesses(id),
    customer_id TEXT NOT NULL,
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        order_status IN ('pending', 'confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled')
    ),
    total_amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Order Items ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL
);

-- ── Deliveries ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_id TEXT NOT NULL REFERENCES orders(id),
    delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        delivery_status IN ('pending', 'dispatched', 'in_transit', 'delivered', 'delayed')
    ),
    assigned_driver TEXT DEFAULT 'Unassigned',
    estimated_delivery_time TIMESTAMPTZ,
    actual_delivery_time TIMESTAMPTZ,
    delay_reason TEXT
);

-- ── Revenue Metrics ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS revenue_metrics (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    business_id TEXT NOT NULL REFERENCES businesses(id),
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    avg_order_value NUMERIC DEFAULT 0,
    UNIQUE(business_id, date)
);

-- ── NPS Feedback ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nps_feedback (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    customer_id TEXT NOT NULL,
    order_id TEXT,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI Alerts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_alerts (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    business_id TEXT NOT NULL REFERENCES businesses(id),
    alert_type TEXT NOT NULL CHECK (
        alert_type IN ('delivery_delay', 'revenue_drop', 'inventory_low', 'negative_feedback')
    ),
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (
        severity IN ('low', 'medium', 'high', 'critical')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE
);

-- ── Chat Messages ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_business ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_revenue_business_date ON revenue_metrics(business_id, date);
CREATE INDEX IF NOT EXISTS idx_nps_customer ON nps_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_business ON ai_alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_messages(timestamp);

-- ── Row Level Security (RLS) ──────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) full access to all tables
-- The backend uses the service_role key which bypasses RLS

-- Users can read their own profile
CREATE POLICY "users_read_own" ON users FOR SELECT USING (
    auth.uid()::text = id
);

-- Business owners can read their business data
CREATE POLICY "products_read_business" ON products FOR SELECT USING (
    business_id IN (SELECT business_id FROM users WHERE id = auth.uid()::text)
);

CREATE POLICY "orders_read_own_or_business" ON orders FOR SELECT USING (
    customer_id = auth.uid()::text
    OR business_id IN (SELECT business_id FROM users WHERE id = auth.uid()::text)
);

CREATE POLICY "deliveries_read_business" ON deliveries FOR SELECT USING (
    order_id IN (
        SELECT id FROM orders
        WHERE business_id IN (SELECT business_id FROM users WHERE id = auth.uid()::text)
        OR customer_id = auth.uid()::text
    )
);

CREATE POLICY "alerts_read_business" ON ai_alerts FOR SELECT USING (
    business_id IN (SELECT business_id FROM users WHERE id = auth.uid()::text)
);

CREATE POLICY "chat_read_own" ON chat_messages FOR SELECT USING (
    user_id = auth.uid()::text
);

CREATE POLICY "nps_read_business" ON nps_feedback FOR SELECT USING (
    customer_id = auth.uid()::text
    OR order_id IN (
        SELECT id FROM orders
        WHERE business_id IN (SELECT business_id FROM users WHERE id = auth.uid()::text)
    )
);

-- =============================================================================
-- Done! Your database schema is ready.
-- Next: Run the backend seeder to populate with demo data.
-- =============================================================================
