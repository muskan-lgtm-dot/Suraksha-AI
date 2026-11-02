# 🛡️ SURAKSHA AI — Women Safety & Emergency Response Platform
> **Tagline:** *Your Safety. Your Power. Your Network.*  
> **Category:** Women Safety • Emergency Response • Artificial Intelligence • Social Impact Technology

[![Backend Tests](https://img.shields.io/badge/Pytest-9%2F9%20Passed-emerald.svg)](backend/tests/test_api.py)
[![Frontend Build](https://img.shields.io/badge/Vite%20Build-Passed-emerald.svg)](frontend/dist)
[![Python](https://img.shields.io/badge/Python-3.11%2B%20%2F%203.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-teal.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED.svg)](docker-compose.yml)

---

## 1. Project Overview

Women can encounter unsafe situations while commuting, travelling alone at night, or navigating unfamiliar locations. Conventional safety apps frequently rely solely on an isolated manual button with limited coordination, fragile location sharing, or no verification after activation.

**SURAKSHA AI** is a production-ready, full-stack safety and emergency coordination platform designed for college hackathons and extensible into a real-world social impact product.

### Core Ethical & Architectural Principles
- **Strict Honesty & Transparency:** The platform supplements, but never replaces, official national emergency services (**112** in India). It never claims to predict crime or automatically contact police without an authorized operator integration.
- **Privacy by Design:** Continuous location tracking is strictly prohibited. Live location sessions use cryptographically random tokens (SHA-256 token hashing) with automatic expiration and instant revocation.
- **Auditable State Transitions:** Incidents move through a deterministic state machine: `Draft` → `Notification Pending` → `Notification Sent` → `Acknowledged` → `Resolved` / `Cancelled`.

---

## 2. Key Capabilities

| Feature | Description |
| :--- | :--- |
| 🚨 **Emergency SOS Center** | One-tap GPS activation with a 5-second accidental cancel countdown, multi-channel dispatch, and contact delivery timeline. |
| 👥 **Trusted Contacts Network** | Complete CRUD for up to 10 guardians with consent verification, relationship tags, and SMS/Email channel routing. |
| 📍 **Cryptographic Live Tracking** | Time-limited (15m to 4h) tracking links with SHA-256 token hashing, live OpenStreetMap updates, and one-click revocation. |
| 🏥 **Nearby Assistance & Map** | Interactive Leaflet directory of verified Police Stations, 24/7 Trauma Hospitals, and dedicated Women Pink Booths. |
| 📢 **Community Hazard Reports** | Crowdsourced safety hazards with explainable AI categorization (Lighting, Harassment, Infrastructure, Transport) and admin review. |
| ⏱️ **Travel Safety Check-In** | Destination arrival countdown timer for late-night commutes with safe arrival confirmation. |
| 🤖 **AI Safety Assistant** | Rule-based & LLM advisory chatbot for safety walkthroughs, travel tips, and immediate distress hotline prioritisation. |
| 📞 **Simulated Incoming Escape Call** | Client-side incoming call simulation with realistic voice guidance to help discreetly exit uncomfortable situations. |
| 🎙️ **Voice-Activated SOS** | Browser Speech Recognition listening for "Help Help" or "Suraksha Alert" with microphone safety indicators. |
| 🛡️ **Admin Moderation Portal** | Protected dashboard for community report verification/rejection and real-time system delivery telemetry. |

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18, TypeScript, Vite 5
- **Styling & UI:** Tailwind CSS with custom navy & emergency color tokens, Lucide React icons
- **Mapping:** Leaflet & OpenStreetMap tile integration
- **Routing & State:** React Router 6, React Context API (`AuthContext`)

### Backend
- **Framework:** Python 3, FastAPI, Starlette
- **ORM & Database:** SQLAlchemy 2.0, Alembic, SQLite (development default) / PostgreSQL 16 (production)
- **Security & Cryptography:** PBKDF2-HMAC-SHA256 (NIST SP 800-63B compliant) password hashing, HMAC-SHA256 JWT, SHA-256 token hashing
- **Testing:** Pytest, pytest-asyncio, HTTPX

---

## 4. Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Clone & Navigate
```bash
cd "C:\Users\Muskan Rai\.gemini\antigravity\scratch\suraksha-ai"
```

### Step 2: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 4: Launch Unified Development Server
Run the provided automated launcher:
```bash
python start_dev.py
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 5. Hackathon Judge Demonstration Workflow

A deterministic, seeded demonstration mode is built in. No external paid credentials (Twilio, SendGrid, OpenAI) are required to evaluate the entire platform.

### Step-by-Step Demo Flow:
1. **Open the App:** Navigate to `http://localhost:5173`.
2. **1-Click Demo Login:** On the Landing Page or Login screen, click **"1-Click Hackathon Demo"** (or sign in with `demo@suraksha.ai` / `DemoSafe#2026`).
3. **Explore the Dashboard:**
   - Note the real-time browser GPS coordinates meter.
   - Review configured trusted contacts (Sister, Roommate, Father).
   - Test the **"Simulated Call"** button in the navbar to demonstrate the discrete escape tool.
4. **Trigger Emergency SOS:**
   - Tap the prominent coral **"TAP FOR SOS"** button.
   - Notice the **5-second accidental cancel countdown** mechanism.
   - Click "Skip Countdown & Dispatch Immediately".
5. **Inspect the Active Incident:**
   - Observe the newly generated reference code (`SOS-2026xxxx-xxxx`).
   - Review the **Notification Timeline**: simulated SMS/Email deliveries confirmed with message IDs.
   - Click **"Simulate Ack"** to simulate a contact acknowledging the alert.
   - Click **"Copy Tracking Link"** and open it in an incognito window to view the restricted public tracking screen.
6. **Resolve Alert:**
   - Click **"Resolve (I Am Safe)"**, provide a resolution note ("Arrived safely home"), and submit.
   - Verify the incident transitions to `resolved`.
7. **Nearby Assistance & Hazard Reports:**
   - Navigate to **"Nearby Help & Map"** to inspect verified Police Stations and 24/7 Hospitals on OpenStreetMap.
   - Go to **"Safety Reports"**, type a test description ("Streetlight is broken and pitch dark here"), and watch the **explainable AI auto-categorize** it as `lighting` in real-time.
8. **Admin Moderation:**
   - Sign in as Admin (`admin@suraksha.ai` / `AdminSafe#2026`) via the 1-click button.
   - Review pending community reports, verify/approve them, and inspect the system audit trail.

---

## 6. Running Automated Tests

All backend business logic, emergency workflows, authentication limits, and security constraints are verified with a test suite:

```bash
cd backend
python -m pytest tests/test_api.py -v
```

### Verified Test Cases:
- `test_health_endpoint` (System telemetry & health status)
- `test_user_registration_and_login` (Password hashing & duplicate rejection)
- `test_protected_routes_unauthorized` (Bearer token enforcement)
- `test_trusted_contacts_crud_and_limits` (Guardian management & 10-contact cap)
- `test_emergency_sos_workflow` (SOS trigger, dispatch, acknowledgement, resolution)
- `test_emergency_cancellation_workflow` (Accidental alert cancellation with audit)
- `test_location_sharing_and_public_access` (SHA-256 token hashing & revocation)
- `test_safety_report_ai_classification_and_moderation` (Explainable keyword categorization)
- `test_ai_safety_assistant` (Emergency keyword distress detection)

---

## 7. Containerized Deployment (Docker Compose)

Deploy the complete multi-container production stack (PostgreSQL, FastAPI Backend, and Nginx/Vite Frontend):

```bash
# Build and launch all services
docker-compose up --build -d

# Check service health
docker-compose ps
```

- **Production Frontend:** `http://localhost`
- **Backend API:** `http://localhost:8000`

---

## 8. Environment Variables & External Integrations

Refer to `.env.example` for all configurable parameters:

```env
# Application
PROJECT_NAME="SURAKSHA AI"
APP_ENV=development
SECRET_KEY=your-secure-random-secret-key-here
DATABASE_URL=sqlite:///./suraksha_ai.db

# Multi-Channel Providers (Optional)
SMS_PROVIDER=mock          # "mock" (default) or "twilio"
SMS_API_KEY=ACxxxxxx       # Twilio Account SID
SMS_API_SECRET=xxxxxx      # Twilio Auth Token
SMS_FROM_NUMBER=+123456789 # Twilio Phone Number

EMAIL_PROVIDER=mock        # "mock" (default) or "sendgrid"
EMAIL_API_KEY=SG.xxxxxx    # SendGrid API Key
EMAIL_FROM_ADDRESS=alerts@suraksha-ai.org

# AI Engine
AI_PROVIDER=rule_based     # "rule_based" (default) or "gemini"
AI_API_KEY=                # Optional Gemini API Key
```

---

## 9. License & Attribution

Developed for social impact and women empowerment. Built for academic, demonstration, and production extension purposes.
*(c) 2026 SURAKSHA AI Platform. All rights reserved.*
