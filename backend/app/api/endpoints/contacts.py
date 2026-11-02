from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, TrustedContact
from app.schemas.all_schemas import TrustedContactCreate, TrustedContactUpdate, TrustedContactOut
from app.api.deps import get_current_user
from app.services.audit_service import log_audit

router = APIRouter(prefix="/contacts", tags=["Trusted Contacts"])

MAX_CONTACTS_PER_USER = 10

@router.get("", response_model=List[TrustedContactOut])
def list_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(TrustedContact).filter(
        TrustedContact.user_id == current_user.id
    ).order_by(TrustedContact.display_order.asc(), TrustedContact.created_at.asc()).all()

@router.post("", response_model=TrustedContactOut, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact_in: TrustedContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).count()
    if count >= MAX_CONTACTS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum limit of {MAX_CONTACTS_PER_USER} trusted contacts reached"
        )

    contact = TrustedContact(
        user_id=current_user.id,
        name=contact_in.name.strip(),
        relationship=contact_in.relationship.strip(),
        phone=contact_in.phone.strip(),
        email=contact_in.email.lower().strip(),
        preferred_channel=contact_in.preferred_channel,
        is_enabled=contact_in.is_enabled,
        notification_consent=contact_in.notification_consent,
        verification_status="verified",
        display_order=count
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    log_audit(db, action="TRUSTED_CONTACT_ADDED", resource_type="contact", resource_id=contact.id, actor_user_id=current_user.id)
    return contact

@router.get("/{contact_id}", response_model=TrustedContactOut)
def get_contact(
    contact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contact = db.query(TrustedContact).filter(
        TrustedContact.id == contact_id,
        TrustedContact.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return contact

@router.patch("/{contact_id}", response_model=TrustedContactOut)
def update_contact(
    contact_id: int,
    contact_in: TrustedContactUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contact = db.query(TrustedContact).filter(
        TrustedContact.id == contact_id,
        TrustedContact.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trusted contact not found")

    if contact_in.name is not None:
        contact.name = contact_in.name.strip()
    if contact_in.relationship is not None:
        contact.relationship = contact_in.relationship.strip()
    if contact_in.phone is not None:
        contact.phone = contact_in.phone.strip()
    if contact_in.email is not None:
        contact.email = contact_in.email.lower().strip()
    if contact_in.preferred_channel is not None:
        contact.preferred_channel = contact_in.preferred_channel
    if contact_in.is_enabled is not None:
        contact.is_enabled = contact_in.is_enabled
    if contact_in.display_order is not None:
        contact.display_order = contact_in.display_order
    if contact_in.verification_status is not None:
        contact.verification_status = contact_in.verification_status

    db.commit()
    db.refresh(contact)
    log_audit(db, action="TRUSTED_CONTACT_UPDATED", resource_type="contact", resource_id=contact.id, actor_user_id=current_user.id)
    return contact

@router.delete("/{contact_id}")
def delete_contact(
    contact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contact = db.query(TrustedContact).filter(
        TrustedContact.id == contact_id,
        TrustedContact.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trusted contact not found")

    db.delete(contact)
    db.commit()
    log_audit(db, action="TRUSTED_CONTACT_DELETED", resource_type="contact", resource_id=contact_id, actor_user_id=current_user.id)
    return {"message": "Contact removed successfully"}
