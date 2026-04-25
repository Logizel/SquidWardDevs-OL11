from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from models.negotiation import NegotiationStatus


class NegotiationCreate(BaseModel):
    trial_id: UUID
    hospital_id: UUID


class NegotiationResponse(BaseModel):
    id: UUID
    trial_id: UUID
    hospital_id: UUID
    status: NegotiationStatus
    dua_content: Optional[str] = None
    irb_package: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
