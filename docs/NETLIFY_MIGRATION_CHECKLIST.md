# ✅ Netlify Migration Checklist

Use this checklist to ensure a smooth migration from InfinityFree to Netlify.

## Pre-Deployment Checklist

### 1. Repository Preparation
- [ ] All code is committed to Git
- [ ] `.gitignore` includes `.env` files (but allows `.env.example`)
- [ ] Remove old InfinityFree-specific files (`.htaccess` if not needed)
- [ ] Ensure `netlify.toml` is in the root directory
- [ ] Ensure `_redirects` and `_headers` are in `public/` directory

### 2. Environment Variables
- [ ] Create `.env.example` with all required variables
- [ ] Document all `VITE_*` environment variables needed
- [ ] Have Supabase URL and anon key ready
- [ ] Test locally with actual environment variables

### 3. Build Configuration
- [ ] Verify `package.json` has correct build script: `"build": "tsc -b && vite build"`
- [ ] Test build locally: `npm run build`
- [ ] Verify `dist/` folder is created successfully
- [ ] Check `dist/` contains `index.html`, `assets/`, and static files
- [ ] Verify `_redirects` and `_headers` are copied to `dist/`

### 4. Authentication Services
- [ ] List all OAuth providers (Google, GitHub, etc.)
- [ ] Have admin access to Google Cloud Console (if using Google Auth)
- [ ] Have admin access to Supabase dashboard
- [ ] Know which redirect URLs need updating

## Netlify Setup Checklist

### 5. Create Netlify Site
- [ ] Sign up/login to [Netlify](https://app.netlify.com/)
- [ ] Connect Git repository
- [ ] Configure build settings (command: `npm run build`, publish: `dist`)
- [ ] Add all environment variables
- [ ] Trigger first deployment

### 6. Deployment Verification
- [ ] Build completes successfully (check build logs)
- [ ] Site loads at Netlify URL (`https://[site-name].netlify.app`)
- [ ] No console errors in browser DevTools
- [ ] All pages accessible (test routing)
- [ ] Assets load correctly (images, fonts, icons)

### 7. Update OAuth Redirect URLs

#### Supabase
- [ ] Go to Supabase Dashboard → Authentication → URL Configuration
- [ ] Update **Site URL** to Netlify URL
- [ ] Add Netlify URL to **Redirect URLs**: `https://[site-name].netlify.app/**`
- [ ] Keep localhost URLs for local development
- [ ] Save changes

#### Google Cloud Console (if using Google Auth)
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] APIs & Services → Credentials
- [ ] Edit OAuth 2.0 Client ID
- [ ] Add to **Authorized JavaScript origins**: `https://[site-name].netlify.app`
- [ ] Add to **Authorized redirect URIs**: `https://[site-name].netlify.app/**`
- [ ] Save changes

### 8. Functionality Testing
- [ ] Test user sign-up/sign-in
- [ ] Test Google OAuth (if enabled)
- [ ] Test protected routes (dashboard, profile, etc.)
- [ ] Test database reads (feed, posts, etc.)
- [ ] Test database writes (create post, update profile, etc.)
- [ ] Test file uploads (if applicable)
- [ ] Test real-time features (if applicable)
- [ ] Test on mobile device/responsive design

### 9. PWA Verification
- [ ] Service worker registers successfully (check DevTools → Application)
- [ ] `manifest.json` loads correctly
- [ ] App can be installed (check for install prompt)
- [ ] Offline functionality works (if implemented)
- [ ] Push notifications work (if implemented)
- [ ] Icons display correctly on home screen

### 10. Performance & SEO
- [ ] Run Lighthouse audit (DevTools → Lighthouse)
- [ ] Performance score > 90
- [ ] PWA score > 90
- [ ] Accessibility score > 90
- [ ] SEO score > 90
- [ ] All meta tags present in `index.html`
- [ ] Open Graph tags working (test with [OpenGraph.xyz](https://www.opengraph.xyz/))

## Post-Deployment Checklist

### 11. Custom Domain (Optional)
- [ ] Purchase/have access to domain (e.g., `unilink.ng`)
- [ ] Add custom domain in Netlify
- [ ] Configure DNS settings (follow Netlify instructions)
- [ ] Wait for DNS propagation (can take up to 48 hours)
- [ ] Verify SSL certificate is active
- [ ] Test site at custom domain

### 12. Update External References
- [ ] Update links in Google Search Console
- [ ] Update links in Supabase email templates
- [ ] Update social media profile links
- [ ] Update any marketing materials
- [ ] Inform users of new URL (if changed)

### 13. Monitor & Optimize
- [ ] Set up Netlify Analytics (optional, $9/month)
- [ ] Configure build notifications (email or Slack)
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor bandwidth usage in Netlify dashboard
- [ ] Check build times and optimize if needed
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

### 14. Decommission InfinityFree
- [ ] Verify Netlify site is fully functional for 1-2 weeks
- [ ] Backup any data from InfinityFree (if any)
- [ ] Set up redirect from old domain to new site (if applicable)
- [ ] Cancel InfinityFree hosting (when confident)
- [ ] Remove old deployment files/credentials

## Emergency Rollback Plan

If something goes wrong:

### Quick Fixes
- [ ] Check Netlify build logs for errors
- [ ] Verify environment variables are set correctly
- [ ] Check Supabase service status
- [ ] Clear browser cache and test again
- [ ] Test in incognito mode
- [ ] Check browser console for JavaScript errors

### Rollback Options
- [ ] Netlify keeps all previous deployments
- [ ] Go to **Deploys** tab in Netlify dashboard
- [ ] Click on a previous successful deployment
- [ ] Click **"Publish deploy"** to rollback instantly
- [ ] Fix issues and redeploy when ready

## Success Metrics

Your migration is successful when:

- ✅ Site loads in < 2 seconds
- ✅ All features work as expected
- ✅ No authentication errors
- ✅ No console errors
- ✅ PWA installs correctly
- ✅ Can handle 1000+ daily users without issues
- ✅ Build times are reasonable (< 5 minutes)
- ✅ Bandwidth usage is within limits

## Helpful Commands

```bash
# Test build locally
npm run build

# Preview production build locally
npm run preview

# Deploy using Netlify CLI
netlify deploy --prod

# Check build status
netlify status

# View environment variables
netlify env:list

# Add environment variable via CLI
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
```

## Resources

- 📖 [Full Deployment Guide](./NETLIFY_DEPLOYMENT.md)
- 🌐 [Netlify Documentation](https://docs.netlify.com/)
- 🔧 [Netlify Support](https://www.netlify.com/support/)
- 💬 [Netlify Community Forums](https://answers.netlify.com/)

---

**Note:** Print this checklist or keep it open while migrating. Check off items as you complete them to ensure nothing is missed!
