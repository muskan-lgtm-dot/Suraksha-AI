import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")
    
    PROJECT_NAME: str = "SURAKSHA AI - Women Safety & Emergency Response Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    APP_ENV: str = "development"
    SECRET_KEY: str = Field(default="dev-insecure-secret-key-change-in-production-suraksha-ai-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = Field(
        default="sqlite:////tmp/suraksha_ai.db" if os.environ.get("VERCEL") else "sqlite:///./suraksha_ai.db"
    )
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "*",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # Safety & Providers
    DEMO_MODE: bool = True
    NATIONAL_EMERGENCY_NUMBER: str = "112"
    
    # SMS & Email Providers (Integrations)
    SMS_PROVIDER: str = "mock"  # "mock", "twilio"
    SMS_API_KEY: Optional[str] = None
    SMS_API_SECRET: Optional[str] = None
    SMS_FROM_NUMBER: Optional[str] = None
    
    EMAIL_PROVIDER: str = "mock"  # "mock", "smtp", "sendgrid"
    EMAIL_API_KEY: Optional[str] = None
    EMAIL_FROM_ADDRESS: Optional[str] = "alerts@suraksha-ai.org"
    
    # AI Engine
    AI_PROVIDER: str = "rule_based"  # "rule_based", "gemini", "openai"
    AI_API_KEY: Optional[str] = None
    AI_MODEL: Optional[str] = "gemini-1.5-flash"
    
    # Geocoding & Routing
    MAP_TILE_URL: str = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    GEOCODING_PROVIDER: str = "osm_nominatim"  # "osm_nominatim", "google", "mapbox"
    GEOCODING_API_KEY: Optional[str] = None
    ROUTING_PROVIDER: str = "osrm"  # "osrm", "google", "mapbox"
    ROUTING_API_KEY: Optional[str] = None

settings = Settings()
