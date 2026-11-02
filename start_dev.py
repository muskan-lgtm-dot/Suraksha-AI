#!/usr/bin/env python3
"""
SURAKSHA AI — Unified Single-Port Dev Server (port 5173)

Builds the React frontend (if needed) then starts FastAPI which serves
both the API and the compiled SPA from the same http://localhost:5173.

Usage:
  python start_dev.py          # start (builds frontend if dist/ missing)
  python start_dev.py --build  # force-rebuild frontend then start
"""
import os
import subprocess
import sys

import uvicorn


def _reconfigure_stdout():
    try:
        if sys.stdout.encoding.lower() != "utf-8":
            sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def _find_npm() -> str:
    node_path = os.path.expandvars(r"%LOCALAPPDATA%\Programs\nodejs")
    npm_cmd = os.path.join(node_path, "npm.cmd")
    return npm_cmd if os.path.isfile(npm_cmd) else "npm"


def build_frontend(root_dir: str):
    frontend_dir = os.path.join(root_dir, "frontend")
    index_html   = os.path.join(frontend_dir, "dist", "index.html")

    if os.path.isfile(index_html) and "--build" not in sys.argv:
        return  # already built, skip

    print("Building React frontend...")
    npm = _find_npm()
    env = os.environ.copy()
    node_path = os.path.expandvars(r"%LOCALAPPDATA%\Programs\nodejs")
    env["PATH"] = f"{node_path};{env.get('PATH', '')}"
    subprocess.run([npm, "run", "build"], cwd=frontend_dir, env=env, check=True)
    print("Frontend build complete.\n")


def main():
    _reconfigure_stdout()

    root_dir    = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")

    # Add backend to path so uvicorn can find app.main
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    build_frontend(root_dir)

    print("=" * 70)
    print(" SURAKSHA AI  —  Unified Platform  (single port 5173)")
    print("=" * 70)
    print("  App          http://localhost:5173")
    print("  API Docs     http://localhost:5173/docs")
    print("  Health       http://localhost:5173/health")
    print("  Demo login   demo@suraksha.ai  /  DemoSafe#2026")
    print("  Admin login  admin@suraksha.ai /  AdminSafe#2026")
    print("=" * 70)
    print("Press Ctrl+C to stop.\n")

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=5173,
        reload=True,
        reload_dirs=[backend_dir],
        app_dir=backend_dir,
    )


if __name__ == "__main__":
    main()
