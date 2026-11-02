"""
SURAKSHA AI — Vercel Serverless Entrypoint
This file is invoked by Vercel for all /api/* requests.
It bootstraps the FastAPI application, initialises the database,
and seeds demo accounts on every cold start.
"""
import sys
import os

# ── path setup ──────────────────────────────────────────────────────────────
_cur  = os.path.dirname(os.path.abspath(__file__))
_root = os.path.dirname(_cur)
_back = os.path.join(_root, "backend")

for _p in (_back, _root):
    if _p not in sys.path:
        sys.path.insert(0, _p)

# Tell config.py we are running on Vercel
os.environ.setdefault("VERCEL", "1")

# ── import app ───────────────────────────────────────────────────────────────
from app.main import app  # noqa: E402  (FastAPI instance)

# ── database bootstrap (runs once per cold start) ────────────────────────────
try:
    from app.core.database import engine, Base, SessionLocal
    from app.api.endpoints.system import seed_demo_data

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Seed demo accounts (idempotent — skips if already exist)
    _db = SessionLocal()
    try:
        seed_demo_data(_db)
        _db.commit()
    except Exception as _seed_err:
        print(f"[SURAKSHA] Seed warning (non-fatal): {_seed_err}")
        _db.rollback()
    finally:
        _db.close()

    print("[SURAKSHA] Database ready.")
except Exception as _init_err:
    print(f"[SURAKSHA] DB init warning (non-fatal): {_init_err}")
