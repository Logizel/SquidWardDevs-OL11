import uuid
import enum
from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class NegotiationStatus(str, enum.Enum):
    drafting = "drafting"
    review_required = "review_required"
    approved = "approved"
    signed = "signed"


class Negotiation(Base):
    __tablename__ = "negotiations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trial_id = Column(
        UUID(as_uuid=True), ForeignKey("trials.id", ondelete="CASCADE"), nullable=False
    )
    hospital_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )  # The Site Admin

    status = Column(Enum(NegotiationStatus), default=NegotiationStatus.drafting)

    # Store the AI-generated documents
    dua_content = Column(Text, nullable=True)
    irb_package = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    trial = relationship("Trial")
    hospital = relationship("User")
