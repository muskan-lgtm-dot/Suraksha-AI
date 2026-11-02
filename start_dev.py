#!/usr/bin/env python3
"""
SURAKSHA AI — Unified Single-Port Launcher (Port 5173)
Serves both the React Frontend and FastAPI Backend simultaneously on port 5173.
"""

import subprocess
import sys
import os
import uvicorn

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def ensure_frontend_built(root_dir: str):
    frontend_dist = os.path.join(root_dir, "frontend", "dist", "index.html")
    if not os.path.exists(frontend_dist) or "--build" in sys.argv:
        print("Building frontend production bundle...")
        node_path = os.path.expandvars(r"%LOCALAPPDATA%\Programs\nodejs")
        env = os.environ.copy()
        env["PATH"] = f"{node_path};{env.get('PATH', '')}"
        npm_cmd = os.path.join(node_path, "npm.cmd") if os.path.exists(os.path.join(node_path, "npm.cmd")) else "npm"
        subprocess.run([npm_cmd, "run", "build"], cwd=os.path.join(root_dir, "frontend"), env=env, check=True)
        print("Frontend built successfully.\n")

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")

    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    ensure_frontend_built(root_dir)

    print("=" * 72)
    print(" SURAKSHA AI — Single-Port Unified Platform (Port 5173)")
    print("=" * 72)
    print(" • Unified Application URL: http://localhost:5173")
    print(" • Frontend Web App:        http://localhost:5173/")
    print(" • Interactive API Docs:    http://localhost:5173/docs")
    print(" • System Health Check:     http://localhost:5173/health")
    print(" • Demo User Account:       demo@suraksha.ai  /  DemoSafe#2026")
    print(" • Demo Admin Account:      admin@suraksha.ai /  AdminSafe#2026")
    print("=" * 72)
    print("Serving full-stack application on port 5173. Press Ctrl+C to stop.\n")

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=5173,
        reload=True,
        app_dir=backend_dir
    )

if __name__ == "__main__":
    main()
