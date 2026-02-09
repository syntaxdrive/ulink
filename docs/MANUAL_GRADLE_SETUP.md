# Manual Gradle Download Instructions

## The Issue
Gradle download keeps timing out due to network connectivity issues.

## Solution: Manual Download

### Step 1: Download Gradle
1. Open this link in your browser: https://services.gradle.org/distributions/gradle-8.14.3-all.zip
2. Download the file (about 150MB)
3. Wait for download to complete

### Step 2: Create Directory
Create this folder if it doesn't exist:
```
C:\Users\LENOVO\.gradle\wrapper\dists\gradle-8.14.3-all\
```

### Step 3: Extract Gradle
1. Find a random folder name in that directory (or create one like `abc123`)
2. Extract the downloaded ZIP file into that folder
3. Final structure should be:
```
C:\Users\LENOVO\.gradle\wrapper\dists\gradle-8.14.3-all\abc123\gradle-8.14.3\
```

### Step 4: Try Build Again
```bash
cd C:\Users\LENOVO\Desktop\ulink\android
.\gradlew.bat assembleDebug
```

## Alternative: Use Pre-installed Gradle (If you have it)

If you have Gradle installed globally:

```bash
# Check if Gradle is installed
gradle --version

# If installed, use it directly
gradle assembleDebug
```

## Alternative: Build via Capacitor (Simpler)

Instead of using Gradle directly, use Capacitor's build command:

```bash
# From project root
npx cap run android
```

This will:
1. Build the app
2. Try to launch it on a connected device/emulator
3. Create the APK in the process

## Last Resort: Use EAS Build (Free Tier)

Expo's EAS Build has a free tier that might work:

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login:
```bash
eas login
```

3. Configure for Capacitor:
```bash
eas build:configure
```

4. Build:
```bash
eas build --platform android --profile preview
```

This uses Expo's cloud build service which has a free tier.

---

**Recommended**: Try the manual Gradle download first. It's the most reliable solution.
