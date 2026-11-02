@echo off
setlocal
echo =====================================================================
echo  SURAKSHA AI - One-Click Vercel Deployment
echo =====================================================================
echo.

set PATH=C:\Users\Muskan Rai\AppData\Local\Programs\nodejs;%PATH%

echo [1/3] Verifying Node.js and npm...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js was not found in PATH.
    pause
    exit /b 1
)

echo [2/3] Building production bundle locally to verify zero build errors...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Build failed. Please check errors above.
    pause
    exit /b 1
)

echo.
echo [3/3] Deploying to Vercel...
echo If you are not logged in yet, your browser will open to authenticate.
echo You can accept default prompts (hit Enter) for all questions.
echo.
npx --yes vercel --prod

echo.
echo =====================================================================
echo  Deployment complete! Check your live *.vercel.app link above.
echo =====================================================================
pause
