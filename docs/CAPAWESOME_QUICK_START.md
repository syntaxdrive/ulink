# 🚀 Quick Start: Deploy to Capawesome

## TL;DR - Fastest Way to Deploy

### First Time Setup (One-time, ~10 minutes)

```bash
# 1. Login to Capawesome
npx capawesome login

# 2. Create your app in Capawesome Cloud
npx capawesome apps:create

# 3. Install Live Update plugin
npm install @capawesome/capacitor-live-update

# 4. Sync with Capacitor
npx cap sync

# 5. Build and create first bundle
npm run build
npx capawesome apps:bundles:create --path dist

# 6. Create production channel
npx capawesome apps:channels:create production

# 7. Assign bundle to production (replace BUNDLE_ID with the ID from step 5)
npx capawesome apps:channels:update production --bundle-id BUNDLE_ID

# 8. Build your Android APK
npx capawesome apps:builds:create android

# 9. Download the APK (replace BUILD_ID with the ID from step 8)
npx capawesome apps:builds:download BUILD_ID
```

### Updating Your App (After first setup, ~2 minutes)

```bash
# Option 1: Use the PowerShell script (Windows)
.\deploy-capawesome.ps1

# Option 2: Use npm scripts
npm run deploy:production

# Option 3: Manual steps
npm run build
npx capawesome apps:bundles:create --path dist
npx capawesome apps:channels:update production --bundle-id <NEW_BUNDLE_ID>
```

That's it! Users will get the update next time they open the app! 🎉

---

## 📋 Detailed First-Time Setup

### Step 1: Login to Capawesome

Open your terminal and run:

```bash
npx capawesome login
```

This will open your browser. Sign in with your Capawesome account (or create one if you don't have it).

**Expected output:**
```
✓ Successfully logged in
```

### Step 2: Create Your App

```bash
npx capawesome apps:create
```

**Follow the prompts:**
- App name: `UniLink Nigeria`
- App ID: `com.syntaxdrive.ulink`

**Expected output:**
```
✓ App created successfully
App ID: abc123...
```

### Step 3: Install Live Update Plugin

```bash
npm install @capawesome/capacitor-live-update
```

**Expected output:**
```
added 1 package...
```

### Step 4: Sync with Capacitor

```bash
npx cap sync
```

This copies your web app to the native platforms and installs plugins.

**Expected output:**
```
✓ Copying web assets...
✓ Updating Android plugins...
✓ Sync finished
```

### Step 5: Build Your Web App

```bash
npm run build
```

**Expected output:**
```
✓ built in 5.23s
```

### Step 6: Create Your First Bundle

```bash
npx capawesome apps:bundles:create --path dist
```

This uploads your built web app to Capawesome Cloud.

**Expected output:**
```
✓ Bundle created successfully
Bundle ID: bundle_abc123xyz
```

**⚠️ IMPORTANT:** Copy this Bundle ID - you'll need it in the next step!

### Step 7: Create Production Channel

```bash
npx capawesome apps:channels:create production
```

**Expected output:**
```
✓ Channel created successfully
```

### Step 8: Assign Bundle to Channel

Replace `BUNDLE_ID` with the ID from Step 6:

```bash
npx capawesome apps:channels:update production --bundle-id BUNDLE_ID
```

**Expected output:**
```
✓ Bundle assigned to production channel
```

### Step 9: Build Android APK

```bash
npx capawesome apps:builds:create android
```

This builds your APK in the cloud.

**Expected output:**
```
✓ Build started
Build ID: build_xyz789
Status: pending
```

**Note:** This can take 5-10 minutes. Check status with:
```bash
npx capawesome apps:builds:get BUILD_ID
```

### Step 10: Download Your APK

Once the build is complete:

```bash
npx capawesome apps:builds:download BUILD_ID
```

**Expected output:**
```
✓ Downloading APK...
✓ Saved to: ulink-release.apk
```

### Step 11: Install and Test

1. Transfer the APK to your Android device
2. Install it (you may need to enable "Install from unknown sources")
3. Open the app and test!

---

## 🔄 How to Update Your App

Once you've done the first-time setup, updating is super easy!

### Method 1: Use the PowerShell Script (Recommended for Windows)

```powershell
.\deploy-capawesome.ps1
```

This script will:
1. Build your web app
2. Create a new bundle
3. Ask which channel to deploy to
4. Assign the bundle to that channel
5. Show you deployment stats

### Method 2: Use npm Scripts

For quick deployments:

```bash
# Deploy to production
npm run deploy:production

# Deploy to staging
npm run deploy:staging

# Deploy to development
npm run deploy:dev
```

### Method 3: Manual Steps

If you prefer to do it manually:

```bash
# 1. Build
npm run build

# 2. Create bundle
npx capawesome apps:bundles:create --path dist

# 3. Copy the Bundle ID from the output, then assign it
npx capawesome apps:channels:update production --bundle-id <BUNDLE_ID>
```

---

## 🎯 What Happens When You Deploy?

```
You make changes → Build → Create bundle → Assign to channel
                                                    ↓
                                          Users open app
                                                    ↓
                                          App checks for updates
                                                    ↓
                                          Downloads new bundle
                                                    ↓
                                          App restarts with new version
                                                    ↓
                                          Users see your changes! 🎉
```

**Timeline:**
- You deploy: 2 minutes
- User opens app: Instant
- Download update: 5-10 seconds
- App restart: 1 second
- **Total time to user:** ~10-15 seconds after they open the app!

---

## 📊 Useful Commands

### Check Your Bundles

```bash
npx capawesome apps:bundles:list
```

Shows all your bundles with IDs and creation dates.

### Check Your Channels

```bash
npx capawesome apps:channels:list
```

Shows which bundle is assigned to each channel.

### View Stats

```bash
npx capawesome apps:stats
```

Shows:
- How many users have each bundle
- Update success rate
- Download statistics

### Check Build Status

```bash
npx capawesome apps:builds:list
```

Shows all your builds and their status.

---

## 🐛 Troubleshooting

### "Not logged in"

**Solution:**
```bash
npx capawesome login
```

### "Bundle creation failed"

**Solution:**
```bash
# Make sure you built first
npm run build

# Check dist folder exists
ls dist

# Try again
npx capawesome apps:bundles:create --path dist
```

### "Channel not found"

**Solution:**
```bash
# Create the channel first
npx capawesome apps:channels:create production
```

### "Build failed"

**Solution:**
```bash
# Check build logs
npx capawesome apps:builds:logs BUILD_ID

# Common fix: clean and rebuild
rm -rf dist node_modules
npm install
npm run build
npx cap sync
```

---

## 🎓 Understanding Channels

Think of channels like different "versions" of your app:

- **production** → Live users (everyone)
- **staging** → Beta testers (selected users)
- **development** → Just you (testing)

You can have different bundles on different channels:

```bash
# Create all channels
npx capawesome apps:channels:create production
npx capawesome apps:channels:create staging
npx capawesome apps:channels:create development

# Deploy different versions
npx capawesome apps:channels:update development --bundle-id bundle_new_feature
npx capawesome apps:channels:update staging --bundle-id bundle_testing
npx capawesome apps:channels:update production --bundle-id bundle_stable
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Tested locally (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] Tested on staging channel first
- [ ] Ready to rollback if needed (know previous bundle ID)

---

## 🚀 You're Ready!

**First time?** → Follow the "Detailed First-Time Setup" above

**Already set up?** → Just run `.\deploy-capawesome.ps1` or `npm run deploy:production`

**Need help?** → Check `CAPAWESOME_DEPLOYMENT_GUIDE.md` for detailed information

---

**Pro Tip:** Bookmark this file! You'll use it every time you want to deploy an update. 📌
