"""
Simulation Service — generates synthetic business data for demos.
Runs as a background loop creating orders, deliveries, NPS feedback, etc.
"""
import asyncio
import random
from datetime import datetime, timedelta
from database import get_supabase_admin
from services import analytics_service
from events.emitter import emit_event


# Simulation config
CUSTOMER_IDS = []  # Will be populated at startup
PRODUCT_IDS = []
BUSINESS_ID = ""
DRIVER_NAMES = ["Arjun K.", "Suresh M.", "Ravi P.", "Lakshmi S.", "Deepak R."]
DELAY_REASONS = [
    "Vehicle breakdown on NH48",
    "Heavy traffic in city center",
    "Address not found — customer unreachable",
    "Weather conditions causing delays",
    "Warehouse sorting delay",
]


async def initialize(business_id: str):
    """Load IDs from the database for simulation."""
    global CUSTOMER_IDS, PRODUCT_IDS, BUSINESS_ID
    BUSINESS_ID = business_id
    admin = get_supabase_admin()

    customers = admin.table("users").select("id").eq("role", "customer").eq("business_id", business_id).execute()
    CUSTOMER_IDS = [c["id"] for c in customers.data] if customers.data else []

    products = admin.table("products").select("id, price").eq("business_id", business_id).execute()
    PRODUCT_IDS = [(p["id"], p["price"]) for p in products.data] if products.data else []


async def simulate_order():
    """Generate a random order."""
    if not CUSTOMER_IDS or not PRODUCT_IDS:
        return

    admin = get_supabase_admin()
    customer_id = random.choice(CUSTOMER_IDS)

    # Random 1-3 products
    num_items = random.randint(1, 3)
    selected = random.sample(PRODUCT_IDS, min(num_items, len(PRODUCT_IDS)))

    total = 0
    items_data = []
    for pid, price in selected:
        qty = random.randint(1, 3)
        total += price * qty
        items_data.append({"product_id": pid, "quantity": qty, "price": price})

    order = admin.table("orders").insert({
        "business_id": BUSINESS_ID,
        "customer_id": customer_id,
        "order_status": random.choice(["pending", "confirmed", "shipped"]),
        "total_amount": total,
    }).execute()

    order_id = order.data[0]["id"]
    for item in items_data:
        item["order_id"] = order_id
    admin.table("order_items").insert(items_data).execute()

    # Create delivery
    eta = datetime.utcnow() + timedelta(hours=random.randint(4, 48))
    delivery_status = random.choices(
        ["pending", "dispatched", "in_transit", "delivered", "delayed"],
        weights=[20, 20, 30, 20, 10],
    )[0]

    delivery_data = {
        "order_id": order_id,
        "delivery_status": delivery_status,
        "assigned_driver": random.choice(DRIVER_NAMES),
        "estimated_delivery_time": eta.isoformat(),
    }

    if delivery_status == "delivered":
        delivery_data["actual_delivery_time"] = (datetime.utcnow() - timedelta(hours=random.randint(1, 4))).isoformat()

    if delivery_status == "delayed":
        delivery_data["delay_reason"] = random.choice(DELAY_REASONS)

    admin.table("deliveries").insert(delivery_data).execute()

    # Emit events
    await emit_event("order_created", {"order_id": order_id, "business_id": BUSINESS_ID})

    if delivery_status == "delayed":
        await emit_event("delivery_delayed", {
            "order_id": order_id,
            "business_id": BUSINESS_ID,
            "reason": delivery_data.get("delay_reason", "Unknown"),
        })

    print(f"[Simulation] Created order {order_id} ({delivery_status})")


async def simulate_nps():
    """Generate random NPS feedback."""
    if not CUSTOMER_IDS:
        return

    admin = get_supabase_admin()
    customer_id = random.choice(CUSTOMER_IDS)

    # Get a recent order for this customer
    orders = admin.table("orders").select("id").eq("customer_id", customer_id).limit(1).execute()
    order_id = orders.data[0]["id"] if orders.data else None

    score = random.choices(
        range(0, 11),
        weights=[2, 1, 1, 2, 3, 5, 8, 12, 15, 25, 26],  # Skewed toward higher scores
    )[0]

    feedback_texts = {
        range(0, 4): ["Terrible experience", "Very disappointed", "Would not recommend"],
        range(4, 7): ["Could be better", "Average experience", "Some issues with delivery"],
        range(7, 9): ["Good overall", "Satisfied with the purchase", "Decent service"],
        range(9, 11): ["Excellent!", "Love the products!", "Outstanding service", "Will definitely buy again!"],
    }

    text = ""
    for score_range, texts in feedback_texts.items():
        if score in score_range:
            text = random.choice(texts)
            break

    payload = {"customer_id": customer_id, "score": score, "feedback_text": text}
    if order_id:
        payload["order_id"] = order_id

    admin.table("nps_feedback").insert(payload).execute()

    if score <= 6:
        await emit_event("negative_nps", {
            "customer_id": customer_id,
            "score": score,
            "order_id": order_id,
        })

    print(f"[Simulation] NPS feedback: score={score}")


async def update_revenue():
    """Update today's revenue metrics."""
    admin = get_supabase_admin()
    today = datetime.utcnow().strftime("%Y-%m-%d")

    orders = (
        admin.table("orders")
        .select("total_amount")
        .eq("business_id", BUSINESS_ID)
        .gte("created_at", f"{today}T00:00:00")
        .execute()
    )

    total_orders = len(orders.data)
    total_revenue = sum(o["total_amount"] for o in orders.data) if orders.data else 0

    await analytics_service.upsert_revenue_metric(BUSINESS_ID, today, total_orders, total_revenue)
    print(f"[Simulation] Revenue updated: {total_orders} orders, ₹{total_revenue:,.0f}")


async def check_inventory():
    """Check for low inventory and emit events."""
    admin = get_supabase_admin()
    products = (
        admin.table("products")
        .select("id, name, stock_quantity")
        .eq("business_id", BUSINESS_ID)
        .lt("stock_quantity", 20)
        .execute()
    )
    for p in products.data:
        await emit_event("low_inventory", {
            "business_id": BUSINESS_ID,
            "product_name": p["name"],
            "quantity": p["stock_quantity"],
        })


async def simulation_loop():
    """Main simulation loop — runs every 20 seconds."""
    print("[Simulation] Starting simulation loop...")
    await asyncio.sleep(5)  # Wait for app startup

    while True:
        try:
            if BUSINESS_ID and CUSTOMER_IDS and PRODUCT_IDS:
                await simulate_order()
                await update_revenue()

                # NPS every other cycle
                if random.random() > 0.5:
                    await simulate_nps()

                # Check inventory every 3rd cycle
                if random.random() > 0.7:
                    await check_inventory()
        except Exception as e:
            print(f"[Simulation Error] {e}")

        await asyncio.sleep(20)
