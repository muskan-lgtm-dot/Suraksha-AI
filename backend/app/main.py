"""
SURAKSHA AI — Unified FastAPI Application
==========================================
Single process, single port. Works identically:
  • Locally   → python start_dev.py (port 5173)
  • Render    → uvicorn app.main:app (port from $PORT env var)
  • Railway   → uvicorn app.main:app (port from $PORT env var)

API routes live under /api/*
Static frontend (React build) is served for everything else.
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
import app.models  # registers all ORM models with Base.metadata
from app.core.database import engine, Base, SessionLocal
from app.api.endpoints import (
    auth, profile, contacts, incidents,
    location_shares, reports, admin,
    checkins, notifications, ai, system,
)
from app.api.endpoints.system import seed_demo_data

# ── Static-file resolution ────────────────────────────────────────────────────
# FRONTEND_DIST env var lets deployment platforms override the default path.
# Default: two directories up from this file (backend/app/main.py) → project_root/frontend/dist
_HERE = os.path.dirname(os.path.abspath(__file__))
_DIST = os.environ.get(
    "FRONTEND_DIST",
    os.path.abspath(os.path.join(_HERE, "..", "..", "frontend", "dist")),
)
_INDEX = os.path.join(_DIST, "index.html")

# ── Startup / Shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(application: FastAPI):
    # Create all DB tables (idempotent)
    Base.metadata.create_all(bind=engine)
    print(f"[SURAKSHA] Database: {settings.DATABASE_URL[:40]}...")

    # Seed demo accounts (idempotent — skips if already present)
    db = SessionLocal()
    try:
        seed_demo_data(db)
        db.commit()
        print("[SURAKSHA] Demo seed: OK")
    except Exception as e:
        db.rollback()
        print(f"[SURAKSHA] Demo seed warning (non-fatal): {e}")
    finally:
        db.close()

    # Log frontend status
    if os.path.isfile(_INDEX):
        print(f"[SURAKSHA] Frontend: serving from {_DIST}")
    else:
        print(f"[SURAKSHA] Frontend: dist not found at {_DIST} — run build first")

    yield
    print("[SURAKSHA] Shutdown complete.")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-Ready Women Safety & Emergency Response Platform API",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan if settings.APP_ENV != "test" else None,
)

# CORS — same-origin in production (frontend and API share the same domain/port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler — hide internal stack traces from clients
@app.exception_handler(Exception)
async def _global_error(request: Request, exc: Exception):
    print(f"[SURAKSHA] Unhandled error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )

# ── API Routers ───────────────────────────────────────────────────────────────

_PREFIX = settings.API_V1_STR  # "/api"

app.include_router(auth.router,                   prefix=_PREFIX)
app.include_router(profile.router,                prefix=_PREFIX)
app.include_router(contacts.router,               prefix=_PREFIX)
app.include_router(incidents.router,              prefix=_PREFIX)
app.include_router(location_shares.router,        prefix=_PREFIX)
app.include_router(location_shares.public_router, prefix=_PREFIX)
app.include_router(reports.router,                prefix=_PREFIX)
app.include_router(admin.router,                  prefix=_PREFIX)
app.include_router(checkins.router,               prefix=_PREFIX)
app.include_router(notifications.router,          prefix=_PREFIX)
app.include_router(ai.router,                     prefix=_PREFIX)
app.include_router(system.router)   # mounts /health  /ready  /api/demo/seed

@app.get("/api/info", tags=["System"])
def platform_info():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "demo_mode": settings.DEMO_MODE,
    }

# ── Frontend Static File Serving ──────────────────────────────────────────────
# Paths that must NEVER fall through to the SPA handler
_SKIP = frozenset(("api", "health", "ready", "docs", "openapi.json", "redoc", "assets"))

# Mount /assets (Vite hashed bundles) with StaticFiles for proper cache headers
_assets_dir = os.path.join(_DIST, "assets")
if os.path.isdir(_assets_dir):
    app.mount("/assets", StaticFiles(directory=_assets_dir), name="vite-assets")


@app.get("/", include_in_schema=False)
def serve_root():
    """Serve the React SPA index.html at root."""
    if os.path.isfile(_INDEX):
        return FileResponse(_INDEX, media_type="text/html")
    # No build yet — return API info so the server is still useful
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "API running. Frontend not built yet — run the build command.",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    """
    SPA catch-all:
    - Real API/system prefixes → 404 (their routers handle them above)
    - Known static files (favicon, robots.txt, etc.) → serve directly
    - Everything else → index.html (React Router handles client-side)
    """
    top = full_path.split("/")[0]
    if top in _SKIP:
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    # Exact static file match (e.g. favicon.ico, vite.svg)
    candidate = os.path.join(_DIST, full_path)
    if full_path and os.path.isfile(candidate):
        return FileResponse(candidate)

    # All React Router paths (dashboard, emergency, contacts, etc.)
    if os.path.isfile(_INDEX):
        return FileResponse(_INDEX, media_type="text/html")

    return JSONResponse(
        status_code=503,
        content={
            "detail": "Frontend not built.",
            "fix": "Run: cd frontend && npm install && npm run build",
        },
    )
