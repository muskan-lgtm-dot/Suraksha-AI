from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship as orm_relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    emergency_notes = Column(Text, nullable=True)  # Allergies, blood type, medical conditions
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    contacts = orm_relationship("TrustedContact", back_populates="user", cascade="all, delete-orphan")
    incidents = orm_relationship("EmergencyIncident", back_populates="user", cascade="all, delete-orphan")
    location_shares = orm_relationship("LocationShare", back_populates="user", cascade="all, delete-orphan")
    reports = orm_relationship("SafetyReport", back_populates="user", cascade="all, delete-orphan")
    checkins = orm_relationship("CheckInSession", back_populates="user", cascade="all, delete-orphan")
    notifications = orm_relationship("InAppNotification", back_populates="user", cascade="all, delete-orphan")
    preferences = orm_relationship("NotificationPreference", back_populates="user", cascade="all, delete-orphan")


class TrustedContact(Base):
    __tablename__ = "trusted_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    relationship = Column(String(100), nullable=False)  # Parent, Sibling, Friend, Partner, Other
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    preferred_channel = Column(String(20), default="both", nullable=False)  # sms, email, both
    verification_status = Column(String(30), default="verified", nullable=False)  # verified, pending, unverified
    notification_consent = Column(Boolean, default=True, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = orm_relationship("User", back_populates="contacts")
    notifications = orm_relationship("EmergencyNotification", back_populates="contact", cascade="all, delete-orphan")


class EmergencyIncident(Base):
    __tablename__ = "emergency_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_reference = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    # draft, active, notification_pending, notification_sent, acknowledged, resolved, cancelled, notification_failed
    status = Column(String(40), default="active", nullable=False, index=True)
    severity = Column(String(20), default="critical", nullable=False)  # critical, high, medium, low
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_accuracy = Column(Float, nullable=True)  # in meters
    location_source = Column(String(50), default="gps", nullable=True)  # gps, network, manual
    location_timestamp = Column(DateTime, default=utc_now, nullable=True)
    address_text = Column(String(500), nullable=True)
    triggered_channel = Column(String(50), default="web_button", nullable=False)  # web_button, voice_command, checkin_timeout
    cancellation_reason = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)

    user = orm_relationship("User", back_populates="incidents")
    notifications = orm_relationship("EmergencyNotification", back_populates="incident", cascade="all, delete-orphan")


class EmergencyNotification(Base):
    __tablename__ = "emergency_notifications"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("emergency_incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    trusted_contact_id = Column(Integer, ForeignKey("trusted_contacts.id", ondelete="CASCADE"), nullable=False, index=True)
    channel = Column(String(20), nullable=False)  # in_app, sms, email
    # queued, sent_to_provider, delivered, acknowledged, failed
    status = Column(String(30), default="queued", nullable=False, index=True)
    provider_name = Column(String(50), default="mock", nullable=False)
    provider_message_id = Column(String(255), nullable=True)
    attempted_at = Column(DateTime, default=utc_now, nullable=False)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)

    incident = orm_relationship("EmergencyIncident", back_populates="notifications")
    contact = orm_relationship("TrustedContact", back_populates="notifications")


class LocationShare(Base):
    __tablename__ = "location_shares"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    label = Column(String(255), default="Live Safety Tracking", nullable=False)
    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)
    last_accuracy = Column(Float, nullable=True)
    last_updated_at = Column(DateTime, default=utc_now, nullable=True)
    expires_at = Column(DateTime, index=True, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = orm_relationship("User", back_populates="location_shares")


class SafetyReport(Base):
    __tablename__ = "safety_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # lighting, harassment, infrastructure, transport, other
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    approximate_location = Column(String(255), nullable=True)
    incident_time = Column(DateTime, default=utc_now, nullable=False)
    # pending_review, under_review, verified, rejected, archived
    moderation_status = Column(String(40), default="pending_review", nullable=False, index=True)
    classification_source = Column(String(40), default="rule_based", nullable=False)  # rule_based, ai_model, user_selected
    ai_suggested_category = Column(String(50), nullable=True)
    moderation_notes = Column(Text, nullable=True)
    is_public = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, index=True, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = orm_relationship("User", back_populates="reports")


class CheckInSession(Base):
    __tablename__ = "checkin_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    destination = Column(String(255), nullable=False)
    expected_arrival = Column(DateTime, nullable=False)
    status = Column(String(30), default="active", nullable=False)  # active, completed, expired, cancelled
    reminder_sent = Column(Boolean, default=False, nullable=False)
    alert_triggered = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    user = orm_relationship("User", back_populates="checkins")


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    channel = Column(String(30), nullable=False)  # sms, email, in_app, push
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = orm_relationship("User", back_populates="preferences")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details_json = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True, nullable=False)


class InAppNotification(Base):
    __tablename__ = "in_app_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="emergency", nullable=False)  # emergency, checkin, report, system
    is_read = Column(Boolean, default=False, nullable=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True, nullable=False)

    user = orm_relationship("User", back_populates="notifications")
