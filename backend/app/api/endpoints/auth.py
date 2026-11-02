from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.entities import User
from app.schemas.all_schemas import UserCreate, UserLogin, UserOut, TokenOut
from app.api.deps import get_current_user
from app.services.audit_service import log_audit

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    # Hash password securely
    hashed_password = get_password_hash(user_in.password)
    
    user = User(
        full_name=user_in.full_name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=hashed_password,
        phone=user_in.phone.strip() if user_in.phone else None,
        emergency_notes=user_in.emergency_notes,
        is_active=True,
        is_admin=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    log_audit(db, action="USER_REGISTERED", resource_type="user", resource_id=user.id, actor_user_id=user.id)
    
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return TokenOut(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.post("/login", response_model=TokenOut)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower().strip()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account has been deactivated"
        )
        
    token = create_access_token({"sub": str(user.id), "email": user.email})
    log_audit(db, action="USER_LOGGED_IN", resource_type="user", resource_id=user.id, actor_user_id=user.id)
    return TokenOut(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}
