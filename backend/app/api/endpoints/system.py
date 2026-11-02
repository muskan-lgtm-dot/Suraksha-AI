from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.entities import (
    User,
    TrustedContact,
    SafetyReport,
    EmergencyIncident,
    EmergencyNotification,
    CheckInSession,
    InAppNotification
)
from app.schemas.all_schemas import SystemHealthOut

router = APIRouter(tags=["System & Demo Seed"])

def utc_now():
    return datetime.now(timezone.utc)

@router.get("/health", response_model=SystemHealthOut)
def health_check():
    return SystemHealthOut(
        status="healthy",
        version=settings.VERSION,
        environment=settings.APP_ENV,
        database="connected",
        sms_provider=settings.SMS_PROVIDER,
        email_provider=settings.EMAIL_PROVIDER,
        ai_provider=settings.AI_PROVIDER,
        timestamp=utc_now()
    )

@router.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    # Simple query to verify DB is reachable
    try:
        db.query(User).count()
        return {"status": "ready", "database": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@router.post("/api/demo/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    """
    Seeds safe, realistic fictional demo data for hackathon presentation.
    All data is clearly marked as DEMO.
    """
    # 1. Create or update Demo User
    demo_user = db.query(User).filter(User.email == "demo@suraksha.ai").first()
    if not demo_user:
        demo_user = User(
            full_name="Aarohi Sen (DEMO)",
            email="demo@suraksha.ai",
            password_hash=get_password_hash("DemoSafe#2026"),
            phone="+919876543210",
            emergency_notes="Blood Type: O+ | No known allergies | Asthma inhaler in handbag",
            is_active=True,
            is_admin=False
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # 2. Create or update Admin User
    admin_user = db.query(User).filter(User.email == "admin@suraksha.ai").first()
    if not admin_user:
        admin_user = User(
            full_name="Suraksha Safety Admin",
            email="admin@suraksha.ai",
            password_hash=get_password_hash("AdminSafe#2026"),
            phone="+919999900000",
            emergency_notes=None,
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    # 3. Seed Trusted Contacts for demo user if none exist
    if db.query(TrustedContact).filter(TrustedContact.user_id == demo_user.id).count() == 0:
        c1 = TrustedContact(
            user_id=demo_user.id,
            name="Ananya Sen (Sister)",
            relationship="Sister",
            phone="+919811122233",
            email="ananya.sen.demo@example.com",
            preferred_channel="both",
            verification_status="verified",
            notification_consent=True,
            is_enabled=True,
            display_order=0
        )
        c2 = TrustedContact(
            user_id=demo_user.id,
            name="Priya Patel (Roommate)",
            relationship="Friend",
            phone="+919822233344",
            email="priya.patel.demo@example.com",
            preferred_channel="sms",
            verification_status="verified",
            notification_consent=True,
            is_enabled=True,
            display_order=1
        )
        c3 = TrustedContact(
            user_id=demo_user.id,
            name="Rajesh Sen (Father)",
            relationship="Parent",
            phone="+919833344455",
            email="rajesh.sen.demo@example.com",
            preferred_channel="both",
            verification_status="verified",
            notification_consent=True,
            is_enabled=True,
            display_order=2
        )
        db.add_all([c1, c2, c3])
        db.commit()

    # 4. Seed realistic sample safety reports if none exist
    if db.query(SafetyReport).count() == 0:
        reports = [
            SafetyReport(
                user_id=demo_user.id,
                category="lighting",
                title="Non-functional streetlights along Outer Ring Road underpass",
                description="Entire 200m stretch under the flyover is pitch black after 7 PM. Pedestrians must walk in darkness.",
                latitude=28.5355,
                longitude=77.2410,
                approximate_location="Kalkaji Underpass, New Delhi",
                incident_time=utc_now() - timedelta(days=1),
                moderation_status="verified",
                classification_source="ai_model_confirmed",
                ai_suggested_category="lighting",
                moderation_notes="Verified by community moderators. Municipal report submitted.",
                is_public=True
            ),
            SafetyReport(
                user_id=demo_user.id,
                category="harassment",
                title="Loitering and verbal catcalling near Metro Gate 3",
                description="Group of men loitering near unmonitored ticket counter exit shouting vulgar comments at solo women commuters.",
                latitude=28.5672,
                longitude=77.2100,
                approximate_location="South Extension Metro, Delhi",
                incident_time=utc_now() - timedelta(days=2),
                moderation_status="verified",
                classification_source="rule_based",
                ai_suggested_category="harassment",
                moderation_notes="Flagged for increased PCR van patrolling.",
                is_public=True
            ),
            SafetyReport(
                user_id=demo_user.id,
                category="infrastructure",
                title="Broken pedestrian sidewalk and open drainage pit",
                description="Pedestrian walkway collapsed into an open pit with no barricade or warning lights. High tripping hazard.",
                latitude=28.6139,
                longitude=77.2090,
                approximate_location="Janpath Road, Central Delhi",
                incident_time=utc_now() - timedelta(hours=8),
                moderation_status="pending_review",
                classification_source="rule_based",
                ai_suggested_category="infrastructure",
                is_public=True
            ),
            SafetyReport(
                user_id=demo_user.id,
                category="transport",
                title="Unauthorized auto-rickshaw fare surge and route diversion",
                description="Autos refusing meter fare and taking unlit service lanes instead of main highway.",
                latitude=28.4595,
                longitude=77.0266,
                approximate_location="Cyber City junction, Gurugram",
                incident_time=utc_now() - timedelta(days=3),
                moderation_status="verified",
                classification_source="user_selected",
                ai_suggested_category="transport",
                is_public=True
            )
        ]
        db.add_all(reports)
        db.commit()

    # 5. Seed 1 sample resolved incident in history
    if db.query(EmergencyIncident).filter(EmergencyIncident.user_id == demo_user.id).count() == 0:
        past_inc = EmergencyIncident(
            incident_reference="SOS-20261028-A4F1",
            user_id=demo_user.id,
            status="resolved",
            severity="high",
            latitude=28.5450,
            longitude=77.2730,
            location_accuracy=12.5,
            location_source="gps",
            location_timestamp=utc_now() - timedelta(days=4),
            address_text="Near Okhla Bird Sanctuary Metro Station",
            triggered_channel="web_button",
            resolution_notes="Reached home safely by cab. Contacted sister.",
            created_at=utc_now() - timedelta(days=4),
            resolved_at=utc_now() - timedelta(days=4, minutes=-25)
        )
        db.add(past_inc)
        db.commit()
        db.refresh(past_inc)

        # Seed notification delivery logs for that incident
        contacts = db.query(TrustedContact).filter(TrustedContact.user_id == demo_user.id).all()
        for c in contacts:
            db.add(EmergencyNotification(
                incident_id=past_inc.id,
                trusted_contact_id=c.id,
                channel="sms",
                status="delivered",
                provider_name="demo_mock_sms",
                provider_message_id=f"DEMO-SMS-{c.id}",
                attempted_at=past_inc.created_at,
                sent_at=past_inc.created_at,
                delivered_at=past_inc.created_at + timedelta(seconds=2)
            ))
        db.commit()

    # 6. Seed In-app notifications
    if db.query(InAppNotification).filter(InAppNotification.user_id == demo_user.id).count() == 0:
        db.add_all([
            InAppNotification(
                user_id=demo_user.id,
                title="Welcome to SURAKSHA AI",
                message="Your safety network is set up. Keep your trusted contacts updated.",
                type="system",
                link="/contacts"
            ),
            InAppNotification(
                user_id=demo_user.id,
                title="Safety Report Approved",
                message="Your report regarding 'Outer Ring Road underpass' has been reviewed and verified by moderators.",
                type="report",
                link="/community-reports"
            )
        ])
        db.commit()

    return {
        "status": "success",
        "message": "Demo data successfully seeded!",
        "accounts": {
            "demo_user": {"email": "demo@suraksha.ai", "password": "DemoSafe#2026"},
            "admin_user": {"email": "admin@suraksha.ai", "password": "AdminSafe#2026"}
        }
    }
