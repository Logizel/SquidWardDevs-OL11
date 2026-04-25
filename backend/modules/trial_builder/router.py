from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from schemas.trial import TrialResponse, TrialCreate
from modules.trial_builder import service
from modules.auth_management.dependencies import get_db
from modules.auth_management.security import get_current_user
from models.user import User, UserRole

router = APIRouter()


@router.post("/", response_model=TrialResponse, status_code=status.HTTP_201_CREATED)
def create_new_trial(
    trial_in: TrialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Requires JWT
):
    """Allows an approved Sponsor to draft a new clinical trial protocol."""

    # Security Rule: Only Sponsors can build trials!
    if current_user.role != UserRole.sponsor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only approved Sponsors can create clinical trials.",
        )

    return service.create_trial(db, trial_in, current_user.id)


@router.get("/", response_model=List[TrialResponse])
def list_my_trials(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Returns a dashboard list of trials owned by the requesting Sponsor."""

    if current_user.role != UserRole.sponsor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Sponsors can view the trial dashboard.",
        )

    return service.get_trials_for_sponsor(db, current_user.id)
