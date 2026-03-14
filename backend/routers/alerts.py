"""
Alerts Router — AI alert management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from schemas import AIAlertOut, AIAlertCreate, UserOut
from services import alerts_service
from routers.auth import get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=list[AIAlertOut])
async def list_alerts(resolved: bool | None = None, current_user: UserOut = Depends(get_current_user)):
    """List alerts for the business."""
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="No business associated")
    return await alerts_service.list_alerts(current_user.business_id, resolved)


@router.post("", response_model=AIAlertOut)
async def create_alert(body: AIAlertCreate, current_user: UserOut = Depends(get_current_user)):
    """Create a new alert."""
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="No business associated")
    return await alerts_service.create_alert(current_user.business_id, body)


@router.put("/{alert_id}/resolve", response_model=AIAlertOut)
async def resolve_alert(alert_id: str, current_user: UserOut = Depends(get_current_user)):
    """Mark an alert as resolved."""
    return await alerts_service.resolve_alert(alert_id)
