from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, CheckInSession
from app.schemas.all_schemas import CheckInCreate, CheckInOut
from app.api.deps import get_current_user
from app.services.audit_service import log_audit

router = APIRouter(prefix="/checkins", tags=["Journey Check-Ins"])

def utc_now():
    return datetime.now(timezone.utc)

@router.post("", response_model=CheckInOut, status_code=status.HTTP_201_CREATED)
def start_checkin(
    data: CheckInCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expected_arrival = utc_now() + timedelta(minutes=data.expected_duration_minutes)
    session = CheckInSession(
        user_id=current_user.id,
        destination=data.destination.strip(),
        expected_arrival=expected_arrival,
        status="active",
        reminder_sent=False,
        alert_triggered=False,
        created_at=utc_now()
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    log_audit(db, action="CHECKIN_STARTED", resource_type="checkin", resource_id=session.id, actor_user_id=current_user.id)
    return session

@router.get("", response_model=List[CheckInOut])
def list_checkins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if any active check-in has expired and mark status accordingly
    checkins = db.query(CheckInSession).filter(
        CheckInSession.user_id == current_user.id
    ).order_by(CheckInSession.created_at.desc()).limit(30).all()

    now = utc_now()
    for c in checkins:
        exp = c.expected_arrival
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if c.status == "active" and exp < now:
            c.status = "expired"
            db.commit()

    return checkins

@router.post("/{checkin_id}/complete", response_model=CheckInOut)
def complete_checkin(
    checkin_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(CheckInSession).filter(
        CheckInSession.id == checkin_id,
        CheckInSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Check-in session not found")

    session.status = "completed"
    session.completed_at = utc_now()
    db.commit()
    db.refresh(session)

    log_audit(db, action="CHECKIN_COMPLETED_SAFELY", resource_type="checkin", resource_id=session.id, actor_user_id=current_user.id)
    return session

@router.post("/{checkin_id}/cancel", response_model=CheckInOut)
def cancel_checkin(
    checkin_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(CheckInSession).filter(
        CheckInSession.id == checkin_id,
        CheckInSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Check-in session not found")

    session.status = "cancelled"
    db.commit()
    db.refresh(session)
    return session
