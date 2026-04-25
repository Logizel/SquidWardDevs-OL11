from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from models.user import UserRole, ApprovalStatus
from datetime import datetime


# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    role: UserRole
    designation: Optional[str] = None
    corporate_id_number: Optional[str] = None
    hospital_license_number: Optional[str] = None
    mci_number: Optional[str] = None


# Properties to receive on account creation
class UserCreate(UserBase):
    password: str
    org_id: Optional[UUID] = None


# Properties to return to the client
class UserResponse(UserBase):
    id: UUID
    org_id: Optional[UUID]
    approval_status: ApprovalStatus
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class UserUpdateStatus(BaseModel):
    approval_status: ApprovalStatus
