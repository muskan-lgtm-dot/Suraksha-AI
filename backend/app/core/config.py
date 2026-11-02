import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


def _default_db_url() -> str:
    """Pick the right DB URL based on runtime environment."""
    if os.environ.get("VERCEL") or os.environ.get("DATABASE_URL"):
        # On Vercel: use /tmp (writable) unless a real DB is configured
        return os.environ.get("DATABASE_URL", "sqlite:////tmp/suraksha_ai.db")
    return "sqlite:///./suraksha_ai.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow",
    )

    PROJECT_NAME: str = "SURAKSHA AI - Women Safety & Emergency Response Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    APP_ENV: str = "development"

    SECRET_KEY: str = Field(
        default="dev-insecure-secret-key-change-in-production-suraksha-ai-2026"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database — evaluated lazily so VERCEL env var is already set when this runs
    DATABASE_URL: str = Field(default_factory=_default_db_url)

    # CORS — allow all origins so the deployed frontend can reach the API
    CORS_ORIGINS: List[str] = ["*"]

    # Safety & Providers
    DEMO_MODE: bool = True
    NATIONAL_EMERGENCY_NUMBER: str = "112"

    # SMS
    SMS_PROVIDER: str = "mock"           # "mock" | "twilio"
    SMS_API_KEY: Optional[str] = None
    SMS_API_SECRET: Optional[str] = None
    SMS_FROM_NUMBER: Optional[str] = None

    # Email
    EMAIL_PROVIDER: str = "mock"         # "mock" | "smtp" | "sendgrid"
    EMAIL_API_KEY: Optional[str] = None
    EMAIL_FROM_ADDRESS: Optional[str] = "alerts@suraksha-ai.org"

    # AI Engine
    AI_PROVIDER: str = "rule_based"      # "rule_based" | "gemini" | "openai"
    AI_API_KEY: Optional[str] = None
    AI_MODEL: Optional[str] = "gemini-1.5-flash"

    # Maps & Geocoding
    MAP_TILE_URL: str = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    GEOCODING_PROVIDER: str = "osm_nominatim"
    GEOCODING_API_KEY: Optional[str] = None
    ROUTING_PROVIDER: str = "osrm"
    ROUTING_API_KEY: Optional[str] = None


settings = Settings()
