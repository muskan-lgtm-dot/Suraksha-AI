import sys
import os

# Calculate paths
cur_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(cur_dir)
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Indicate serverless Vercel environment
os.environ["VERCEL"] = "1"

from app.main import app
from app.core.database import engine, Base, SessionLocal
from app.api.endpoints.system import seed_demo_data

# Ensure database tables and demo seed exist on serverless cold starts
try:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_demo_data(db)
    db.close()
except Exception as e:
    print(f"Serverless DB init warning: {e}")
