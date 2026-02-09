# 🎯 CORRECT Capawesome Deployment Commands

## ⚠️ IMPORTANT: The Correct Way to Deploy

After creating a bundle, you need to **deploy** it to a channel, not "update" or "assign".

### ✅ CORRECT Commands

```bash
# Step 1: Create a bundle
npx capawesome apps:bundles:create --path dist

# Step 2: Deploy the bundle to production channel
npx capawesome apps:deployments:create --build-id <BUNDLE_ID> --destination production
```

### Full First-Time Setup (CORRECTED)

```bash
# 1. Login
npx capawesome login

# 2. Create app
npx capawesome apps:create

# 3. Install Live Update plugin
npm install @capawesome/capacitor-live-update

# 4. Sync with Capacitor
npx cap sync

# 5. Build your web app
npm run build

# 6. Create a bundle
npx capawesome apps:bundles:create --path dist
# Copy the Bundle ID from output (e.g., ab66f220-3218-4d67-acf5-55763da4e406)

# 7. Create production channel (if it doesn't exist)
npx capawesome apps:channels:create production

# 8. Deploy bundle to production
npx capawesome apps:deployments:create --build-id ab66f220-3218-4d67-acf5-55763da4e406 --destination production

# 9. Build Android APK
npx capawesome apps:builds:create android

# 10. Download APK
npx capawesome apps:builds:download <BUILD_ID>
```

### Quick Update Deployment

```bash
# 1. Build
npm run build

# 2. Create bundle
npx capawesome apps:bundles:create --path dist
# Copy the Bundle ID!

# 3. Deploy to production
npx capawesome apps:deployments:create --build-id <BUNDLE_ID> --destination production
```

## 📝 For Your Current Situation

You have bundle ID: `ab66f220-3218-4d67-acf5-55763da4e406`

Run this command:

```bash
npx capawesome apps:deployments:create --build-id ab66f220-3218-4d67-acf5-55763da4e406 --destination production
```

## 🔍 Useful Commands

```bash
# List all bundles
npx capawesome apps:bundles:list

# List all channels
npx capawesome apps:channels:list

# List deployments
npx capawesome apps:deployments:list

# Check deployment status
npx capawesome apps:deployments:get <DEPLOYMENT_ID>

# View deployment logs
npx capawesome apps:deployments:logs <DEPLOYMENT_ID>
```

## 💡 Understanding the Flow

```
Create Bundle → Deploy to Channel → Users Get Update
     ↓                 ↓                    ↓
bundles:create   deployments:create   Auto-download
```

**Key Point:** You don't "assign" or "update" channels with bundles. You **deploy** bundles to channels (destinations).

---

**Updated:** 2026-01-17  
**Capawesome CLI:** v3.11.0  
**Status:** Verified Working ✅
