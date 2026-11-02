import secrets
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.entities import EmergencyIncident, EmergencyNotification, TrustedContact, User
from app.schemas.all_schemas import EmergencyIncidentCreate
from app.services.notification_service import NotificationDispatcher
from app.services.audit_service import log_audit

def generate_incident_reference() -> str:
    now_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_hex = secrets.token_hex(2).upper()
    return f"SOS-{now_str}-{random_hex}"

def utc_now():
    return datetime.now(timezone.utc)

class EmergencyService:

    @classmethod
    def trigger_sos(
        cls,
        db: Session,
        user: User,
        data: EmergencyIncidentCreate,
        ip_address: Optional[str] = None
    ) -> EmergencyIncident:
        # Create incident in DB transactionally
        incident = EmergencyIncident(
            incident_reference=generate_incident_reference(),
            user_id=user.id,
            status="notification_pending",
            severity=data.severity,
            latitude=data.latitude,
            longitude=data.longitude,
            location_accuracy=data.location_accuracy,
            location_source=data.location_source,
            location_timestamp=utc_now(),
            address_text=data.address_text,
            triggered_channel=data.triggered_channel,
            created_at=utc_now()
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)

        # Audit log creation
        log_audit(
            db,
            action="EMERGENCY_SOS_ACTIVATED",
            resource_type="incident",
            resource_id=incident.id,
            actor_user_id=user.id,
            details={
                "reference": incident.incident_reference,
                "severity": incident.severity,
                "coordinates": [incident.latitude, incident.longitude] if incident.latitude else None
            },
            ip_address=ip_address
        )

        # Fetch active eligible contacts
        contacts = db.query(TrustedContact).filter(
            TrustedContact.user_id == user.id,
            TrustedContact.is_enabled == True,
            TrustedContact.notification_consent == True
        ).order_by(TrustedContact.display_order.asc()).all()

        try:
            notifications = NotificationDispatcher.send_incident_notifications(
                db=db,
                incident=incident,
                contacts=contacts,
                user=user
            )
            incident.status = "notification_sent" if notifications else "active"
        except Exception as e:
            incident.status = "notification_failed"
            log_audit(
                db,
                action="NOTIFICATION_DISPATCH_FAILED",
                resource_type="incident",
                resource_id=incident.id,
                actor_user_id=user.id,
                details={"error": str(e)}
            )

        db.commit()
        db.refresh(incident)
        return incident

    @classmethod
    def cancel_incident(
        cls,
        db: Session,
        incident_id: int,
        user_id: int,
        reason: str,
        ip_address: Optional[str] = None
    ) -> EmergencyIncident:
        incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency incident not found")

        if incident.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        if incident.status in ("resolved", "cancelled"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Incident is already {incident.status}")

        incident.status = "cancelled"
        incident.cancellation_reason = reason
        incident.cancelled_at = utc_now()
        db.commit()
        db.refresh(incident)

        log_audit(
            db,
            action="EMERGENCY_SOS_CANCELLED",
            resource_type="incident",
            resource_id=incident.id,
            actor_user_id=user_id,
            details={"reason": reason},
            ip_address=ip_address
        )
        return incident

    @classmethod
    def resolve_incident(
        cls,
        db: Session,
        incident_id: int,
        user_id: int,
        resolution_notes: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> EmergencyIncident:
        incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency incident not found")

        if incident.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        if incident.status in ("resolved", "cancelled"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Incident is already {incident.status}")

        incident.status = "resolved"
        incident.resolution_notes = resolution_notes or "Resolved safely."
        incident.resolved_at = utc_now()
        db.commit()
        db.refresh(incident)

        log_audit(
            db,
            action="EMERGENCY_SOS_RESOLVED",
            resource_type="incident",
            resource_id=incident.id,
            actor_user_id=user_id,
            details={"notes": incident.resolution_notes},
            ip_address=ip_address
        )
        return incident

    @classmethod
    def acknowledge_incident(
        cls,
        db: Session,
        incident_id: int,
        contact_id: Optional[int] = None
    ) -> EmergencyIncident:
        incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency incident not found")

        if incident.status not in ("resolved", "cancelled"):
            incident.status = "acknowledged"

        if contact_id:
            notif = db.query(EmergencyNotification).filter(
                EmergencyNotification.incident_id == incident_id,
                EmergencyNotification.trusted_contact_id == contact_id
            ).first()
            if notif:
                notif.status = "acknowledged"
                notif.acknowledged_at = utc_now()

        db.commit()
        db.refresh(incident)
        return incident
