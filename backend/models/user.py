import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base


class UserRole(str, enum.Enum):
    sponsor = "sponsor"
    coordinator = "coordinator"
    site_admin = "site_admin"
    super_admin = "super_admin"  # Needed later for the person approving accounts


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    # --- Compliance & Legitimacy Fields ---
    designation = Column(String(100), nullable=True)
    corporate_id_number = Column(String(100), nullable=True)  # For Sponsors (CIN)
    hospital_license_number = Column(
        String(100), nullable=True
    )  # For Site Admins (NABH)
    mci_number = Column(String(100), nullable=True)  # For Site Admins (MCI)

    # --- Workflow State ---
    approval_status = Column(Enum(ApprovalStatus), default=ApprovalStatus.pending)
    is_active = Column(Boolean, default=True)  # Used for soft-deletes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
