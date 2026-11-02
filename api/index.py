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
