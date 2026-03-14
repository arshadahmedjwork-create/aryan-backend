"""
Alerts Service — AI-generated alerts management.
"""
from database import get_supabase_admin
from schemas import AIAlertOut, AIAlertCreate


async def list_alerts(business_id: str, resolved: bool | None = None) -> list[AIAlertOut]:
    """List alerts for a business, optionally filtered by resolved status."""
    admin = get_supabase_admin()
    query = admin.table("ai_alerts").select("*").eq("business_id", business_id)
    if resolved is not None:
        query = query.eq("resolved", resolved)
    result = query.order("created_at", desc=True).execute()
    return [AIAlertOut(**a) for a in result.data]


async def create_alert(business_id: str, data: AIAlertCreate) -> AIAlertOut:
    """Create a new AI alert."""
    admin = get_supabase_admin()
    payload = {
        "business_id": business_id,
        **data.model_dump(),
        "resolved": False,
    }
    result = admin.table("ai_alerts").insert(payload).execute()
    return AIAlertOut(**result.data[0])


async def resolve_alert(alert_id: str) -> AIAlertOut:
    """Mark an alert as resolved."""
    admin = get_supabase_admin()
    result = (
        admin.table("ai_alerts")
        .update({"resolved": True})
        .eq("id", alert_id)
        .execute()
    )
    return AIAlertOut(**result.data[0])
