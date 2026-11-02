@echo off
setlocal
title SURAKSHA AI - GitHub Push + Vercel Deploy
set PATH=C:\Users\Muskan Rai\AppData\Local\Programs\nodejs;%PATH%
cd /d "C:\Users\Muskan Rai\.gemini\antigravity\scratch\suraksha-ai"

echo =================================================================
echo  SURAKSHA AI - Push to GitHub ^& Deploy to Vercel
echo =================================================================
echo.

echo [STEP 1/3] Pushing code to GitHub...
echo  A browser window will open asking you to sign in to GitHub.
echo  Just click "Authorize" and come back here.
echo.
git push -u origin main

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: GitHub push failed. Check the error above.
    pause
    exit /b 1
)

echo.
echo [STEP 2/3] GitHub push successful!
echo.
echo =================================================================
echo [STEP 3/3] Deploying to Vercel...
echo  A browser window will open asking you to sign in to Vercel.
echo  Sign in, then come back - deployment will start automatically.
echo =================================================================
echo.

npx --yes vercel --prod

echo.
echo =================================================================
echo  DONE! Your live Vercel URL is shown above.
echo  Visit: https://github.com/muskan-lgtm-dot/Suraksha-AI
echo =================================================================
echo.
pause
