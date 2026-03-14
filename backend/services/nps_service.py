"""
NPS Service — Net Promoter Score feedback collection and analysis.
"""
from database import get_supabase_admin
from schemas import NpsFeedbackOut, NpsFeedbackCreate
from events.emitter import emit_event


async def list_nps_feedback(business_id: str) -> list[NpsFeedbackOut]:
    """List all NPS feedback for a business (via orders)."""
    admin = get_supabase_admin()
    orders = admin.table("orders").select("id").eq("business_id", business_id).execute()
    order_ids = [o["id"] for o in orders.data]
    if not order_ids:
        return []
    result = (
        admin.table("nps_feedback")
        .select("*")
        .in_("order_id", order_ids)
        .order("created_at", desc=True)
        .execute()
    )
    return [NpsFeedbackOut(**f) for f in result.data]


async def submit_feedback(customer_id: str, data: NpsFeedbackCreate) -> NpsFeedbackOut:
    """Submit NPS feedback."""
    admin = get_supabase_admin()
    payload = {
        "customer_id": customer_id,
        **data.model_dump(exclude_none=True),
    }
    result = admin.table("nps_feedback").insert(payload).execute()
    feedback = NpsFeedbackOut(**result.data[0])

    # Emit event for negative NPS (detractors: score 0-6)
    if data.score <= 6:
        await emit_event("negative_nps", {
            "feedback_id": feedback.id,
            "customer_id": customer_id,
            "score": data.score,
            "order_id": data.order_id,
        })

    return feedback


async def get_nps_score(business_id: str) -> dict:
    """Calculate aggregate NPS score for a business."""
    feedback = await list_nps_feedback(business_id)
    if not feedback:
        return {"score": 0, "total_responses": 0, "promoters": 0, "passives": 0, "detractors": 0}

    promoters = sum(1 for f in feedback if f.score >= 9)
    passives = sum(1 for f in feedback if 7 <= f.score <= 8)
    detractors = sum(1 for f in feedback if f.score <= 6)
    total = len(feedback)

    nps_score = round(((promoters - detractors) / total) * 100) if total > 0 else 0

    return {
        "score": nps_score,
        "total_responses": total,
        "promoters": promoters,
        "passives": passives,
        "detractors": detractors,
    }
