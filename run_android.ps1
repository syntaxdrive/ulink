$env:ANDROID_HOME     = "C:\Android"
$env:ANDROID_SDK_ROOT = "C:\Android"
$env:Path             = "C:\Android\platform-tools;C:\Android\cmdline-tools\latest\bin;$env:Path"

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  UniLink Android Launcher" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1) Build + run (production bundle on device)"
Write-Host "2) Live reload (dev mode — changes hot-reload instantly)"
Write-Host ""
$choice = Read-Host "Choose [1/2]"

if ($choice -eq "2") {
    # Hand off to the dedicated dev script
    & "$PSScriptRoot\android-dev.ps1"
} else {
    Write-Host "Building web app..."
    npm run build

    Write-Host "Syncing Android project..."
    npx cap sync android

    Write-Host "Running on device..."
    npx cap run android
}
