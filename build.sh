#!/usr/bin/env bash
# Exit immediately on error
set -o errexit

echo "==> [1/2] Installing Node.js & building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> [2/2] Installing Python backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Build complete! Single-port unified app is ready to run."
