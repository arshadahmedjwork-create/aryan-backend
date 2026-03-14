"""
NPS Router — Net Promoter Score feedback endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from schemas import NpsFeedbackOut, NpsFeedbackCreate, UserOut
from services import nps_service
from routers.auth import get_current_user

router = APIRouter(prefix="/nps", tags=["NPS"])


@router.get("", response_model=list[NpsFeedbackOut])
async def list_feedback(current_user: UserOut = Depends(get_current_user)):
    """List NPS feedback for the business."""
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="No business associated")
    return await nps_service.list_nps_feedback(current_user.business_id)


@router.post("", response_model=NpsFeedbackOut)
async def submit_feedback(body: NpsFeedbackCreate, current_user: UserOut = Depends(get_current_user)):
    """Submit NPS feedback (customer only)."""
    return await nps_service.submit_feedback(current_user.id, body)


@router.get("/score")
async def nps_score(current_user: UserOut = Depends(get_current_user)):
    """Get aggregate NPS score."""
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="No business associated")
    return await nps_service.get_nps_score(current_user.business_id)
