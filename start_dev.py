#!/usr/bin/env python3
"""
SURAKSHA AI — Unified Development Server Launcher
Starts both FastAPI Backend (port 8000) and Vite Frontend (port 5173).
"""

import subprocess
import sys
import os
import time

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("=" * 70)
    print("SURAKSHA AI - Women Safety & Emergency Response Platform")
    print("=" * 70)
    print("Initializing development servers...")
    print("• Backend API:      http://localhost:8000 (Swagger docs: http://localhost:8000/docs)")
    print("• Frontend Client:  http://localhost:5173")
    print("• Demo Accounts:    demo@suraksha.ai / DemoSafe#2026")
    print("• Admin Account:    admin@suraksha.ai / AdminSafe#2026")
    print("=" * 70)

    # 1. Start Backend
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = backend_dir
    backend_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir, env=backend_env)

    # 2. Start Frontend
    node_path = os.path.expandvars(r"%LOCALAPPDATA%\Programs\nodejs")
    frontend_env = os.environ.copy()
    frontend_env["PATH"] = f"{node_path};{frontend_env.get('PATH', '')}"
    npm_cmd = os.path.join(node_path, "npm.cmd") if os.path.exists(os.path.join(node_path, "npm.cmd")) else "npm"
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir, env=frontend_env)

    print("\n✅ Both servers are running. Press Ctrl+C to stop all servers.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Servers stopped cleanly.")

if __name__ == "__main__":
    main()
