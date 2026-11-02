from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
import app.models  # Ensures all model tables are registered in Base.metadata
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
    system
)
from app.api.endpoints.system import seed_demo_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial demo accounts on first run
    db = SessionLocal()
    try:
        seed_demo_data(db)
    except Exception as e:
        print(f"Demo seed warning: {e}")
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-Ready Women Safety & Emergency Response Platform API",
    lifespan=lifespan if settings.APP_ENV != "test" else None
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global consistent error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Avoid leaking internal stack traces in production
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again or contact support."}
    )

# Include routers
api_prefix = settings.API_V1_STR

app.include_router(auth.router, prefix=api_prefix)
app.include_router(profile.router, prefix=api_prefix)
app.include_router(contacts.router, prefix=api_prefix)
app.include_router(incidents.router, prefix=api_prefix)
app.include_router(location_shares.router, prefix=api_prefix)
app.include_router(location_shares.public_router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(checkins.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)
app.include_router(system.router)  # includes /health, /ready, /api/demo/seed

# ------------------------------------------------------------------------------
# Frontend SPA & Static Assets (Unified Single-Port Hosting)
# FastAPI serves the built React app from frontend/dist on the same port.
# All /api/* routes are handled by FastAPI; everything else serves the SPA.
# ------------------------------------------------------------------------------
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Resolve frontend/dist path relative to this file (backend/app/main.py)
_here = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.abspath(os.path.join(_here, "..", ".."))
FRONTEND_DIST = os.path.join(_project_root, "frontend", "dist")

@app.get("/api/info")
def platform_info():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/health",
        "demo_mode": settings.DEMO_MODE
    }

# Mount /assets subdir (hashed JS/CSS bundles) with StaticFiles for efficient serving
_assets_dir = os.path.join(FRONTEND_DIST, "assets")
if os.path.isdir(_assets_dir):
    app.mount("/assets", StaticFiles(directory=_assets_dir), name="frontend-assets")

# Root → serve React SPA index.html
@app.get("/", include_in_schema=False)
def serve_root():
    index = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.isfile(index):
        return FileResponse(index, media_type="text/html")
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/health",
        "demo_mode": settings.DEMO_MODE
    }

# SPA catch-all: serve index.html for any React Router path.
# API/system paths return 404 so they don't accidentally fall through.
_API_PREFIXES = ("api", "health", "ready", "docs", "openapi.json", "redoc", "assets")

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    # Let proper API routes return their own 404 instead of the SPA
    if any(full_path == p or full_path.startswith(f"{p}/") for p in _API_PREFIXES):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    # Serve exact static files (favicon.ico, robots.txt, vite.svg, etc.)
    candidate = os.path.join(FRONTEND_DIST, full_path)
    if full_path and os.path.isfile(candidate):
        return FileResponse(candidate)

    # Default: return index.html so React Router handles the path client-side
    index = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.isfile(index):
        return FileResponse(index, media_type="text/html")

    return JSONResponse(status_code=404, content={"detail": "Frontend not built. Run: npm run build"})
