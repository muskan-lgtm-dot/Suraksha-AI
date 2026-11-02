from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password
from app.models.entities import User
from app.schemas.all_schemas import UserOut, UserUpdate, PasswordChange
from app.api.deps import get_current_user
from app.services.audit_service import log_audit

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("", response_model=UserOut)
def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name.strip()
    if update_data.phone is not None:
        current_user.phone = update_data.phone.strip()
    if update_data.emergency_notes is not None:
        current_user.emergency_notes = update_data.emergency_notes.strip()
        
    db.commit()
    db.refresh(current_user)
    log_audit(db, action="USER_PROFILE_UPDATED", resource_type="user", resource_id=current_user.id, actor_user_id=current_user.id)
    return current_user

@router.post("/change-password")
def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed"
        )
        
    current_user.password_hash = get_password_hash(data.new_password)
    db.commit()
    log_audit(db, action="PASSWORD_CHANGED", resource_type="user", resource_id=current_user.id, actor_user_id=current_user.id)
    return {"message": "Password updated successfully"}

@router.delete("")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log_audit(db, action="USER_ACCOUNT_DELETED", resource_type="user", resource_id=current_user.id, actor_user_id=current_user.id)
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all associated personal data have been completely deleted"}
