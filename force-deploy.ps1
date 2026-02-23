# Force Netlify Deployment
# This script creates an empty commit to trigger Netlify rebuild

Write-Host "`n=== FORCE NETLIFY DEPLOY ===" -ForegroundColor Cyan

Write-Host "`nStep 1: Creating empty commit to trigger Netlify..." -ForegroundColor Yellow
git commit --allow-empty -m "chore: Force Netlify rebuild - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Host "`nStep 2: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
Write-Host "`nNetlify should now detect the new commit and start building." -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Open: https://app.netlify.com" -ForegroundColor White
Write-Host "  2. Select your UniLink site" -ForegroundColor White
Write-Host "  3. Go to 'Deploys' tab" -ForegroundColor White
Write-Host "  4. Watch for new build to start (should be within 1 minute)" -ForegroundColor White
Write-Host "`nLatest commit: 8aec240 - $(git log -1 --pretty=%B)" -ForegroundColor Gray
Write-Host "`n=========================`n" -ForegroundColor Cyan
