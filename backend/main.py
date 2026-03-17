from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes import auth_routes, product_routes, order_routes, delivery_routes
from database.db import init_db, get_supabase
from agents.orchestrator import OrchestratorAgent
from agents.conversation_agent import ConversationAgent
from routes.auth_routes import get_current_user
from pydantic import BaseModel
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    init_db()
    yield
    # Shutdown logic (if any)

app = FastAPI(title="QueryNexis Commerce AI API", lifespan=lifespan)

import os

allowed_origins = [
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in allowed_origins if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_routes.router)
app.include_router(product_routes.router)
app.include_router(order_routes.router)
app.include_router(delivery_routes.router)

@app.get("/health")
async def health():
    return {"status": "operational", "version": "2.0.0-agentic"}

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest, current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    conv_agent = ConversationAgent()
    orchestrator = OrchestratorAgent(supabase)
    
    # 1. Extract Intent (Role-Aware)
    analysis = await conv_agent.analyze_query(request.message, current_user.role)
    intent = analysis.get("intent", "general_query")
    
    # 2. Log Message
    supabase.table("messages").insert({
        "user_id": str(current_user.id),
        "role": "user",
        "content": request.message
    }).execute()
    
    # 3. Handle via Orchestrator (Role-Aware)
    response_text = await orchestrator.handle_request(request.message, intent, str(current_user.id), current_user.role)
    
    # 4. Log AI Response
    supabase.table("messages").insert({
        "user_id": str(current_user.id),
        "role": "assistant",
        "content": response_text
    }).execute()
    
    return {"response": response_text, "intent": intent}

@app.get("/ai/pulse")
async def ai_pulse(current_user = Depends(get_current_user), supabase = Depends(get_supabase)):
    from agents.alert_agent import AlertMonitoringAgent
    alert_agent = AlertMonitoringAgent(supabase)
    latest = await alert_agent.get_latest_critical_alert(current_user.role)
    return {"alert": latest}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
