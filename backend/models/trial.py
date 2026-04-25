import uuid
import enum
from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class TrialPhase(str, enum.Enum):
    phase_1 = "Phase I"
    phase_2 = "Phase II"
    phase_3 = "Phase III"
    phase_4 = "Phase IV"
    observational = "Observational"


class TrialStatus(str, enum.Enum):
    draft = "draft"
    active = "active"  # Ready to be sent to Edge Nodes
    completed = "completed"
    archived = "archived"


class CriteriaType(str, enum.Enum):
    inclusion = "inclusion"
    exclusion = "exclusion"


class Trial(Base):
    __tablename__ = "trials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sponsor_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    phase = Column(Enum(TrialPhase), nullable=False)
    status = Column(Enum(TrialStatus), default=TrialStatus.draft)

    # Target disease using standard medical coding (e.g., ICD-10)
    target_disease_code = Column(String(50), nullable=False)
    target_disease_name = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sponsor = relationship("User")
    criteria = relationship(
        "TrialCriteria", back_populates="trial", cascade="all, delete-orphan"
    )


class TrialCriteria(Base):
    """
    Stores individual rules for the trial.
    Using JSONB for 'rule_parameters' allows us to store complex logic
    (like min/max ranges, specific codes, or boolean flags) flexibly.
    """

    __tablename__ = "trial_criteria"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trial_id = Column(
        UUID(as_uuid=True), ForeignKey("trials.id", ondelete="CASCADE"), nullable=False
    )

    type = Column(Enum(CriteriaType), nullable=False)
    category = Column(
        String(100), nullable=False
    )  # e.g., 'Demographic', 'Condition', 'Medication', 'Lab'

    # e.g., {"operator": ">=", "value": 18, "unit": "years"} OR {"icd10_codes": ["I50.1", "I50.2"]}
    rule_parameters = Column(JSONB, nullable=False)

    description = Column(String(255), nullable=True)  # Human-readable explanation

    trial = relationship("Trial", back_populates="criteria")