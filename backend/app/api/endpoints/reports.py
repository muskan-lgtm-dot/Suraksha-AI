from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, SafetyReport
from app.schemas.all_schemas import SafetyReportCreate, SafetyReportUpdate, SafetyReportOut
from app.api.deps import get_current_user, get_optional_current_user
from app.services.ai_service import SafetyReportClassifier
from app.services.audit_service import log_audit

router = APIRouter(prefix="/reports", tags=["Community Safety Reports"])

def utc_now():
    return datetime.now(timezone.utc)

@router.post("", response_model=SafetyReportOut, status_code=status.HTTP_201_CREATED)
def submit_report(
    report_in: SafetyReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Run advisory AI classification
    combined_text = f"{report_in.title}. {report_in.description}"
    ai_result = SafetyReportClassifier.classify(combined_text)

    # Determine classification source
    source = "user_selected"
    if report_in.category == ai_result.suggested_category:
        source = "ai_model_confirmed"

    report = SafetyReport(
        user_id=current_user.id,
        category=report_in.category,
        title=report_in.title.strip(),
        description=report_in.description.strip(),
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        approximate_location=report_in.approximate_location or f"Near {report_in.latitude:.3f}, {report_in.longitude:.3f}",
        incident_time=report_in.incident_time or utc_now(),
        moderation_status="pending_review",
        classification_source=source,
        ai_suggested_category=ai_result.suggested_category,
        is_public=True,
        created_at=utc_now()
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    log_audit(db, action="SAFETY_REPORT_SUBMITTED", resource_type="report", resource_id=report.id, actor_user_id=current_user.id)
    return report

@router.get("/mine", response_model=List[SafetyReportOut])
def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SafetyReport).filter(
        SafetyReport.user_id == current_user.id
    ).order_by(SafetyReport.created_at.desc()).all()

@router.get("", response_model=List[SafetyReportOut])
def list_public_reports(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SafetyReport).filter(
        SafetyReport.moderation_status.in_(["verified", "pending_review"]),
        SafetyReport.is_public == True
    )
    if category and category != "all":
        query = query.filter(SafetyReport.category == category)

    reports = query.order_by(SafetyReport.created_at.desc()).limit(150).all()
    # For public privacy, round coordinates slightly (3 decimal places approx 110m)
    fuzzed_reports = []
    for r in reports:
        # Create shallow copy or preserve
        fuzzed_reports.append(SafetyReportOut(
            id=r.id,
            user_id=r.user_id,
            category=r.category,
            title=r.title,
            description=r.description,
            latitude=round(r.latitude, 3),
            longitude=round(r.longitude, 3),
            approximate_location=r.approximate_location,
            incident_time=r.incident_time,
            moderation_status=r.moderation_status,
            classification_source=r.classification_source,
            ai_suggested_category=r.ai_suggested_category,
            moderation_notes=r.moderation_notes,
            is_public=r.is_public,
            created_at=r.created_at,
            updated_at=r.updated_at
        ))
    return fuzzed_reports

@router.get("/{report_id}", response_model=SafetyReportOut)
def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    report = db.query(SafetyReport).filter(SafetyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety report not found")
    return report

@router.patch("/{report_id}", response_model=SafetyReportOut)
def update_report(
    report_id: int,
    update_in: SafetyReportUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(SafetyReport).filter(
        SafetyReport.id == report_id,
        SafetyReport.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety report not found")

    if update_in.category is not None:
        report.category = update_in.category
    if update_in.title is not None:
        report.title = update_in.title.strip()
    if update_in.description is not None:
        report.description = update_in.description.strip()
    if update_in.is_public is not None:
        report.is_public = update_in.is_public

    db.commit()
    db.refresh(report)
    return report

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(SafetyReport).filter(
        SafetyReport.id == report_id,
        SafetyReport.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety report not found")

    db.delete(report)
    db.commit()
    log_audit(db, action="SAFETY_REPORT_DELETED", resource_type="report", resource_id=report_id, actor_user_id=current_user.id)
    return {"message": "Report withdrawn successfully"}
