# 🚀 Netlify Deployment Guide for UniLink

This guide walks you through deploying UniLink to Netlify.

## Prerequisites

- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Netlify account (free tier is fine to start)
- ✅ Supabase project credentials

## 📦 Step 1: Prepare Your Repository

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin main
   ```

2. **Ensure `.gitignore` excludes:**
   - `node_modules/`
   - `dist/`
   - `.env` and `.env.*` (except `.env.example`)

## 🌐 Step 2: Create Netlify Site

### Option A: Deploy via Netlify UI (Recommended for first time)

1. **Go to [Netlify](https://app.netlify.com/)**
2. Click **"Add new site"** → **"Import an existing project"**
3. **Connect to Git:**
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Netlify to access your repositories
   - Select the `ulink` repository

4. **Configure build settings:**
   - **Base directory:** (leave empty)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - Click **"Show advanced"** to add environment variables

5. **Add environment variables:**
   Click **"Add environment variable"** and add:
   
   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `your-anon-key-here` |

   > **Where to find these:**
   > - Go to your Supabase Dashboard
   > - Project Settings → API
   > - Copy the URL and anon/public key

6. **Deploy:**
   - Click **"Deploy site"**
   - Wait for the build to complete (~2-3 minutes)

### Option B: Deploy via Netlify CLI (Advanced)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize Netlify site:**
   ```bash
   netlify init
   ```
   
4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

## 🔧 Step 3: Configure Your Site

### Set Custom Domain (Optional)

1. In Netlify dashboard, go to **"Domain settings"**
2. Click **"Add custom domain"**
3. Enter `unilink.ng` (or your domain)
4. Follow DNS configuration instructions
5. Netlify will automatically provision SSL certificate

### Environment Variables Management

To update environment variables after deployment:

1. Go to **Site settings** → **Environment variables**
2. Add/Edit variables as needed
3. **Important:** Redeploy after changing env vars:
   - Go to **Deploys** → Click **"Trigger deploy"** → **"Deploy site"**

## 🎯 Step 4: Update Your Application URLs

After deployment, update these if you had hardcoded URLs:

1. **Supabase Redirect URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Netlify URL to **"Site URL"**: `https://your-site-name.netlify.app`
   - Add to **"Redirect URLs"**: `https://your-site-name.netlify.app/**`

2. **Google OAuth (if used):**
   - Go to Google Cloud Console
   - APIs & Services → Credentials
   - Edit OAuth 2.0 Client ID
   - Add **Authorized JavaScript origins**: `https://your-site-name.netlify.app`
   - Add **Authorized redirect URIs**: `https://your-site-name.netlify.app/**`

## 🔍 Step 5: Test Your Deployment

Visit your site URL and test:

- ✅ Authentication (Google Sign-In)
- ✅ Database queries (feed, profile, etc.)
- ✅ PWA installation
- ✅ Service worker (check DevTools → Application)
- ✅ Routing (navigate between pages, refresh)

## 📊 Step 6: Monitor Performance

Netlify provides built-in analytics:

1. **Go to Analytics tab** in your site dashboard
2. Monitor:
   - Bandwidth usage (you have 100GB/month on free tier)
   - Page views
   - Unique visitors
   - Top pages

**Free tier limits:**
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ Automatic HTTPS
- ✅ Continuous deployment

## 🚨 Troubleshooting

### Build Fails

**Check the build logs:**
- Common issues: Missing env vars, outdated dependencies
- Solution: Ensure all `VITE_*` env vars are set in Netlify

### 404 on Routes

**SPA routing not working:**
- Verify `_redirects` file is in `public/` folder
- Check if `netlify.toml` has the SPA redirect rule
- File should be copied to `dist/` during build

### Google Sign-In Fails

**OAuth redirect error:**
- Ensure Netlify URL is added to Google Cloud Console
- Ensure Netlify URL is added to Supabase redirect URLs
- Check browser console for specific error messages

### Service Worker Not Updating

**PWA cache issues:**
- Clear cache: DevTools → Application → Clear storage
- Force update: Unregister service worker and reload
- Check if `service-worker.js` has correct cache headers

## 🔄 Continuous Deployment

**Every push to `main` branch will automatically:**
1. Trigger a new build on Netlify
2. Run `npm run build`
3. Deploy to production if build succeeds
4. Keep previous deployments for instant rollback

**Preview Deployments:**
- Every pull request gets its own preview URL
- Test changes before merging to main
- Perfect for showing features to team/investors

## 📈 Upgrading to Pro (When Needed)

**Consider upgrading when:**
- You exceed 100GB bandwidth/month (~250k page views)
- You need more than 3 team members
- You want advanced analytics
- You need password-protected sites

**Pro plan ($19/month):**
- 400GB bandwidth
- 1,000 build minutes
- Unlimited team members
- Advanced analytics
- Role-based access control

## 🎉 Next Steps

After successful deployment:

1. ✅ Set up [Netlify Analytics](https://www.netlify.com/products/analytics/) (optional, $9/month)
2. ✅ Configure [Netlify Forms](https://docs.netlify.com/forms/setup/) for contact forms
3. ✅ Add [Netlify Functions](https://docs.netlify.com/functions/overview/) for serverless API routes
4. ✅ Set up monitoring (e.g., Sentry for error tracking)
5. ✅ Configure [build notifications](https://docs.netlify.com/monitor-sites/notifications/) (Slack, email)

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [Supabase Auth with Netlify](https://supabase.com/docs/guides/auth)
- [PWA on Netlify Best Practices](https://www.netlify.com/blog/2019/06/12/pwa-on-netlify/)

---

**Need help?** Check the troubleshooting section or open an issue in the repository.
