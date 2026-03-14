"""
Event handlers — reacts to system events by creating alerts and triggering agents.
"""
from events.emitter import on
from services.alerts_service import create_alert
from schemas import AIAlertCreate, AlertType, Severity


async def handle_order_created(data: dict):
    """Handle new order events."""
    print(f"[Event] Order created: {data.get('order_id')}")


async def handle_delivery_delayed(data: dict):
    """Handle delivery delay — create AI alert."""
    business_id = data.get("business_id")
    if not business_id:
        # Lookup business_id from order
        from database import get_supabase_admin
        admin = get_supabase_admin()
        order = admin.table("orders").select("business_id").eq("id", data.get("order_id", "")).maybe_single().execute()
        if order.data:
            business_id = order.data["business_id"]

    if business_id:
        await create_alert(
            business_id,
            AIAlertCreate(
                alert_type=AlertType.delivery_delay,
                description=f"Delivery delayed for order {data.get('order_id')}: {data.get('reason', 'Unknown')}",
                severity=Severity.medium,
            ),
        )
    print(f"[Event] Delivery delayed: {data}")


async def handle_negative_nps(data: dict):
    """Handle negative NPS feedback — create AI alert."""
    order_id = data.get("order_id")
    if order_id:
        from database import get_supabase_admin
        admin = get_supabase_admin()
        order = admin.table("orders").select("business_id").eq("id", order_id).maybe_single().execute()
        if order.data:
            await create_alert(
                order.data["business_id"],
                AIAlertCreate(
                    alert_type=AlertType.negative_feedback,
                    description=f"Negative NPS score ({data.get('score')}/10) received for order {order_id}",
                    severity=Severity.medium,
                ),
            )
    print(f"[Event] Negative NPS: {data}")


async def handle_low_inventory(data: dict):
    """Handle low inventory event."""
    if data.get("business_id"):
        await create_alert(
            data["business_id"],
            AIAlertCreate(
                alert_type=AlertType.inventory_low,
                description=f"Product '{data.get('product_name', 'Unknown')}' stock critically low ({data.get('quantity', 0)} units)",
                severity=Severity.high,
            ),
        )
    print(f"[Event] Low inventory: {data}")


async def handle_user_registered(data: dict):
    """Handle new user registration — log for auditing and future email hooks."""
    print(f"[Event] User registered: {data.get('email')} (role: {data.get('role')})")


async def handle_user_logged_in(data: dict):
    """Handle user login — log for auditing and future email hooks."""
    print(f"[Event] User logged in: {data.get('email')}")


def register_handlers():
    """Register all event handlers."""
    on("order_created", handle_order_created)
    on("delivery_delayed", handle_delivery_delayed)
    on("negative_nps", handle_negative_nps)
    on("low_inventory", handle_low_inventory)
    on("user_registered", handle_user_registered)
    on("user_logged_in", handle_user_logged_in)
