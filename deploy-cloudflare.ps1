# Quick Deploy to Cloudflare Pages
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Deploy UniLink to Cloudflare Pages       ║" -ForegroundColor Cyan
Write-Host "║  100% FREE + UNLIMITED Bandwidth           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✓ Your code is on GitHub and ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Open Cloudflare Dashboard:" -ForegroundColor Cyan
Write-Host "   https://dash.cloudflare.com" -ForegroundColor White
Write-Host ""

Write-Host "2. Click:" -ForegroundColor Cyan
Write-Host "   Workers & Pages → Create → Pages → Connect to Git" -ForegroundColor White
Write-Host ""

Write-Host "3. Select repository:" -ForegroundColor Cyan
Write-Host "   syntaxdrive/ulink" -ForegroundColor White
Write-Host ""

Write-Host "4. Build settings:" -ForegroundColor Cyan
Write-Host "   Framework: Vite" -ForegroundColor White
Write-Host "   Build command: npm run build" -ForegroundColor White
Write-Host "   Output directory: dist" -ForegroundColor White
Write-Host ""

Write-Host "5. Environment variables (IMPORTANT!):" -ForegroundColor Cyan
Write-Host "   VITE_SUPABASE_URL = " -NoNewline -ForegroundColor White
Write-Host "your-supabase-url" -ForegroundColor Yellow
Write-Host "   VITE_SUPABASE_ANON_KEY = " -NoNewline -ForegroundColor White
Write-Host "your-anon-key" -ForegroundColor Yellow
Write-Host ""

Write-Host "Full guide: See DEPLOY_CLOUDFLARE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "Opening Cloudflare Dashboard..." -ForegroundColor Green
Start-Sleep -Seconds 2
Start-Process "https://dash.cloudflare.com"

Write-Host ""
Write-Host "After deployment, add custom domain: unilink.ng" -ForegroundColor Magenta
Write-Host ""
