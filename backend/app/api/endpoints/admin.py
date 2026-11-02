from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, SafetyReport, EmergencyIncident, EmergencyNotification, AuditEvent
from app.schemas.all_schemas import SafetyReportOut, ModerationUpdate
from app.api.deps import get_current_admin
from app.services.audit_service import log_audit

router = APIRouter(prefix="/admin", tags=["Administration & Moderation"])

@router.get("/reports", response_model=List[SafetyReportOut])
def list_moderation_queue(
    status_filter: Optional[str] = None,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(SafetyReport)
    if status_filter and status_filter != "all":
        query = query.filter(SafetyReport.moderation_status == status_filter)
    return query.order_by(SafetyReport.created_at.desc()).all()

@router.patch("/reports/{report_id}/moderate", response_model=SafetyReportOut)
def moderate_report(
    report_id: int,
    data: ModerationUpdate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    report = db.query(SafetyReport).filter(SafetyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    report.moderation_status = data.moderation_status
    if data.moderation_notes:
        report.moderation_notes = data.moderation_notes.strip()

    db.commit()
    db.refresh(report)

    log_audit(
        db,
        action="REPORT_MODERATED",
        resource_type="report",
        resource_id=report.id,
        actor_user_id=admin_user.id,
        details={"new_status": data.moderation_status, "notes": data.moderation_notes}
    )
    return report

@router.get("/stats")
def get_system_stats(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_incidents = db.query(EmergencyIncident).count()
    active_incidents = db.query(EmergencyIncident).filter(
        EmergencyIncident.status.in_(["active", "notification_sent", "notification_pending"])
    ).count()
    total_notifications = db.query(EmergencyNotification).count()
    failed_notifications = db.query(EmergencyNotification).filter(EmergencyNotification.status == "failed").count()
    total_reports = db.query(SafetyReport).count()
    pending_reports = db.query(SafetyReport).filter(SafetyReport.moderation_status == "pending_review").count()

    return {
        "total_users": total_users,
        "total_incidents": total_incidents,
        "active_incidents": active_incidents,
        "total_notifications": total_notifications,
        "failed_notifications": failed_notifications,
        "notification_success_rate": round(
            ((total_notifications - failed_notifications) / total_notifications * 100) if total_notifications > 0 else 100.0,
            1
        ),
        "total_reports": total_reports,
        "pending_moderation_reports": pending_reports
    }

@router.get("/audit-logs")
def list_audit_logs(
    limit: int = 50,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "actor_user_id": l.actor_user_id,
            "details_json": l.details_json,
            "ip_address": l.ip_address,
            "created_at": l.created_at
        }
        for l in logs
    ]
