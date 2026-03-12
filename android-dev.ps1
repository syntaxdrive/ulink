# UniLink Android Live Reload — Development Mode
# Phone must be on the SAME Wi-Fi as this machine.
# Changes to src/ hot-reload on the phone within ~1 second.

$ErrorActionPreference = "Stop"

$env:ANDROID_HOME     = "C:\Android"
$env:ANDROID_SDK_ROOT = "C:\Android"
$env:Path             = "C:\Android\platform-tools;C:\Android\cmdline-tools\latest\bin;$env:Path"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UniLink Android — Dev Live Reload" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "  - Phone connected via USB (or Wi-Fi ADB)"
Write-Host "  - Phone & PC on the same Wi-Fi network"
Write-Host "  - USB debugging enabled on phone"
Write-Host ""

# Detect local IP automatically
$localIp = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169' } |
    Select-Object -First 1).IPAddress

if (-not $localIp) {
    $localIp = Read-Host "Could not auto-detect local IP. Enter it manually (e.g. 192.168.1.5)"
}

Write-Host "Detected local IP: $localIp" -ForegroundColor Green
Write-Host ""

# Sync capacitor with LiveUpdate disabled and server URL set to dev machine
$env:CAP_DEV = "true"
Write-Host "Syncing Capacitor (dev mode, LiveUpdate disabled)..."
npx cap sync android

# Run app on device with Vite live-reload
# --livereload   : Capacitor auto-starts Vite and hot-patches the WebView
# --external     : Binds Vite to 0.0.0.0 so phone can reach it over Wi-Fi
# --host $localIp: Explicitly tell Capacitor which IP to embed in the native config
Write-Host ""
Write-Host "Launching app with live reload at http://${localIp}:5173 ..." -ForegroundColor Cyan
Write-Host "(Any src/ change will hot-reload on the phone)" -ForegroundColor Green
Write-Host ""

npx cap run android --livereload --external --host $localIp

# Restore normal sync after dev session ends
Write-Host ""
Write-Host "Dev session ended. Restoring production Capacitor config..." -ForegroundColor Yellow
$env:CAP_DEV = ""
npx cap sync android
Write-Host "Done." -ForegroundColor Green
