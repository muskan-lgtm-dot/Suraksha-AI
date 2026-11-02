from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, EmergencyIncident, EmergencyNotification, TrustedContact
from app.schemas.all_schemas import (
    EmergencyIncidentCreate,
    EmergencyIncidentOut,
    IncidentCancelRequest,
    IncidentResolveRequest,
    EmergencyNotificationOut
)
from app.api.deps import get_current_user
from app.services.emergency_service import EmergencyService

router = APIRouter(prefix="/incidents", tags=["Emergency Incidents"])

def build_incident_out(incident: EmergencyIncident, db: Session) -> EmergencyIncidentOut:
    notifs = db.query(EmergencyNotification).filter(EmergencyNotification.incident_id == incident.id).all()
    notif_outs = []
    for n in notifs:
        contact = db.query(TrustedContact).filter(TrustedContact.id == n.trusted_contact_id).first()
        out = EmergencyNotificationOut(
            id=n.id,
            incident_id=n.incident_id,
            trusted_contact_id=n.trusted_contact_id,
            channel=n.channel,
            status=n.status,
            provider_name=n.provider_name,
            provider_message_id=n.provider_message_id,
            attempted_at=n.attempted_at,
            sent_at=n.sent_at,
            delivered_at=n.delivered_at,
            acknowledged_at=n.acknowledged_at,
            error_code=n.error_code,
            error_message=n.error_message,
            contact_name=contact.name if contact else None,
            contact_phone=contact.phone if contact else None,
            contact_email=contact.email if contact else None
        )
        notif_outs.append(out)

    return EmergencyIncidentOut(
        id=incident.id,
        incident_reference=incident.incident_reference,
        user_id=incident.user_id,
        status=incident.status,
        severity=incident.severity,
        latitude=incident.latitude,
        longitude=incident.longitude,
        location_accuracy=incident.location_accuracy,
        location_source=incident.location_source,
        location_timestamp=incident.location_timestamp,
        address_text=incident.address_text,
        triggered_channel=incident.triggered_channel,
        cancellation_reason=incident.cancellation_reason,
        resolution_notes=incident.resolution_notes,
        created_at=incident.created_at,
        updated_at=incident.updated_at,
        resolved_at=incident.resolved_at,
        cancelled_at=incident.cancelled_at,
        notifications=notif_outs
    )

@router.post("", response_model=EmergencyIncidentOut, status_code=status.HTTP_201_CREATED)
def trigger_sos(
    incident_in: EmergencyIncidentCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ip_addr = request.client.host if request.client else None
    incident = EmergencyService.trigger_sos(
        db=db,
        user=current_user,
        data=incident_in,
        ip_address=ip_addr
    )
    return build_incident_out(incident, db)

@router.get("/active", response_model=Optional[EmergencyIncidentOut])
def get_active_incident(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = db.query(EmergencyIncident).filter(
        EmergencyIncident.user_id == current_user.id,
        EmergencyIncident.status.in_(["draft", "active", "notification_pending", "notification_sent", "acknowledged"])
    ).order_by(EmergencyIncident.created_at.desc()).first()

    if not incident:
        return None
    return build_incident_out(incident, db)

@router.get("", response_model=List[EmergencyIncidentOut])
def list_incidents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incidents = db.query(EmergencyIncident).filter(
        EmergencyIncident.user_id == current_user.id
    ).order_by(EmergencyIncident.created_at.desc()).limit(100).all()

    return [build_incident_out(inc, db) for inc in incidents]

@router.get("/{incident_id}", response_model=EmergencyIncidentOut)
def get_incident(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency incident not found")

    if incident.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return build_incident_out(incident, db)

@router.post("/{incident_id}/cancel", response_model=EmergencyIncidentOut)
def cancel_incident(
    incident_id: int,
    data: IncidentCancelRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ip_addr = request.client.host if request.client else None
    incident = EmergencyService.cancel_incident(
        db=db,
        incident_id=incident_id,
        user_id=current_user.id,
        reason=data.reason,
        ip_address=ip_addr
    )
    return build_incident_out(incident, db)

@router.post("/{incident_id}/resolve", response_model=EmergencyIncidentOut)
def resolve_incident(
    incident_id: int,
    data: IncidentResolveRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ip_addr = request.client.host if request.client else None
    incident = EmergencyService.resolve_incident(
        db=db,
        incident_id=incident_id,
        user_id=current_user.id,
        resolution_notes=data.resolution_notes,
        ip_address=ip_addr
    )
    return build_incident_out(incident, db)

@router.post("/{incident_id}/acknowledge", response_model=EmergencyIncidentOut)
def acknowledge_incident(
    incident_id: int,
    contact_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    incident = EmergencyService.acknowledge_incident(db, incident_id, contact_id)
    return build_incident_out(incident, db)
