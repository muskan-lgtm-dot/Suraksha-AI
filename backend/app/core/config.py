import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


def _default_db_url() -> str:
    """
    Determine the database URL at runtime.
    Priority:
      1. DATABASE_URL env var (production e.g. PostgreSQL)
      2. If Vercel environment: sqlite:////tmp/suraksha_ai.db (/tmp is writable)
      3. Local development fallback: sqlite:///./suraksha_ai.db
    """
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]
    if os.environ.get("VERCEL"):
        return "sqlite:////tmp/suraksha_ai.db"
    return "sqlite:///./suraksha_ai.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )

    PROJECT_NAME: str = "SURAKSHA AI - Women Safety & Emergency Response Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    APP_ENV: str = "development"   # development | production | test

    # A strong random secret key MUST be set in production via env var
    SECRET_KEY: str = Field(
        default="dev-insecure-key-change-this-in-production-suraksha-ai-2026"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = Field(default_factory=_default_db_url)

    # CORS — "*" allows any origin; fine because auth is token-based not cookie-based
    CORS_ORIGINS: List[str] = ["*"]

    # Safety
    DEMO_MODE: bool = True
    NATIONAL_EMERGENCY_NUMBER: str = "112"

    # SMS provider
    SMS_PROVIDER: str = "mock"       # "mock" | "twilio"
    SMS_API_KEY: Optional[str] = None
    SMS_API_SECRET: Optional[str] = None
    SMS_FROM_NUMBER: Optional[str] = None

    # Email provider
    EMAIL_PROVIDER: str = "mock"     # "mock" | "smtp" | "sendgrid"
    EMAIL_API_KEY: Optional[str] = None
    EMAIL_FROM_ADDRESS: Optional[str] = "alerts@suraksha-ai.org"

    # AI engine
    AI_PROVIDER: str = "rule_based"  # "rule_based" | "gemini" | "openai"
    AI_API_KEY: Optional[str] = None
    AI_MODEL: Optional[str] = "gemini-1.5-flash"

    # Maps
    MAP_TILE_URL: str = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    GEOCODING_PROVIDER: str = "osm_nominatim"
    GEOCODING_API_KEY: Optional[str] = None
    ROUTING_PROVIDER: str = "osrm"
    ROUTING_API_KEY: Optional[str] = None


settings = Settings()
