from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.negotiation import NegotiationResponse, NegotiationCreate
from modules.agent_negotiator import service
from modules.auth_management.dependencies import get_db
from modules.auth_management.security import get_current_user
from models.user import User, UserRole

# THIS IS THE LINE PYTHON IS LOOKING FOR:
router = APIRouter()


@router.post("/", response_model=NegotiationResponse)
async def draft_negotiation_package(
    neg_in: NegotiationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Triggers the AI Agents to draft custom legal packages for a hospital."""

    # 🛡️ RBAC: Only the Sponsor can initiate a negotiation
    if current_user.role != UserRole.sponsor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only approved Sponsors can initiate legal negotiations.",
        )

    return await service.start_negotiation(db, neg_in)
