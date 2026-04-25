import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Edge Node - Hospital Firewall Server"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@edge_db:5432/hospital_local_db")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    
    # --- NEW FEDERATED SETTINGS ---
    # The unique name of this specific hospital node
    HOSPITAL_NAME: str = os.getenv("HOSPITAL_NAME", "Apollo Hospital - Bangalore Node")
    # The shared Redis broker URL (You and your co-founder must use the same cloud Redis URL here)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

settings = Settings()