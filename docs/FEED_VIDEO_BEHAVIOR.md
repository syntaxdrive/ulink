# Feed Video Behavior Update

## Changes Made

### Sound On by Default ✅
- Feed videos now start with **audio enabled** by default
- Set `defaultMuted={false}` on VideoEmbed component in PostItem.tsx
- Videos will attempt to unmute after autoplay starts (browser permitting)

### Auto-Pause on Scroll ✅
- **Already implemented** in VideoEmbed component
- Uses Intersection Observer to detect when video scrolls out of view
- Pauses automatically when `intersectionRatio < 0.5` (less than 50% visible)
- Resumes when scrolled back into view

## How It Works

### Feed Videos:
1. User scrolls to a post with embedded video
2. Video autoplays (muted initially for browser compliance)
3. Video automatically unmutes after playback starts
4. User scrolls away → Video pauses
5. User scrolls back → Video resumes playing

### Learn Page Videos:
- Same behavior (sound on by default)
- Already configured with `defaultMuted={false}`

## Browser Autoplay Policies

Modern browsers have strict autoplay policies:
- **Muted autoplay**: Always allowed ✅
- **Unmuted autoplay**: Requires user interaction

Our implementation:
1. Start muted (autoplay allowed)
2. Unmute after playback begins (works after user has interacted with page)
3. This ensures videos play reliably while still having sound

## InfinityFree Deployment

### Will the update system work?
**Yes!** ✅

When you drag and drop the `dist` folder to InfinityFree:
1. Service worker is included in the build
2. Update detection works automatically
3. Users see update notifications when you upload new versions

### Deployment Steps:
1. Run `npm run build`
2. Upload `dist` folder contents to InfinityFree
3. Users automatically notified of updates within 60 seconds
4. They click "Update Now" → instant refresh

### Important Notes:
- Make sure to upload ALL files from `dist` folder
- Don't forget `manifest.json` and service worker files
- HTTPS is required for service workers (InfinityFree provides this)

## Testing

### Test Feed Videos:
1. Create a post with a YouTube link
2. Scroll to the post → Video should autoplay and unmute
3. Scroll away → Video should pause
4. Scroll back → Video should resume

### Test Update System:
1. Make a small change and rebuild
2. Upload to InfinityFree
3. Open app in browser
4. Wait ~60 seconds → Update notification appears
5. Click "Update Now" → Page refreshes with new version
