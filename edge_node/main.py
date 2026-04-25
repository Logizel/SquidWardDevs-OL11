import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from config import settings
from database import engine, Base
from models.ehr import LocalPatient, PatientCondition 

# Import Routers and Listeners
from modules.synthetic_data_engine.router import router as cohort_router
from modules.federated_orchestrator.redis_client import listen_to_hub

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Start listening to Redis in the background when the server boots
@asynccontextmanager
async def lifespan(app: FastAPI):
    listener_task = asyncio.create_task(listen_to_hub())
    yield
    listener_task.cancel()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Keep the REST API available just for local debugging/manual testing
app.include_router(cohort_router, prefix="/api/local/cohorts", tags=["Local Cohort Analysis"])

@app.get("/")
def read_root():
    return {"status": "active", "message": f"{settings.HOSPITAL_NAME} Edge Node running securely."}