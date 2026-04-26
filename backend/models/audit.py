import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trial_id = Column(UUID(as_uuid=True), ForeignKey("trials.id", ondelete="CASCADE"))
    hospital_name = Column(String(255), nullable=False)

    true_count = Column(Integer)
    fuzzed_count = Column(Integer)
    sql_query = Column(Text)
    execution_proof = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
