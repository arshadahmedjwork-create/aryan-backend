"""
Chat Router — chat endpoint that routes messages through the AI agent system.
"""
from fastapi import APIRouter, Depends
from schemas import ChatRequest, ChatResponse, ChatMessageOut, UserOut
from services import chat_service
from agents.router import route_to_agent
from agents import (
    conversation_agent,
    analytics_agent,
    operations_agent,
    loyalty_agent,
    anomaly_agent,
)
from routers.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])

# Agent dispatch map
AGENT_MAP = {
    "conversation": conversation_agent,
    "analytics": analytics_agent,
    "operations": operations_agent,
    "loyalty": loyalty_agent,
    "anomaly": anomaly_agent,
}


@router.post("", response_model=ChatResponse)
async def chat(body: ChatRequest, current_user: UserOut = Depends(get_current_user)):
    """Send a message and get an AI response via the agent router."""
    # Save user message
    await chat_service.save_message(current_user.id, body.message, "user")

    # Get chat history for context
    history_records = await chat_service.get_history(current_user.id, limit=20)
    chat_history = [
        {"role": m.role, "content": m.message}
        for m in history_records[:-1]  # Exclude the just-saved message
    ]

    # Route to agent
    agent_name = route_to_agent(body.message, current_user)
    agent = AGENT_MAP.get(agent_name, conversation_agent)

    # Get response
    reply = await agent.handle(body.message, current_user, chat_history)

    # Save assistant response
    await chat_service.save_message(current_user.id, reply, "assistant")

    return ChatResponse(reply=reply, agent=agent_name)


@router.get("/history", response_model=list[ChatMessageOut])
async def chat_history(limit: int = 50, current_user: UserOut = Depends(get_current_user)):
    """Get chat history for the current user."""
    return await chat_service.get_history(current_user.id, limit)
