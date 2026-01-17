$env:ANDROID_HOME="C:\Android"
$env:ANDROID_SDK_ROOT="C:\Android"
$env:Path="C:\Android\platform-tools;C:\Android\cmdline-tools\latest\bin;$env:Path"

Write-Host "Syncing Android Project..."
npx cap sync android

Write-Host "Running on device..."
npx cap run android
