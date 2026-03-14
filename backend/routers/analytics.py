"""
Analytics Router — revenue metrics and business insights.
"""
from fastapi import APIRouter, Depends, HTTPException
from schemas import RevenueMetricOut, UserOut
from services import analytics_service, product_service
from routers.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/revenue", response_model=list[RevenueMetricOut])
async def get_revenue(days: int = 7, current_user: UserOut = Depends(get_current_user)):
    """Get revenue metrics for the last N days."""
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owners can view analytics")
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="No business associated")
    return await analytics_service.get_revenue_metrics(current_user.business_id, days)


@router.get("/top-products")
async def get_top_products(limit: int = 5, current_user: UserOut = Depends(get_current_user)):
    """Get top selling products."""
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="No business associated")
    return await product_service.get_top_products(current_user.business_id, limit)
