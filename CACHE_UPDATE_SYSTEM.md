# Cache Management & Update System

## Overview
We've implemented a comprehensive system to help users see new updates and clear their cache when needed.

## Features Implemented

### 1. **Automatic Update Notification** ✨
- **Location**: Appears as a floating notification at the bottom of the screen
- **How it works**:
  - Checks for updates every 60 seconds
  - When a new version is deployed, users see a green notification
  - Users can click "Update Now" to instantly refresh to the latest version
  - Or dismiss it and update later

### 2. **Manual Cache Clear Button** 🔄
- **Location**: Settings page → "Clear Cache & Refresh" section
- **What it does**:
  - Deletes all cached files
  - Unregisters service workers
  - Forces a complete reload
  - Ensures users get the absolute latest version

### 3. **Service Worker Auto-Update**
- **registerType**: `'autoUpdate'` in Vite config
- Automatically downloads new versions in the background
- Prompts users when ready to apply

## How Users Clear Cache

### Method 1: Update Notification (Recommended)
1. User sees green "Update Available!" notification
2. Clicks "Update Now"
3. App refreshes automatically with new version

### Method 2: Manual Clear (Settings)
1. Go to Settings page
2. Scroll to "Clear Cache & Refresh" section (orange card)
3. Click "Clear Cache & Reload"
4. App clears everything and reloads

### Method 3: Browser Manual Clear
Users can also use browser methods:
- **Chrome/Edge**: Ctrl+Shift+Delete → Clear cached images and files
- **Safari**: Cmd+Option+E
- **Mobile**: Settings → Clear browsing data

## Technical Implementation

### Files Modified/Created:
1. **`src/hooks/useAppUpdate.ts`** - Hook for detecting and applying updates
2. **`src/components/UpdateNotification.tsx`** - UI for update prompt
3. **`src/service-worker.js`** - Added SKIP_WAITING message handler
4. **`src/features/settings/SettingsPage.tsx`** - Added Clear Cache button
5. **`src/App.tsx`** - Added UpdateNotification component

### How It Works:

```
1. New version deployed
   ↓
2. Service worker detects update
   ↓
3. useAppUpdate hook sets updateAvailable = true
   ↓
4. UpdateNotification component appears
   ↓
5. User clicks "Update Now"
   ↓
6. Service worker receives SKIP_WAITING message
   ↓
7. New service worker activates
   ↓
8. Page reloads with new version
```

## Best Practices for Deployment

### When deploying updates:
1. **Build the app**: `npm run build`
2. **Deploy to hosting** (Vercel, Netlify, etc.)
3. **Users will see update notification** within 60 seconds
4. **They click "Update Now"** → instant refresh

### For major updates:
- Consider adding a version number in Settings
- Update the version in `package.json`
- Communicate major changes to users

## Cache Strategy

### What gets cached:
- JavaScript bundles
- CSS files
- Images and icons
- HTML pages
- Fonts

### What doesn't get cached:
- API responses (Supabase data)
- User-uploaded content
- Dynamic content

## Troubleshooting

### If users don't see updates:
1. Ask them to check Settings → Clear Cache & Reload
2. Or hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
3. Or clear browser cache manually

### If update notification doesn't appear:
- Service worker might be disabled
- Check browser console for errors
- Ensure HTTPS (service workers require secure context)

## Future Enhancements

Potential improvements:
- [ ] Version number display in Settings
- [ ] Changelog modal on update
- [ ] "What's New" section
- [ ] Force update for critical security patches
- [ ] Update schedule (e.g., only check during off-peak hours)
