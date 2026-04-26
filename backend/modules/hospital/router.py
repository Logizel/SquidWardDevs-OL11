from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.audit import AuditLog
from models.user import User, UserRole
from models.trial import Trial
from modules.auth_management.dependencies import get_db
from modules.auth_management.security import get_current_user

router = APIRouter()


@router.get("/queries")
def get_hospital_audit_trail(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.site_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # In a real app, you'd filter by the user's specific hospital ID.
    # For now, we fetch all logs to see the data flow.
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()

    results = []
    for log in logs:
        trial = db.query(Trial).filter(Trial.id == log.trial_id).first()
        sponsor = (
            db.query(User).filter(User.id == trial.sponsor_id).first()
            if trial
            else None
        )

        results.append(
            {
                "id": str(log.id),
                "sponsor": sponsor.email if sponsor else "Unknown Sponsor",
                "status": "Blocked" if log.fuzzed_count == 0 else "Responded",
                "true_count": log.true_count,
                "fuzzed_count": log.fuzzed_count,
                "sql_query": log.sql_query,
                "execution_proof": log.execution_proof,
                "needs_approval": True if log.fuzzed_count > 0 else False,
            }
        )
    return results
