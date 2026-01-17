# 🚀 Capawesome Cloud Deployment Guide

## Overview

This guide shows you how to deploy UniLink to Capawesome Cloud with **Live Updates** enabled. This means you can update your web version and the changes will automatically appear in the mobile app without requiring users to download a new version from the Play Store!

## 🎯 What You'll Achieve

- ✅ Deploy your app to Capawesome Cloud
- ✅ Enable live updates (OTA - Over The Air updates)
- ✅ Update web version → Automatically updates mobile app
- ✅ No need to rebuild/redeploy APK for content changes
- ✅ Users get updates instantly when they open the app

## 📋 Prerequisites

- [x] Capawesome CLI installed (`@capawesome/cli` in package.json)
- [ ] Capawesome account (sign up at https://cloud.capawesome.io)
- [ ] App built and ready (`npm run build`)
- [ ] Android platform added to Capacitor

## 🔧 Step-by-Step Deployment

### Step 1: Login to Capawesome

```bash
npx capawesome login
```

This will open a browser window for authentication. Follow the prompts to log in.

### Step 2: Initialize Capawesome in Your Project

```bash
npx capawesome apps:create
```

This will:
- Create a new app in Capawesome Cloud
- Generate a configuration file
- Link your local project to the cloud app

**Follow the prompts:**
- App name: `UniLink Nigeria`
- App ID: `com.syntaxdrive.ulink` (should match your capacitor.config.ts)

### Step 3: Build Your Web App

```bash
npm run build
```

This creates the production build in the `dist` folder.

### Step 4: Create Your First Bundle

A "bundle" is a version of your web app that will be served to mobile users.

```bash
npx capawesome bundles:create --path dist
```

This uploads your built web app to Capawesome Cloud.

**Note the Bundle ID** that's returned - you'll need it for the next step.

### Step 5: Create a Channel

Channels control which bundle users receive. Common channels:
- `production` - For live users
- `staging` - For testing
- `development` - For development

```bash
npx capawesome bundles:channels:create production
```

### Step 6: Assign Bundle to Channel

```bash
npx capawesome bundles:channels:assign production --bundle-id <BUNDLE_ID>
```

Replace `<BUNDLE_ID>` with the ID from Step 4.

### Step 7: Update Capacitor Configuration

We need to add the Capawesome Live Update plugin to your app.

First, install the plugin:

```bash
npm install @capawesome/capacitor-live-update
```

Then sync with Capacitor:

```bash
npx cap sync
```

### Step 8: Build Android APK

Now build your Android app with live updates enabled:

```bash
npx cap build android
```

Or use Capawesome's build service:

```bash
npx capawesome apps:builds:create android
```

### Step 9: Download and Test APK

If you used Capawesome's build service:

```bash
npx capawesome apps:builds:download <BUILD_ID>
```

Install the APK on your device and test!

## 🔄 How to Update Your App (The Magic Part!)

Once deployed, here's how you update your app without rebuilding:

### 1. Make Changes to Your Code

Edit your React components, fix bugs, add features, etc.

### 2. Build the Web App

```bash
npm run build
```

### 3. Create a New Bundle

```bash
npx capawesome bundles:create --path dist
```

### 4. Assign to Production Channel

```bash
npx capawesome bundles:channels:assign production --bundle-id <NEW_BUNDLE_ID>
```

### 5. That's It! 🎉

Users will get the update the next time they open the app. No APK rebuild needed!

## ⚡ Quick Update Script

Create a script in `package.json` to make updates easier:

```json
{
  "scripts": {
    "deploy:web": "npm run build && npx capawesome bundles:create --path dist",
    "deploy:production": "npm run deploy:web && npx capawesome bundles:channels:assign production --bundle-id $(npx capawesome bundles:list --limit 1 --json | jq -r '.[0].id')"
  }
}
```

Then you can just run:

```bash
npm run deploy:production
```

## 🎛️ Advanced Configuration

### Configure Live Updates in capacitor.config.ts

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.syntaxdrive.ulink',
  appName: 'UniLink Nigeria',
  webDir: 'dist',
  plugins: {
    LiveUpdate: {
      enabled: true,
      autoUpdateMethod: 'on-app-start',
      resetOnUpdate: false,
      location: 'https://api.capawesome.io',
    },
  },
};

export default config;
```

### Update Methods

- `on-app-start` - Check for updates when app starts (recommended)
- `on-app-resume` - Check when app comes to foreground
- `manual` - You control when to check

### Multiple Channels Strategy

```bash
# Development channel for testing
npx capawesome bundles:channels:create development
npx capawesome bundles:channels:assign development --bundle-id <DEV_BUNDLE_ID>

# Staging channel for beta testers
npx capawesome bundles:channels:create staging
npx capawesome bundles:channels:assign staging --bundle-id <STAGING_BUNDLE_ID>

# Production channel for live users
npx capawesome bundles:channels:create production
npx capawesome bundles:channels:assign production --bundle-id <PROD_BUNDLE_ID>
```

## 📱 What Gets Updated via Live Updates?

### ✅ Can Be Updated (No APK rebuild needed):
- React components
- CSS/styling changes
- JavaScript logic
- Images and assets
- API endpoints
- Bug fixes
- UI improvements
- New features (if no native code needed)

### ❌ Requires APK Rebuild:
- Native plugin changes
- Permissions changes (AndroidManifest.xml)
- Capacitor plugin additions/removals
- App icon or splash screen
- App name or ID
- Native code modifications

## 🔐 Environment Variables

For production, you'll want to use environment variables:

Create `.env.production`:

```env
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-key
```

Build with production env:

```bash
npm run build
```

Vite automatically uses `.env.production` for production builds.

## 📊 Monitoring Updates

### Check Bundle Status

```bash
npx capawesome bundles:list
```

### Check Channel Configuration

```bash
npx capawesome bundles:channels:list
```

### View Update Statistics

```bash
npx capawesome apps:stats
```

This shows:
- How many users have each bundle
- Update success rate
- Download statistics

## 🐛 Troubleshooting

### Issue: "Bundle upload failed"

**Solution:**
```bash
# Make sure you're logged in
npx capawesome login

# Check your build exists
ls dist

# Try uploading again
npx capawesome bundles:create --path dist
```

### Issue: "Users not getting updates"

**Checklist:**
- [ ] Bundle created successfully
- [ ] Bundle assigned to correct channel
- [ ] App has Live Update plugin installed
- [ ] Users have restarted the app
- [ ] Check app is using correct channel

### Issue: "App crashes after update"

**Solution:**
```bash
# Rollback to previous bundle
npx capawesome bundles:channels:assign production --bundle-id <PREVIOUS_BUNDLE_ID>
```

### Issue: "Build errors"

**Solution:**
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
npx cap sync
```

## 🎯 Best Practices

### 1. Test Before Deploying

Always test bundles in a staging channel first:

```bash
# Create staging bundle
npx capawesome bundles:create --path dist

# Assign to staging
npx capawesome bundles:channels:assign staging --bundle-id <BUNDLE_ID>

# Test on device
# If good, promote to production
npx capawesome bundles:channels:assign production --bundle-id <BUNDLE_ID>
```

### 2. Version Your Bundles

Add version info to your bundle metadata:

```bash
npx capawesome bundles:create --path dist --metadata '{"version":"1.0.1","description":"Fixed community creation bug"}'
```

### 3. Gradual Rollouts

Use multiple channels for gradual rollouts:
- 10% of users → `beta` channel
- 50% of users → `staging` channel  
- 100% of users → `production` channel

### 4. Keep Rollback Ready

Always keep the last working bundle ID handy for quick rollbacks.

### 5. Monitor After Deployment

Check stats after deploying to ensure updates are being received:

```bash
npx capawesome apps:stats
```

## 📝 Deployment Checklist

Before deploying to production:

- [ ] All features tested locally
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No console errors in production build
- [ ] Environment variables set correctly
- [ ] Bundle created successfully
- [ ] Tested on staging channel
- [ ] Rollback plan ready
- [ ] Team notified of deployment

## 🚀 Quick Reference Commands

```bash
# Login
npx capawesome login

# Create app
npx capawesome apps:create

# Build web app
npm run build

# Create bundle
npx capawesome bundles:create --path dist

# Create channel
npx capawesome bundles:channels:create production

# Assign bundle to channel
npx capawesome bundles:channels:assign production --bundle-id <BUNDLE_ID>

# List bundles
npx capawesome bundles:list

# List channels
npx capawesome bundles:channels:list

# View stats
npx capawesome apps:stats

# Build APK
npx capawesome apps:builds:create android

# Download APK
npx capawesome apps:builds:download <BUILD_ID>
```

## 🎓 Understanding the Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Workflow                      │
└─────────────────────────────────────────────────────────────┘

1. Make changes to code
   ↓
2. npm run build
   ↓
3. npx capawesome bundles:create --path dist
   ↓
4. npx capawesome bundles:channels:assign production --bundle-id <ID>
   ↓
5. Users open app → Automatic update! 🎉

┌─────────────────────────────────────────────────────────────┐
│                    First-Time Setup                          │
└─────────────────────────────────────────────────────────────┘

1. npx capawesome login
   ↓
2. npx capawesome apps:create
   ↓
3. npm install @capawesome/capacitor-live-update
   ↓
4. npx cap sync
   ↓
5. npm run build
   ↓
6. npx capawesome bundles:create --path dist
   ↓
7. npx capawesome bundles:channels:create production
   ↓
8. npx capawesome bundles:channels:assign production --bundle-id <ID>
   ↓
9. npx capawesome apps:builds:create android
   ↓
10. Distribute APK to users
```

## 🌟 Benefits of This Approach

1. **Instant Updates**: Users get updates without downloading from Play Store
2. **No Review Delays**: Bypass app store review for content updates
3. **Quick Bug Fixes**: Fix critical bugs and deploy in minutes
4. **A/B Testing**: Easy to test different versions with different channels
5. **Rollback**: Instant rollback if something goes wrong
6. **Analytics**: Track update adoption and success rates

## 📞 Support

- **Capawesome Docs**: https://capawesome.io/docs
- **Capawesome Discord**: https://discord.gg/capawesome
- **GitHub Issues**: https://github.com/capawesome-team

## 🎉 You're Ready!

Follow the steps above and you'll have a fully deployed app with live updates enabled. Your users will always have the latest version without needing to download updates from the Play Store!

---

**Next Steps:**
1. Run through the deployment steps
2. Test on a device
3. Make a small change and deploy an update
4. Watch the magic happen! ✨
