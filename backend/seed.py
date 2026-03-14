"""
Database seeder — seeds initial data matching the frontend mock data.
Resilient: each table insert is wrapped in try/except so partial seeds can recover.
"""
from database import get_supabase_admin


def seed_database():
    """Seed the database with initial demo data."""
    admin = get_supabase_admin()

    print("[Seed] Starting database seeding...")

    # ── Check if fully seeded (check products as indicator) ──────────
    existing_products = admin.table("products").select("id").limit(1).execute()
    if existing_products.data:
        print("[Seed] Database already seeded, skipping.")
        return

    # ── Business ────────────────────────────────────────────────────────
    try:
        admin.table("businesses").upsert({
            "id": "b1",
            "name": "TechMart India",
            "owner_id": "placeholder",
        }).execute()
        print("[Seed] Created business: TechMart India")
    except Exception as e:
        print(f"[Seed] Business: {e}")

    # ── Users ──────────────────────────────────────────────────────────
    users = [
        {"id": "c1", "email": "priya@example.com", "name": "Priya Sharma", "role": "customer", "business_id": "b1"},
        {"id": "c2", "email": "rahul@example.com", "name": "Rahul Verma", "role": "customer", "business_id": "b1"},
        {"id": "c3", "email": "ananya@example.com", "name": "Ananya Patel", "role": "customer", "business_id": "b1"},
        {"id": "c4", "email": "vikram@example.com", "name": "Vikram Singh", "role": "customer", "business_id": "b1"},
        {"id": "c5", "email": "meera@example.com", "name": "Meera Nair", "role": "customer", "business_id": "b1"},
        {"id": "o1", "email": "raj@example.com", "name": "Raj Mehta", "role": "owner", "business_id": "b1"},
        {"id": "om1", "email": "ops@example.com", "name": "Kavita Reddy", "role": "operations_manager", "business_id": "b1"},
        {"id": "a1", "email": "admin@example.com", "name": "Admin", "role": "admin", "business_id": "b1"},
    ]
    try:
        admin.table("users").upsert(users).execute()
        print(f"[Seed] Created {len(users)} users")
        admin.table("businesses").update({"owner_id": "o1"}).eq("id", "b1").execute()
    except Exception as e:
        print(f"[Seed] Users: {e}")

    # ── Products ────────────────────────────────────────────────────────
    products = [
        {"id": "p1", "business_id": "b1", "name": "Wireless Earbuds Pro", "description": "High-fidelity wireless earbuds with ANC", "price": 2999, "category": "Electronics", "stock_quantity": 145},
        {"id": "p2", "business_id": "b1", "name": "Smart Watch Ultra", "description": "Advanced health tracking smartwatch", "price": 8999, "category": "Electronics", "stock_quantity": 62},
        {"id": "p3", "business_id": "b1", "name": "Organic Green Tea", "description": "Premium loose leaf green tea, 200g", "price": 599, "category": "Beverages", "stock_quantity": 320},
        {"id": "p4", "business_id": "b1", "name": "Bamboo Water Bottle", "description": "Eco-friendly insulated bottle, 750ml", "price": 1299, "category": "Lifestyle", "stock_quantity": 8},
        {"id": "p5", "business_id": "b1", "name": "USB-C Hub 7-in-1", "description": "Multi-port adapter for laptops", "price": 1899, "category": "Electronics", "stock_quantity": 203},
        {"id": "p6", "business_id": "b1", "name": "Yoga Mat Premium", "description": "Non-slip exercise mat, 6mm thick", "price": 1499, "category": "Fitness", "stock_quantity": 15},
        {"id": "p7", "business_id": "b1", "name": "LED Desk Lamp", "description": "Adjustable brightness desk lamp", "price": 2499, "category": "Home", "stock_quantity": 88},
        {"id": "p8", "business_id": "b1", "name": "Protein Bar Box", "description": "Mixed flavors, 12 pack", "price": 899, "category": "Nutrition", "stock_quantity": 410},
    ]
    try:
        admin.table("products").upsert(products).execute()
        print(f"[Seed] Created {len(products)} products")
    except Exception as e:
        print(f"[Seed] Products: {e}")

    # ── Orders ──────────────────────────────────────────────────────────
    orders = [
        {"id": "ORD-1001", "business_id": "b1", "customer_id": "c1", "order_status": "delivered", "total_amount": 11998},
        {"id": "ORD-1002", "business_id": "b1", "customer_id": "c2", "order_status": "in_transit", "total_amount": 8999},
        {"id": "ORD-1003", "business_id": "b1", "customer_id": "c3", "order_status": "confirmed", "total_amount": 2798},
        {"id": "ORD-1004", "business_id": "b1", "customer_id": "c1", "order_status": "shipped", "total_amount": 599},
        {"id": "ORD-1005", "business_id": "b1", "customer_id": "c4", "order_status": "pending", "total_amount": 3398},
        {"id": "ORD-1006", "business_id": "b1", "customer_id": "c5", "order_status": "cancelled", "total_amount": 2999},
    ]
    try:
        admin.table("orders").upsert(orders).execute()
        print(f"[Seed] Created {len(orders)} orders")
    except Exception as e:
        print(f"[Seed] Orders: {e}")

    # ── Order Items ─────────────────────────────────────────────────────
    order_items = [
        {"order_id": "ORD-1001", "product_id": "p1", "quantity": 2, "price": 2999},
        {"order_id": "ORD-1001", "product_id": "p5", "quantity": 1, "price": 1899},
        {"order_id": "ORD-1002", "product_id": "p2", "quantity": 1, "price": 8999},
        {"order_id": "ORD-1003", "product_id": "p6", "quantity": 1, "price": 1499},
        {"order_id": "ORD-1003", "product_id": "p4", "quantity": 1, "price": 1299},
        {"order_id": "ORD-1004", "product_id": "p3", "quantity": 1, "price": 599},
        {"order_id": "ORD-1005", "product_id": "p7", "quantity": 1, "price": 2499},
        {"order_id": "ORD-1005", "product_id": "p8", "quantity": 1, "price": 899},
        {"order_id": "ORD-1006", "product_id": "p1", "quantity": 1, "price": 2999},
    ]
    try:
        admin.table("order_items").insert(order_items).execute()
        print(f"[Seed] Created {len(order_items)} order items")
    except Exception as e:
        print(f"[Seed] Order items: {e}")

    # ── Deliveries ──────────────────────────────────────────────────────
    deliveries = [
        {"id": "d1", "order_id": "ORD-1001", "delivery_status": "delivered", "assigned_driver": "Arjun K.", "estimated_delivery_time": "2026-03-12T18:00:00Z", "actual_delivery_time": "2026-03-12T17:30:00Z"},
        {"id": "d2", "order_id": "ORD-1002", "delivery_status": "in_transit", "assigned_driver": "Suresh M.", "estimated_delivery_time": "2026-03-13T16:00:00Z"},
        {"id": "d3", "order_id": "ORD-1003", "delivery_status": "pending", "assigned_driver": "Unassigned", "estimated_delivery_time": "2026-03-14T12:00:00Z"},
        {"id": "d4", "order_id": "ORD-1004", "delivery_status": "dispatched", "assigned_driver": "Ravi P.", "estimated_delivery_time": "2026-03-14T10:00:00Z"},
        {"id": "d5", "order_id": "ORD-1005", "delivery_status": "delayed", "assigned_driver": "Suresh M.", "estimated_delivery_time": "2026-03-13T14:00:00Z", "delay_reason": "Vehicle breakdown on NH48"},
    ]
    try:
        admin.table("deliveries").upsert(deliveries).execute()
        print(f"[Seed] Created {len(deliveries)} deliveries")
    except Exception as e:
        print(f"[Seed] Deliveries: {e}")

    # ── Revenue Metrics ─────────────────────────────────────────────────
    revenue = [
        {"business_id": "b1", "date": "2026-03-07", "total_orders": 32, "total_revenue": 128400, "avg_order_value": 4013},
        {"business_id": "b1", "date": "2026-03-08", "total_orders": 45, "total_revenue": 178200, "avg_order_value": 3960},
        {"business_id": "b1", "date": "2026-03-09", "total_orders": 38, "total_revenue": 152600, "avg_order_value": 4016},
        {"business_id": "b1", "date": "2026-03-10", "total_orders": 51, "total_revenue": 204800, "avg_order_value": 4016},
        {"business_id": "b1", "date": "2026-03-11", "total_orders": 29, "total_revenue": 112400, "avg_order_value": 3876},
        {"business_id": "b1", "date": "2026-03-12", "total_orders": 47, "total_revenue": 189600, "avg_order_value": 4034},
        {"business_id": "b1", "date": "2026-03-13", "total_orders": 22, "total_revenue": 86400, "avg_order_value": 3927},
    ]
    try:
        admin.table("revenue_metrics").insert(revenue).execute()
        print(f"[Seed] Created {len(revenue)} revenue metrics")
    except Exception as e:
        print(f"[Seed] Revenue: {e}")

    # ── AI Alerts ───────────────────────────────────────────────────────
    alerts = [
        {"business_id": "b1", "alert_type": "inventory_low", "description": "Bamboo Water Bottle stock critically low (8 units remaining)", "severity": "high", "resolved": False},
        {"business_id": "b1", "alert_type": "delivery_delay", "description": "ORD-1005 delayed due to vehicle breakdown — customer Vikram Singh notified", "severity": "medium", "resolved": False},
        {"business_id": "b1", "alert_type": "revenue_drop", "description": "Revenue down 12% compared to last Thursday — correlated with 3 cancelled orders", "severity": "high", "resolved": False},
        {"business_id": "b1", "alert_type": "negative_feedback", "description": "NPS score dropped to 58 — 3 negative reviews citing slow delivery", "severity": "medium", "resolved": True},
    ]
    try:
        admin.table("ai_alerts").insert(alerts).execute()
        print(f"[Seed] Created {len(alerts)} AI alerts")
    except Exception as e:
        print(f"[Seed] Alerts: {e}")

    # ── NPS Feedback ────────────────────────────────────────────────────
    nps = [
        {"customer_id": "c1", "order_id": "ORD-1001", "score": 9, "feedback_text": "Excellent delivery, arrived early!"},
        {"customer_id": "c2", "order_id": "ORD-1002", "score": 7, "feedback_text": "Good product but took a while"},
        {"customer_id": "c4", "order_id": "ORD-1005", "score": 4, "feedback_text": "Still waiting for delivery, very frustrating"},
        {"customer_id": "c5", "order_id": "ORD-1006", "score": 3, "feedback_text": "Had to cancel due to delay, poor experience"},
        {"customer_id": "c3", "order_id": "ORD-1003", "score": 8, "feedback_text": "Good products, reasonable prices"},
    ]
    try:
        admin.table("nps_feedback").insert(nps).execute()
        print(f"[Seed] Created {len(nps)} NPS feedback entries")
    except Exception as e:
        print(f"[Seed] NPS: {e}")

    print("[Seed] ✅ Database seeding complete!")


if __name__ == "__main__":
    seed_database()
