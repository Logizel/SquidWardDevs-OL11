import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import engine, Base
from models.user import User
from fastapi.middleware.cors import CORSMiddleware
from models.trial import Trial, TrialCriteria
from models.negotiation import Negotiation

# Import Routers
from modules.auth_management.router import router as auth_router
from modules.trial_builder.router import router as trial_router
from modules.federated_orchestrator.router import router as orchestrator_router
from modules.federated_orchestrator.redis_client import listen_for_edge_results
from modules.agent_negotiator.router import router as negotiator_router

# Create tables
Base.metadata.create_all(bind=engine)


# 🎧 Start listening to Redis in the background when the server boots
@asynccontextmanager
async def lifespan(app: FastAPI):
    listener_task = asyncio.create_task(listen_for_edge_results())
    yield
    listener_task.cancel()


# Initialize FastAPI with the lifespan
app = FastAPI(title="Project Medora Hub", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],  # Your React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # This allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(trial_router, prefix="/api/v1/trials", tags=["Trial Builder"])
app.include_router(
    orchestrator_router, prefix="/api/v1/orchestrator", tags=["Orchestrator"]
)
app.include_router(
    negotiator_router, prefix="/api/v1/negotiate", tags=["AI Negotiator"]
)
