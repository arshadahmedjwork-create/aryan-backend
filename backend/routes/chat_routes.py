from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database.db import get_session
from routes.auth_routes import get_current_user
from agents.orchestrator_agent import OrchestratorAgent
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat(request: ChatRequest, current_user = Depends(get_current_user), session: Session = Depends(get_session)):
    orchestrator = OrchestratorAgent(session)
    response = await orchestrator.route_request(
        user_id=str(current_user.id),
        message=request.message,
        role=current_user.role
    )
    return {"response": response}
