"""
Deliveries Router — delivery tracking endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends
from schemas import DeliveryOut, DeliveryUpdate, UserOut
from services import delivery_service
from routers.auth import get_current_user

router = APIRouter(prefix="/deliveries", tags=["Deliveries"])


@router.get("", response_model=list[DeliveryOut])
async def list_deliveries(current_user: UserOut = Depends(get_current_user)):
    """List deliveries for the user's business."""
    return await delivery_service.list_deliveries(current_user.business_id)


@router.get("/{delivery_id}", response_model=DeliveryOut)
async def get_delivery(delivery_id: str, current_user: UserOut = Depends(get_current_user)):
    """Get a single delivery."""
    delivery = await delivery_service.get_delivery(delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return delivery


@router.put("/{delivery_id}", response_model=DeliveryOut)
async def update_delivery(delivery_id: str, body: DeliveryUpdate, current_user: UserOut = Depends(get_current_user)):
    """Update a delivery (ops/owner only)."""
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Customers cannot update deliveries")
    return await delivery_service.update_delivery(delivery_id, body)
