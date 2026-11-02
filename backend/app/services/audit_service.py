import json
from datetime import datetime, timezone
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.entities import AuditEvent

def log_audit(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    actor_user_id: Optional[int] = None,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None
) -> AuditEvent:
    details_str = json.dumps(details) if isinstance(details, (dict, list)) else (str(details) if details else None)
    event = AuditEvent(
        actor_user_id=actor_user_id,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id is not None else None,
        details_json=details_str,
        ip_address=ip_address,
        created_at=datetime.now(timezone.utc)
    )
    db.add(event)
    db.commit()
    return event
