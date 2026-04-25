from sqlalchemy.orm import Session
from models.user import User, ApprovalStatus
from schemas.auth import UserCreate
from modules.auth_management.security import get_password_hash


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate):
    # Hash the password before saving
    hashed_pwd = get_password_hash(user_in.password)

    db_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role,
        org_id=user_in.org_id,
        designation=user_in.designation,
        corporate_id_number=user_in.corporate_id_number,
        hospital_license_number=user_in.hospital_license_number,
        mci_number=user_in.mci_number,
        approval_status=ApprovalStatus.pending,  # Strictly enforced for all new accounts
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_status(db: Session, email: str, status: ApprovalStatus):
    """Updates the approval status of a user."""
    user = get_user_by_email(db, email)
    if user:
        user.approval_status = status
        db.commit()
        db.refresh(user)
    return user
