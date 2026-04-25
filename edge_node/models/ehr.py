import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class LocalPatient(Base):
    """Dummy local EHR table representing patients"""
    __tablename__ = "local_patients"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)

class PatientCondition(Base):
    """Dummy local EHR table representing diagnoses"""
    __tablename__ = "patient_conditions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("local_patients.id", ondelete="CASCADE"))
    icd10_code = Column(String(20), nullable=False)
