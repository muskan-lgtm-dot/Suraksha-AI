"""
SURAKSHA AI — FastAPI Application
Single file that works in two modes:
  • Local dev  — FastAPI serves both the API and the built React SPA on one port (5173)
  • Vercel      — FastAPI serves only the API; Vercel CDN serves the static frontend
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
    auth,
    profile,
    contacts,
    incidents,
    location_shares,
    reports,
    admin,
    checkins,
    notifications,
    ai,
    system,
)
from app.api.endpoints.system import seed_demo_data

# ── startup / shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(application: FastAPI):
    # Initialise DB tables
    Base.metadata.create_all(bind=engine)

    # Seed demo accounts (idempotent)
    db = SessionLocal()
    try:
        seed_demo_data(db)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[SURAKSHA] Demo seed warning: {e}")
    finally:
        db.close()

    yield


# ── app factory ───────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-Ready Women Safety & Emergency Response Platform API",
    lifespan=lifespan if settings.APP_ENV != "test" else None,
)

# CORS — allow all origins (the frontend calls /api/* on the same domain in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler — no stack-trace leakage in production
@app.exception_handler(Exception)
async def _global_error(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )

# ── API routers ───────────────────────────────────────────────────────────────

_api = settings.API_V1_STR   # "/api"

app.include_router(auth.router,                   prefix=_api)
app.include_router(profile.router,                prefix=_api)
app.include_router(contacts.router,               prefix=_api)
app.include_router(incidents.router,              prefix=_api)
app.include_router(location_shares.router,        prefix=_api)
app.include_router(location_shares.public_router, prefix=_api)
app.include_router(reports.router,                prefix=_api)
app.include_router(admin.router,                  prefix=_api)
app.include_router(checkins.router,               prefix=_api)
app.include_router(notifications.router,          prefix=_api)
app.include_router(ai.router,                     prefix=_api)
app.include_router(system.router)   # /health  /ready  /api/demo/seed

# ── platform info endpoint ────────────────────────────────────────────────────

@app.get("/api/info", tags=["System"])
def platform_info():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/health",
        "demo_mode": settings.DEMO_MODE,
    }

# ── SPA static file serving (LOCAL DEV only) ─────────────────────────────────
# On Vercel the static frontend is served by the CDN, so this code is never
# reached in production — but it works perfectly locally on port 5173.

_here  = os.path.dirname(os.path.abspath(__file__))
_root  = os.path.abspath(os.path.join(_here, "..", ".."))
_DIST  = os.path.join(_root, "frontend", "dist")
_INDEX = os.path.join(_DIST, "index.html")

# Mount /assets (hashed JS/CSS bundles) if the build exists
_assets = os.path.join(_DIST, "assets")
if os.path.isdir(_assets):
    app.mount("/assets", StaticFiles(directory=_assets), name="frontend-assets")

_SPA_SKIP = ("api", "health", "ready", "docs", "openapi.json", "redoc", "assets")


@app.get("/", include_in_schema=False)
def serve_root():
    if os.path.isfile(_INDEX):
        return FileResponse(_INDEX, media_type="text/html")
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    # Don't intercept real API / system paths
    if any(full_path == p or full_path.startswith(f"{p}/") for p in _SPA_SKIP):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    # Direct static file (favicon, robots.txt, manifest, etc.)
    candidate = os.path.join(_DIST, full_path)
    if full_path and os.path.isfile(candidate):
        return FileResponse(candidate)

    # Any React Router path → return index.html
    if os.path.isfile(_INDEX):
        return FileResponse(_INDEX, media_type="text/html")

    return JSONResponse(
        status_code=503,
        content={"detail": "Frontend not built. Run: npm --workspace=frontend run build"},
    )
