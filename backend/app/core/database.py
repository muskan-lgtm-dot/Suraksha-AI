import os
import sys
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# ── normalise URL ─────────────────────────────────────────────────────────────
db_url = settings.DATABASE_URL

# Heroku / Railway / Supabase use postgres:// — SQLAlchemy needs postgresql://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# On Windows the /tmp path in the SQLite URL doesn't exist;
# redirect it to the real temp directory so local testing works.
if db_url.startswith("sqlite:////tmp/"):
    filename = db_url[len("sqlite:////tmp/"):]
    if sys.platform == "win32" and not os.path.isdir("/tmp"):
        tmp = tempfile.gettempdir()
        db_url = f"sqlite:///{os.path.join(tmp, filename)}"
        # Ensure the directory exists
        os.makedirs(os.path.dirname(os.path.join(tmp, filename)), exist_ok=True)

# For relative SQLite paths ensure the parent dir exists
if db_url.startswith("sqlite:///") and not db_url.startswith("sqlite:////"):
    rel = db_url[len("sqlite:///"):]
    if rel:
        parent = os.path.dirname(rel)
        if parent:
            os.makedirs(parent, exist_ok=True)

# ── engine ────────────────────────────────────────────────────────────────────
connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
