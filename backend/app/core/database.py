import os
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Handle postgres:// vs postgresql:// compatibility (e.g. Supabase, Neon, Railway)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Ensure directory exists for SQLite
if db_url.startswith("sqlite:////"):
    filepath = db_url[len("sqlite:////"):]
    if os.name == "nt" and filepath.startswith("tmp/"):
        filepath = os.path.join(tempfile.gettempdir(), filepath[len("tmp/"):])
        db_url = f"sqlite:///{filepath.replace(os.sep, '/')}"
    parent_dir = os.path.dirname(filepath)
    if parent_dir:
        os.makedirs(parent_dir, exist_ok=True)

# For SQLite, check_same_thread=False is needed for multi-threaded requests in FastAPI
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
