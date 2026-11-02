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

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/health",
        "demo_mode": settings.DEMO_MODE
    }
