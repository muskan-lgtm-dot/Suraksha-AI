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
# ------------------------------------------------------------------------------
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Locate frontend/dist
current_file_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_file_dir, "..", ".."))
frontend_dist = os.path.join(project_root, "frontend", "dist")

@app.get("/api/info")
def platform_info():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/health",
        "demo_mode": settings.DEMO_MODE
    }

# Mount static assets if dist/assets exists
assets_dir = os.path.join(frontend_dist, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# Root endpoint: serve frontend SPA index.html if available, else API info
@app.get("/")
def root():
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/health",
        "demo_mode": settings.DEMO_MODE
    }

# SPA catch-all for client-side routing
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Exclude API and system routes from SPA fallback
    api_prefixes = ("api", "health", "ready", "docs", "openapi.json", "redoc")
    if any(full_path == prefix or full_path.startswith(f"{prefix}/") for prefix in api_prefixes):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    # Check for direct static file in dist (e.g. favicon.ico, vite.svg)
    file_path = os.path.join(frontend_dist, full_path)
    if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)

    # Return index.html for React Router to handle
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)

    return JSONResponse(status_code=404, content={"detail": "Frontend build not found"})
