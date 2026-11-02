from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_token, generate_random_token
from app.models.entities import User, LocationShare
from app.schemas.all_schemas import (
    LocationShareCreate,
    LocationShareOut,
    PublicLocationShareOut,
    LocationUpdate
)
from app.api.deps import get_current_user
from app.services.audit_service import log_audit

router = APIRouter(prefix="/location-shares", tags=["Location Sharing"])
public_router = APIRouter(prefix="/public/location-shares", tags=["Public Location Tracking"])

def utc_now():
    return datetime.now(timezone.utc)

def is_share_active(share: LocationShare) -> bool:
    if share.revoked_at is not None:
        return False
    # Ensure timezone awareness for comparison
    expires = share.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    return expires > utc_now()

@router.post("", response_model=LocationShareOut, status_code=status.HTTP_201_CREATED)
def create_location_share(
    data: LocationShareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    raw_token = generate_random_token(32)
    t_hash = hash_token(raw_token)
    expires_at = utc_now() + timedelta(minutes=data.duration_minutes)

    share = LocationShare(
        user_id=current_user.id,
        token_hash=t_hash,
        label=data.label.strip(),
        last_latitude=data.latitude,
        last_longitude=data.longitude,
        last_accuracy=data.accuracy,
        last_updated_at=utc_now() if data.latitude else None,
        expires_at=expires_at,
        created_at=utc_now()
    )
    db.add(share)
    db.commit()
    db.refresh(share)

    log_audit(db, action="LOCATION_SHARE_CREATED", resource_type="location_share", resource_id=share.id, actor_user_id=current_user.id)

    return LocationShareOut(
        id=share.id,
        user_id=share.user_id,
        label=share.label,
        raw_token=raw_token,
        share_url=f"/track/{raw_token}",
        last_latitude=share.last_latitude,
        last_longitude=share.last_longitude,
        last_accuracy=share.last_accuracy,
        last_updated_at=share.last_updated_at,
        expires_at=share.expires_at,
        revoked_at=share.revoked_at,
        is_active=True,
        created_at=share.created_at
    )

@router.get("", response_model=List[LocationShareOut])
def list_my_shares(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shares = db.query(LocationShare).filter(
        LocationShare.user_id == current_user.id
    ).order_by(LocationShare.created_at.desc()).all()

    results = []
    for s in shares:
        active = is_share_active(s)
        results.append(LocationShareOut(
            id=s.id,
            user_id=s.user_id,
            label=s.label,
            raw_token=None,  # Do not re-expose raw token
            share_url=None,
            last_latitude=s.last_latitude,
            last_longitude=s.last_longitude,
            last_accuracy=s.last_accuracy,
            last_updated_at=s.last_updated_at,
            expires_at=s.expires_at,
            revoked_at=s.revoked_at,
            is_active=active,
            created_at=s.created_at
        ))
    return results

@router.patch("/{share_id}/location", response_model=LocationShareOut)
def update_share_location(
    share_id: int,
    loc: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    share = db.query(LocationShare).filter(
        LocationShare.id == share_id,
        LocationShare.user_id == current_user.id
    ).first()
    if not share:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location share not found")

    if not is_share_active(share):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Location share has expired or been revoked")

    share.last_latitude = loc.latitude
    share.last_longitude = loc.longitude
    share.last_accuracy = loc.accuracy
    share.last_updated_at = utc_now()
    db.commit()
    db.refresh(share)

    return LocationShareOut(
        id=share.id,
        user_id=share.user_id,
        label=share.label,
        raw_token=None,
        share_url=None,
        last_latitude=share.last_latitude,
        last_longitude=share.last_longitude,
        last_accuracy=share.last_accuracy,
        last_updated_at=share.last_updated_at,
        expires_at=share.expires_at,
        revoked_at=share.revoked_at,
        is_active=True,
        created_at=share.created_at
    )

@router.post("/{share_id}/revoke")
def revoke_location_share(
    share_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    share = db.query(LocationShare).filter(
        LocationShare.id == share_id,
        LocationShare.user_id == current_user.id
    ).first()
    if not share:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location share not found")

    share.revoked_at = utc_now()
    db.commit()
    log_audit(db, action="LOCATION_SHARE_REVOKED", resource_type="location_share", resource_id=share.id, actor_user_id=current_user.id)
    return {"message": "Location sharing session revoked immediately"}

@public_router.get("/{token}", response_model=PublicLocationShareOut)
def get_public_location_share(token: str, db: Session = Depends(get_db)):
    t_hash = hash_token(token)
    share = db.query(LocationShare).filter(LocationShare.token_hash == t_hash).first()
    if not share:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid tracking link")

    active = is_share_active(share)
    if not active:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This location sharing session has expired or was revoked by the user."
        )

    user = db.query(User).filter(User.id == share.user_id).first()
    first_name = user.full_name.split()[0] if user else "Protected User"

    return PublicLocationShareOut(
        label=share.label,
        sharer_first_name=first_name,
        last_latitude=share.last_latitude,
        last_longitude=share.last_longitude,
        last_accuracy=share.last_accuracy,
        last_updated_at=share.last_updated_at,
        expires_at=share.expires_at,
        is_active=active
    )
