from sqlalchemy.orm import Session
from models.negotiation import Negotiation, NegotiationStatus
from schemas.negotiation import NegotiationCreate
from models.trial import Trial
from models.user import User
from modules.agent_negotiator.agents.dua_agent import generate_dua
from modules.agent_negotiator.agents.irb_agent import generate_irb_package


async def start_negotiation(db: Session, neg_in: NegotiationCreate):
    # 1. Fetch contextual data for the AI
    trial = db.query(Trial).filter(Trial.id == neg_in.trial_id).first()
    hospital = db.query(User).filter(User.id == neg_in.hospital_id).first()
    sponsor = db.query(User).filter(User.id == trial.sponsor_id).first()

    # 2. Create the initial database record
    db_neg = Negotiation(
        trial_id=neg_in.trial_id,
        hospital_id=neg_in.hospital_id,
        status=NegotiationStatus.drafting,
    )
    db.add(db_neg)
    db.flush()  # Temporarily save to generate the UUID

    # 3. Trigger the AI Agents
    db_neg.dua_content = await generate_dua(
        trial_name=trial.name,
        sponsor_name=sponsor.email,  # Or a designated company name field
        hospital_name=hospital.email,
    )
    db_neg.irb_package = await generate_irb_package(
        trial_name=trial.name, disease_target=trial.target_disease_name
    )

    # 4. Advance the status and commit
    db_neg.status = NegotiationStatus.review_required
    db.commit()
    db.refresh(db_neg)

    return db_neg
