@echo off
setlocal
echo =====================================================================
echo  SURAKSHA AI - Push Code to GitHub Repository
echo  Target: https://github.com/muskan-lgtm-dot/Suraksha-AI.git
echo =====================================================================
echo.

cd /d "C:\Users\Muskan Rai\.gemini\antigravity\scratch\suraksha-ai"

echo [1/2] Verifying Remote URL...
git remote -v

echo.
echo [2/2] Pushing to GitHub (main branch)...
echo If a browser window opens, click "Sign in with your browser" to authorize.
echo.
git push -u origin main

echo.
echo =====================================================================
echo Push complete! Check: https://github.com/muskan-lgtm-dot/Suraksha-AI
echo =====================================================================
pause
