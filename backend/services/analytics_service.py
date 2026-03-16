"""
Analytics Service — revenue metrics and business insights.
"""
from database import get_supabase_admin
from schemas import RevenueMetricOut


async def get_revenue_metrics(business_id: str, days: int = 7) -> list[RevenueMetricOut]:
    """Get revenue metrics for a business over the last N days."""
    admin = get_supabase_admin()
    result = (
        admin.table("revenue_metrics")
        .select("*")
        .eq("business_id", business_id)
        .order("date", desc=True)
        .limit(days)
        .execute()
    )
    metrics = [RevenueMetricOut(**r) for r in result.data]
    metrics.reverse()  # chronological order
    return metrics


async def upsert_revenue_metric(business_id: str, date: str, total_orders: int, total_revenue: float):
    """Create or update a revenue metric for a given date."""
    admin = get_supabase_admin()
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

    # Check if metric exists for this date
    existing = (
        admin.table("revenue_metrics")
        .select("id")
        .eq("business_id", business_id)
        .eq("date", date)
        .execute()
    )

    payload = {
        "business_id": business_id,
        "date": date,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "avg_order_value": round(avg_order_value, 2),
    }

    if existing.data:
        admin.table("revenue_metrics").update(payload).eq("id", existing.data[0]["id"]).execute()
    else:
        admin.table("revenue_metrics").insert(payload).execute()
