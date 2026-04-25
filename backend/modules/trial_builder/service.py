from sqlalchemy.orm import Session
from models.trial import Trial, TrialCriteria
from schemas.trial import TrialCreate
import uuid


def create_trial(db: Session, trial_in: TrialCreate, sponsor_id: uuid.UUID):
    # 1. Create the base Trial record
    db_trial = Trial(
        sponsor_id=sponsor_id,
        name=trial_in.name,
        description=trial_in.description,
        phase=trial_in.phase,
        target_disease_code=trial_in.target_disease_code,
        target_disease_name=trial_in.target_disease_name,
    )
    db.add(db_trial)
    db.flush()  # Generates the Trial ID without fully committing yet

    # 2. Loop through and attach any Criteria the Sponsor included
    if trial_in.criteria:
        for crit_in in trial_in.criteria:
            db_crit = TrialCriteria(
                trial_id=db_trial.id,
                type=crit_in.type,
                category=crit_in.category,
                rule_parameters=crit_in.rule_parameters,  # The flexible JSONB payload
                description=crit_in.description,
            )
            db.add(db_crit)

    # 3. Save everything together as one transaction
    db.commit()
    db.refresh(db_trial)
    return db_trial


def get_trials_for_sponsor(db: Session, sponsor_id: uuid.UUID):
    """Fetches all trials owned by a specific sponsor."""
    return db.query(Trial).filter(Trial.sponsor_id == sponsor_id).all()
