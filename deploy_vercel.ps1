# SURAKSHA AI - One-Click Vercel Deployment (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " SURAKSHA AI - Public Vercel Deployment" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

$env:PATH = "C:\Users\Muskan Rai\AppData\Local\Programs\nodejs;" + $env:PATH

Write-Host "`n[1/3] Verifying environment & building production bundle..." -ForegroundColor Yellow
npm run build

Write-Host "`n[2/3] Verifying Python backend entrypoint..." -ForegroundColor Yellow
python -c "import api.index; print('   FastAPI serverless entrypoint OK!')"

Write-Host "`n[3/3] Deploying to Vercel (Production)..." -ForegroundColor Green
Write-Host "If you are not logged in, Vercel will open your browser to log in." -ForegroundColor DarkGray
Write-Host "Accept all defaults by pressing Enter when prompted.`n" -ForegroundColor DarkGray

npx --yes vercel --prod

Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host " Deployment finished! Test your live *.vercel.app link." -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
