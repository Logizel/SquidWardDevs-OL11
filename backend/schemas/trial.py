from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from models.trial import TrialPhase, TrialStatus, CriteriaType


# --- Criteria Schemas ---
class TrialCriteriaBase(BaseModel):
    type: CriteriaType
    category: str
    rule_parameters: Dict[str, Any]  # Accepts flexible JSON logic
    description: Optional[str] = None


class TrialCriteriaCreate(TrialCriteriaBase):
    pass


class TrialCriteriaResponse(TrialCriteriaBase):
    id: UUID
    trial_id: UUID

    class Config:
        from_attributes = True


# --- Trial Schemas ---
class TrialBase(BaseModel):
    name: str
    description: Optional[str] = None
    phase: TrialPhase
    target_disease_code: str
    target_disease_name: str


class TrialCreate(TrialBase):
    # A sponsor can optionally send criteria while creating the trial
    criteria: Optional[List[TrialCriteriaCreate]] = []


class TrialUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phase: Optional[TrialPhase] = None
    status: Optional[TrialStatus] = None
    target_disease_code: Optional[str] = None
    target_disease_name: Optional[str] = None


class TrialResponse(TrialBase):
    id: UUID
    sponsor_id: UUID
    status: TrialStatus
    created_at: datetime
    updated_at: Optional[datetime]
    criteria: List[TrialCriteriaResponse] = []

    class Config:
        from_attributes = True
