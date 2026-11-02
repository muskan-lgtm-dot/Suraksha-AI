from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# ----------------- AUTH & USER -----------------
class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    password: str = Field(..., min_length=8, max_length=128)
    phone: Optional[str] = None
    emergency_notes: Optional[str] = None

class UserLogin(BaseModel):
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    emergency_notes: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    emergency_notes: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ----------------- TRUSTED CONTACTS -----------------
class TrustedContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    relationship: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=6, max_length=50)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    preferred_channel: str = Field(default="both")  # sms, email, both
    is_enabled: bool = True
    notification_consent: bool = True

class TrustedContactUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = Field(default=None, pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    preferred_channel: Optional[str] = None
    is_enabled: Optional[bool] = None
    display_order: Optional[int] = None
    verification_status: Optional[str] = None

class TrustedContactOut(BaseModel):
    id: int
    user_id: int
    name: str
    relationship: str
    phone: str
    email: str
    preferred_channel: str
    verification_status: str
    notification_consent: bool
    is_enabled: bool
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- EMERGENCY INCIDENTS & NOTIFICATIONS -----------------
class EmergencyIncidentCreate(BaseModel):
    severity: str = "critical"  # critical, high, medium, low
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_accuracy: Optional[float] = None
    location_source: Optional[str] = "gps"
    address_text: Optional[str] = None
    triggered_channel: str = "web_button"  # web_button, voice_command, checkin_timeout

class IncidentCancelRequest(BaseModel):
    reason: str = Field(..., min_length=3)

class IncidentResolveRequest(BaseModel):
    resolution_notes: Optional[str] = "Self-resolved safely."

class EmergencyNotificationOut(BaseModel):
    id: int
    incident_id: int
    trusted_contact_id: int
    channel: str
    status: str
    provider_name: str
    provider_message_id: Optional[str] = None
    attempted_at: datetime
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EmergencyIncidentOut(BaseModel):
    id: int
    incident_reference: str
    user_id: int
    status: str
    severity: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_accuracy: Optional[float] = None
    location_source: Optional[str] = None
    location_timestamp: Optional[datetime] = None
    address_text: Optional[str] = None
    triggered_channel: str
    cancellation_reason: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    notifications: List[EmergencyNotificationOut] = []

    model_config = ConfigDict(from_attributes=True)

# ----------------- LOCATION SHARING -----------------
class LocationShareCreate(BaseModel):
    duration_minutes: int = Field(default=60, ge=5, le=1440)  # Between 5 mins and 24 hours
    label: str = Field(default="Live Safety Tracking", max_length=255)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None

class LocationShareOut(BaseModel):
    id: int
    user_id: int
    label: str
    raw_token: Optional[str] = None  # Returned only on creation
    share_url: Optional[str] = None
    last_latitude: Optional[float] = None
    last_longitude: Optional[float] = None
    last_accuracy: Optional[float] = None
    last_updated_at: Optional[datetime] = None
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PublicLocationShareOut(BaseModel):
    label: str
    sharer_first_name: str
    last_latitude: Optional[float] = None
    last_longitude: Optional[float] = None
    last_accuracy: Optional[float] = None
    last_updated_at: Optional[datetime] = None
    expires_at: datetime
    is_active: bool

# ----------------- SAFETY REPORTS -----------------
class SafetyReportCreate(BaseModel):
    category: str = Field(..., max_length=50)  # lighting, harassment, infrastructure, transport, other
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    latitude: float
    longitude: float
    approximate_location: Optional[str] = None
    incident_time: Optional[datetime] = None

class SafetyReportUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class ModerationUpdate(BaseModel):
    moderation_status: str  # pending_review, under_review, verified, rejected, archived
    moderation_notes: Optional[str] = None

class SafetyReportOut(BaseModel):
    id: int
    user_id: int
    category: str
    title: str
    description: str
    latitude: float
    longitude: float
    approximate_location: Optional[str] = None
    incident_time: datetime
    moderation_status: str
    classification_source: str
    ai_suggested_category: Optional[str] = None
    moderation_notes: Optional[str] = None
    is_public: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- CHECK-IN SESSIONS -----------------
class CheckInCreate(BaseModel):
    destination: str = Field(..., min_length=2, max_length=255)
    expected_duration_minutes: int = Field(..., ge=5, le=720)  # up to 12 hours

class CheckInOut(BaseModel):
    id: int
    user_id: int
    destination: str
    expected_arrival: datetime
    status: str
    reminder_sent: bool
    alert_triggered: bool
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- IN-APP NOTIFICATIONS & PREFERENCES -----------------
class InAppNotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationPreferenceOut(BaseModel):
    id: int
    channel: str
    enabled: bool

    model_config = ConfigDict(from_attributes=True)

class NotificationPreferenceUpdate(BaseModel):
    channel: str
    enabled: bool

# ----------------- AI ASSISTANT & CLASSIFICATION -----------------
class AiChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    context: Optional[str] = None

class AiChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []
    source: str = "rule_based"  # "rule_based", "ai_model"
    is_emergency_flagged: bool = False

class AiClassificationRequest(BaseModel):
    text: str = Field(..., min_length=3)

class AiClassificationResponse(BaseModel):
    suggested_category: str
    confidence: float
    source: str
    explanation: str

# ----------------- HEALTH & STATS -----------------
class SystemHealthOut(BaseModel):
    status: str
    version: str
    environment: str
    database: str
    sms_provider: str
    email_provider: str
    ai_provider: str
    timestamp: datetime
