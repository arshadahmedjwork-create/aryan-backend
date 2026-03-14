"""
FastAPI Application — main entry point.
Autonomous Agentic AI Business Operations Platform.
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from events.handlers import register_handlers
from routers import auth, products, orders, deliveries, analytics, nps, alerts, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown."""
    settings = get_settings()

    # Register event handlers
    register_handlers()
    print("[App] Event handlers registered")

    # Seed database with demo data
    try:
        from seed import seed_database
        seed_database()
    except Exception as e:
        print(f"[App] Seed skipped or failed: {e}")

    # Start simulation if enabled
    sim_task = None
    if settings.ENABLE_SIMULATION:
        from services.simulation_service import initialize, simulation_loop
        try:
            await initialize("b1")  # Default business
            sim_task = asyncio.create_task(simulation_loop())
            print("[App] Simulation loop started")
        except Exception as e:
            print(f"[App] Simulation init failed: {e}")

    yield

    # Shutdown
    if sim_task:
        sim_task.cancel()
        print("[App] Simulation loop stopped")


# ── Create App ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="AI Business Operations Platform",
    description="Autonomous Agentic AI Backend for Commerce Operations",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS Middleware ────────────────────────────────────────────────────────

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(deliveries.router)
app.include_router(analytics.router)
app.include_router(nps.router)
app.include_router(alerts.router)
app.include_router(chat.router)


# ── Health Check ───────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "service": "AI Business Operations Platform",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
