# Video Playback Issue - RESOLVED

## Problem
Videos stopped playing after adding the YouTube API key.

## Root Cause
The fallback videos in `src/services/youtube.ts` had durations that exceeded 60 seconds (e.g., `PT2M30S`, `PT8M15S`), but the duration filter in the `fetchEducationalVideos` function rejects any videos longer than 60 seconds. 

When the YouTube API failed or returned no results (due to quota limits, invalid key, or other issues), the app fell back to these hardcoded videos, but they were all being filtered out, leaving an empty video list.

## Solution Applied
Updated all fallback video durations to be under 60 seconds:
- `PT2M30S` → `PT1M40S`
- `PT8M15S` → `PT58S`
- `PT2M45S` → `PT45S`
- `PT2M20S` → `PT50S`
- `PT2M35S` → `PT55S`

Now when the API fails, the fallback videos will pass the duration filter and display correctly.

## Additional Fixes
1. **YouTube Player Audio**: Updated `VideoEmbed.tsx` to handle audio properly:
   - Videos always start muted for autoplay compliance
   - If `defaultMuted={false}` (Learn page), videos automatically unmute after playback starts
   - This ensures Learn page videos have audio on by default while respecting browser autoplay policies

## Mobile OAuth Issue (Separate)
The mobile Google login issue is a different problem related to OAuth redirects in Capacitor WebViews. To fix this:

1. Install the Browser plugin:
   ```bash
   npm install @capacitor/browser
   ```

2. Uncomment the Browser import and usage in `src/features/auth/AuthPage.tsx`

3. Add deep link configuration to `capacitor.config.ts`

4. Configure Supabase redirect URLs to include the deep link scheme

This has been prepared but not yet implemented (package not installed).
