from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from schemas.auth import UserResponse, UserCreate, Token, UserUpdateStatus
from modules.auth_management import service, security
from modules.auth_management.dependencies import get_db
from models.user import User, UserRole, ApprovalStatus

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user into the pending approval queue."""

    # Security Rule: Coordinators cannot self-register.
    if user_in.role == UserRole.coordinator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coordinators cannot self-register. Please contact your Site Admin.",
        )

    user = service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    return service.create_user(db, user_in)


@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Authenticates a user, checks approval status, and returns a JWT."""
    user = service.get_user_by_email(
        db, email=form_data.username
    )  # OAuth2 uses 'username' for email

    if not user or not security.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Security Rule: Block login if pending or rejected
    if user.approval_status != ApprovalStatus.approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user.approval_status}. Pending Super Admin verification.",
        )

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(security.get_current_user)):
    """Returns the profile of the currently logged-in user."""
    return current_user


@router.patch("/admin/users/{email}/status", response_model=UserResponse)
def update_user_approval_status(
    email: str,
    status_update: UserUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(security.get_current_user),  # Requires a valid JWT
):
    """Super Admin endpoint to approve or reject users."""

    # 🛡️ RBAC Security Check: Only Super Admins allowed!
    if current_user.role != UserRole.super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Super Admins can perform this action.",
        )

    user = service.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return service.update_user_status(db, email, status_update.approval_status)
