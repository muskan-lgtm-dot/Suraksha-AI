# SURAKSHA AI - Push to GitHub
$ErrorActionPreference = "Stop"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " SURAKSHA AI - Pushing to GitHub" -ForegroundColor Cyan
Write-Host " Target: https://github.com/muskan-lgtm-dot/Suraksha-AI" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

Set-Location -Path "C:\Users\Muskan Rai\.gemini\antigravity\scratch\suraksha-ai"
git remote -v
Write-Host "`nPushing main branch to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host " Code pushed successfully to GitHub!" -ForegroundColor Green
Write-Host " View your repository at: https://github.com/muskan-lgtm-dot/Suraksha-AI" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
