Write-Host "🚀 Building WebView Shell APK" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Building Web Bundle..." -ForegroundColor Yellow
npm run build

Write-Host "2. Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android

Write-Host "3. Generating APK using Gradle..." -ForegroundColor Yellow
Set-Location android
.\gradlew assembleDebug
Set-Location ..

Write-Host ""
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "✅ Done!" -ForegroundColor Green
Write-Host "Your live-updating APK has been generated at:" -ForegroundColor White
Write-Host "android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Green
Write-Host "Send this file to your users. They will never need to install an APK again for Web updates!" -ForegroundColor Yellow
