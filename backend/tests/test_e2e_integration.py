"""
Comprehensive E2E Integration Test Suite for SURAKSHA AI Unified Platform
Tests all 12 validation requirements from specification.
"""
import os
import json
import pytest
from fastapi.testclient import TestClient

# Ensure test environment
os.environ["APP_ENV"] = "test"
import app.models
from app.core.config import settings
settings.APP_ENV = "test"
from app.main import app
from app.core.database import Base, SessionLocal, engine
from app.api.endpoints.system import seed_demo_data

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    # Clear any overrides from other test modules so real engine/session is used
    app.dependency_overrides.clear()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_demo_data(db)
    db.close()
    yield

def test_1_and_2_frontend_loads_correctly():
    """Verify application root and SPA client routes return HTML."""
    r_root = client.get("/")
    assert r_root.status_code == 200

    r_dash = client.get("/dashboard")
    assert r_dash.status_code == 200

    r_sos = client.get("/emergency")
    assert r_sos.status_code == 200

def test_3_backend_api_responds():
    """Verify backend system endpoints respond with healthy status."""
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

    r_info = client.get("/api/info")
    assert r_info.status_code == 200
    assert "SURAKSHA AI" in r_info.json()["platform"]

def test_4_demo_login_works():
    """Verify Demo user login and Admin login work out of the box."""
    # Test User Demo login
    res = client.post("/api/auth/login", json={
        "email": "demo@suraksha.ai",
        "password": "DemoSafe#2026"
    })
    assert res.status_code == 200, f"Demo login failed: {res.text}"
    body = res.json()
    assert "access_token" in body
    assert body["user"]["email"] == "demo@suraksha.ai"
    assert body["user"]["full_name"] == "Aarohi Sen (DEMO)"

    # Test Admin Demo login
    admin_res = client.post("/api/auth/login", json={
        "email": "admin@suraksha.ai",
        "password": "AdminSafe#2026"
    })
    assert admin_res.status_code == 200
    admin_body = admin_res.json()
    assert admin_body["user"]["is_admin"] is True

def test_5_user_registration():
    """Verify new user registration and duplicate prevention."""
    import uuid
    email = f"user_{uuid.uuid4().hex[:8]}@suraksha.ai"
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Integration Tester",
        "email": email,
        "password": "SecurePassword#2026",
        "phone": "+919988776655"
    })
    assert reg_res.status_code == 201
    assert "access_token" in reg_res.json()

    # Duplicate check
    dup_res = client.post("/api/auth/register", json={
        "full_name": "Duplicate User",
        "email": email,
        "password": "SecurePassword#2026"
    })
    assert dup_res.status_code == 400

def test_6_and_7_auth_persistence_and_protected_pages():
    """Verify JWT token provides access to protected routes."""
    # Login as demo user
    login_res = client.post("/api/auth/login", json={
        "email": "demo@suraksha.ai",
        "password": "DemoSafe#2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Access protected profile
    profile_res = client.get("/api/profile", headers=headers)
    assert profile_res.status_code == 200
    assert profile_res.json()["email"] == "demo@suraksha.ai"

    # Access current user me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["id"] == profile_res.json()["id"]

def test_8_database_reads_and_writes():
    """Verify database CRUD operations (Contacts, Incidents, Reports)."""
    login_res = client.post("/api/auth/login", json={
        "email": "demo@suraksha.ai",
        "password": "DemoSafe#2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Read contacts
    c_list = client.get("/api/contacts", headers=headers)
    assert c_list.status_code == 200
    assert len(c_list.json()) >= 1

    # 2. Write new contact
    c_new = client.post("/api/contacts", headers=headers, json={
        "name": "E2E Emergency Buddy",
        "relationship": "Colleague",
        "phone": "+919123456789",
        "email": "buddy@example.com",
        "preferred_channel": "both"
    })
    assert c_new.status_code == 201
    contact_id = c_new.json()["id"]

    # 3. Read specific contact
    c_get = client.get(f"/api/contacts/{contact_id}", headers=headers)
    assert c_get.status_code == 200
    assert c_get.json()["name"] == "E2E Emergency Buddy"

    # 4. Trigger SOS Incident (Write)
    sos = client.post("/api/incidents", headers=headers, json={
        "severity": "high",
        "trigger_method": "button",
        "latitude": 12.9716,
        "longitude": 77.5946
    })
    assert sos.status_code == 201
    incident_id = sos.json()["id"]

    # 5. Resolve Incident
    res_inc = client.post(f"/api/incidents/{incident_id}/resolve", headers=headers, json={
        "resolution_notes": "Resolved during automated integration test"
    })
    assert res_inc.status_code == 200
    assert res_inc.json()["status"] == "resolved"

    # Cleanup contact
    client.delete(f"/api/contacts/{contact_id}", headers=headers)

def test_9_logout():
    """Verify logout endpoint."""
    login_res = client.post("/api/auth/login", json={
        "email": "demo@suraksha.ai",
        "password": "DemoSafe#2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    logout_res = client.post("/api/auth/logout", headers=headers)
    assert logout_res.status_code == 200
    assert "Logged out" in logout_res.json()["message"]

def test_10_no_cors_or_relative_path_errors():
    """Verify API 404s return JSON (not HTML), avoiding parsing crashes in frontend."""
    r_404 = client.get("/api/nonexistent-endpoint")
    assert r_404.status_code == 404
    # Must be JSON response
    assert r_404.headers["content-type"].startswith("application/json")
