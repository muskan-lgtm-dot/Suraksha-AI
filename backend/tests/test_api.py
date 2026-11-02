import os
os.environ["APP_ENV"] = "test"
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import app.models
from app.core.config import settings
settings.APP_ENV = "test"
from app.main import app
from app.core.database import Base, get_db

# In-memory test database with StaticPool so all connections share the same memory DB
TEST_DATABASE_URL = "sqlite://"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["version"] == settings.VERSION

def test_user_registration_and_login():
    # Register
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Riya Sharma",
        "email": "riya@example.com",
        "password": "StrongPassword123#",
        "phone": "+919876543210"
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "riya@example.com"
    token = reg_data["access_token"]

    # Duplicate registration fails
    dup_res = client.post("/api/auth/register", json={
        "full_name": "Riya Duplicate",
        "email": "riya@example.com",
        "password": "AnotherPassword123#"
    })
    assert dup_res.status_code == 400

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "riya@example.com",
        "password": "StrongPassword123#"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Wrong password fails
    bad_login = client.post("/api/auth/login", json={
        "email": "riya@example.com",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

def test_protected_routes_unauthorized():
    res = client.get("/api/profile")
    assert res.status_code == 401

def test_trusted_contacts_crud_and_limits():
    # Register user
    reg = client.post("/api/auth/register", json={
        "full_name": "Contact Tester",
        "email": "contact@example.com",
        "password": "Password123#"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add contact
    c_res = client.post("/api/contacts", headers=headers, json={
        "name": "Maya Parent",
        "relationship": "Mother",
        "phone": "+919800011122",
        "email": "maya@example.com",
        "preferred_channel": "both"
    })
    assert c_res.status_code == 201
    contact = c_res.json()
    assert contact["name"] == "Maya Parent"
    contact_id = contact["id"]

    # List contacts
    list_res = client.get("/api/contacts", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # Update contact
    update_res = client.patch(f"/api/contacts/{contact_id}", headers=headers, json={
        "name": "Maya Senior Parent"
    })
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Maya Senior Parent"

    # Delete contact
    del_res = client.delete(f"/api/contacts/{contact_id}", headers=headers)
    assert del_res.status_code == 200
    assert len(client.get("/api/contacts", headers=headers).json()) == 0

def test_emergency_sos_workflow():
    # 1. Register user & add trusted contact
    reg = client.post("/api/auth/register", json={
        "full_name": "Emergency User",
        "email": "emergency@example.com",
        "password": "EmergencyPassword123#"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/contacts", headers=headers, json={
        "name": "Guardian",
        "relationship": "Sister",
        "phone": "+919812345678",
        "email": "guardian@example.com",
        "preferred_channel": "both"
    })

    # 2. Trigger SOS
    sos_res = client.post("/api/incidents", headers=headers, json={
        "severity": "critical",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "location_accuracy": 15.0,
        "location_source": "gps",
        "address_text": "Connaught Place, New Delhi"
    })
    assert sos_res.status_code == 201
    incident = sos_res.json()
    assert incident["status"] == "notification_sent"
    assert incident["incident_reference"].startswith("SOS-")
    assert len(incident["notifications"]) >= 1
    incident_id = incident["id"]

    # 3. Acknowledge alert
    ack_res = client.post(f"/api/incidents/{incident_id}/acknowledge")
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "acknowledged"

    # 4. Resolve alert
    res_res = client.post(f"/api/incidents/{incident_id}/resolve", headers=headers, json={
        "resolution_notes": "Reached police booth safely."
    })
    assert res_res.status_code == 200
    assert res_res.json()["status"] == "resolved"
    assert res_res.json()["resolution_notes"] == "Reached police booth safely."

def test_emergency_cancellation_workflow():
    reg = client.post("/api/auth/register", json={
        "full_name": "Cancel Tester",
        "email": "cancel@example.com",
        "password": "Password123#"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    sos = client.post("/api/incidents", headers=headers, json={"severity": "medium"})
    incident_id = sos.json()["id"]

    cancel_res = client.post(f"/api/incidents/{incident_id}/cancel", headers=headers, json={
        "reason": "Accidental button tap while phone in pocket"
    })
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"
    assert cancel_res.json()["cancellation_reason"] == "Accidental button tap while phone in pocket"

def test_location_sharing_and_public_access():
    reg = client.post("/api/auth/register", json={
        "full_name": "Tracker User",
        "email": "tracker@example.com",
        "password": "Password123#"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create share
    share_res = client.post("/api/location-shares", headers=headers, json={
        "duration_minutes": 30,
        "label": "Commute to South Campus",
        "latitude": 28.59,
        "longitude": 77.22,
        "accuracy": 8.0
    })
    assert share_res.status_code == 201
    share_data = share_res.json()
    raw_token = share_data["raw_token"]
    share_id = share_data["id"]

    # Public endpoint access using raw token
    pub_res = client.get(f"/api/public/location-shares/{raw_token}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert pub_data["sharer_first_name"] == "Tracker"
    assert pub_data["is_active"] == True
    assert "email" not in pub_data  # No sensitive info leaked

    # Revoke share
    client.post(f"/api/location-shares/{share_id}/revoke", headers=headers)

    # Public endpoint now returns 410 Gone
    revoked_pub = client.get(f"/api/public/location-shares/{raw_token}")
    assert revoked_pub.status_code == 410

def test_safety_report_ai_classification_and_moderation():
    reg = client.post("/api/auth/register", json={
        "full_name": "Reporter",
        "email": "reporter@example.com",
        "password": "Password123#"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit lighting hazard report
    rep = client.post("/api/reports", headers=headers, json={
        "category": "lighting",
        "title": "Dark alley with broken street light",
        "description": "The lamp post is completely out and visibility is zero at night.",
        "latitude": 28.70,
        "longitude": 77.10
    })
    assert rep.status_code == 201
    rep_data = rep.json()
    assert rep_data["ai_suggested_category"] == "lighting"
    assert rep_data["moderation_status"] == "pending_review"

def test_ai_safety_assistant():
    chat_res = client.post("/api/ai/chat", json={
        "message": "What is the emergency helpline number for police in India?"
    })
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "112" in data["reply"]
    assert len(data["suggestions"]) > 0

    # Emergency distress detection
    danger_res = client.post("/api/ai/chat", json={
        "message": "Help me someone is following me!"
    })
    assert danger_res.status_code == 200
    danger_data = danger_res.json()
    assert danger_data["is_emergency_flagged"] == True
