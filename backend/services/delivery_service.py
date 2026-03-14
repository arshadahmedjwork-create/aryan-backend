"""
Delivery Service — CRUD for delivery tracking.
"""
from database import get_supabase_admin
from schemas import DeliveryOut, DeliveryCreate, DeliveryUpdate, DeliveryStatus
from events.emitter import emit_event


async def list_deliveries(business_id: str | None = None) -> list[DeliveryOut]:
    """List deliveries, optionally filtered by business via orders."""
    admin = get_supabase_admin()
    if business_id:
        orders = admin.table("orders").select("id").eq("business_id", business_id).execute()
        order_ids = [o["id"] for o in orders.data]
        if not order_ids:
            return []
        result = admin.table("deliveries").select("*").in_("order_id", order_ids).execute()
    else:
        result = admin.table("deliveries").select("*").execute()
    return [DeliveryOut(**d) for d in result.data]


async def get_delivery(delivery_id: str) -> DeliveryOut | None:
    """Get a single delivery."""
    admin = get_supabase_admin()
    result = admin.table("deliveries").select("*").eq("id", delivery_id).maybe_single().execute()
    if result.data:
        return DeliveryOut(**result.data)
    return None


async def get_delivery_by_order(order_id: str) -> DeliveryOut | None:
    """Get delivery for a specific order."""
    admin = get_supabase_admin()
    result = admin.table("deliveries").select("*").eq("order_id", order_id).maybe_single().execute()
    if result.data:
        return DeliveryOut(**result.data)
    return None


async def create_delivery(data: DeliveryCreate) -> DeliveryOut:
    """Create a new delivery record."""
    admin = get_supabase_admin()
    payload = data.model_dump(exclude_none=True)
    payload["delivery_status"] = "pending"
    result = admin.table("deliveries").insert(payload).execute()
    return DeliveryOut(**result.data[0])


async def update_delivery(delivery_id: str, data: DeliveryUpdate) -> DeliveryOut:
    """Update a delivery."""
    admin = get_supabase_admin()
    payload = data.model_dump(exclude_none=True)
    result = admin.table("deliveries").update(payload).eq("id", delivery_id).execute()

    delivery = DeliveryOut(**result.data[0])

    # Emit event if delayed
    if delivery.delivery_status == DeliveryStatus.delayed:
        await emit_event("delivery_delayed", {
            "delivery_id": delivery_id,
            "order_id": delivery.order_id,
            "reason": delivery.delay_reason or "Unknown",
        })

    return delivery


async def get_delayed_deliveries(business_id: str) -> list[DeliveryOut]:
    """Get all delayed deliveries for a business."""
    admin = get_supabase_admin()
    orders = admin.table("orders").select("id").eq("business_id", business_id).execute()
    order_ids = [o["id"] for o in orders.data]
    if not order_ids:
        return []
    result = (
        admin.table("deliveries")
        .select("*")
        .in_("order_id", order_ids)
        .eq("delivery_status", "delayed")
        .execute()
    )
    return [DeliveryOut(**d) for d in result.data]
