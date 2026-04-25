from fastapi import FastAPI
from modules.auth_management.router import router as auth_router
from database import engine, Base
from models.user import User

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Federated Clinical Trials API",
    description="Backend for secure patient discovery and matching.",
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])


@app.get("/")
async def root():
    return {"message": "FastAPI backend is running successfully!"}
