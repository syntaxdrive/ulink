# Deploy UniLink to Cloudflare Pages (100% FREE + UNLIMITED)

## Why Cloudflare Pages?
- ✅ **UNLIMITED bandwidth** (no limits!)
- ✅ **FREE custom domain**
- ✅ **Fastest global CDN**
- ✅ **Auto-deploy on git push**
- ✅ **FREE SSL/HTTPS**

## Quick Setup (5 minutes)

### Step 1: Push Your Code to GitHub
```powershell
git add .
git commit -m "chore: Prepare for Cloudflare Pages deployment"
git push origin main
```

### Step 2: Connect to Cloudflare Pages

1. **Go to:** https://dash.cloudflare.com
2. **Login/Sign up** (use GitHub for fastest setup)
3. Click **"Workers & Pages"** in left sidebar
4. Click **"Create application"** → **"Pages"** tab
5. Click **"Connect to Git"**
6. Authorize Cloudflare to access GitHub
7. Select repository: **syntaxdrive/ulink**
8. Click **"Begin setup"**

### Step 3: Configure Build Settings

**Project name:** `unilink` (or anything you want)

**Production branch:** `main`

**Build settings:**
- Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`

**Environment variables (Click "Add variable"):**
- `VITE_SUPABASE_URL` = `your-supabase-url`
- `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`

Click **"Save and Deploy"**

### Step 4: Wait for First Build (~2 minutes)
Your site will be live at: `ulink.pages.dev` (or similar)

### Step 5: Add Custom Domain (unilink.ng)

**In Cloudflare Dashboard:**
1. Go to your project → **"Custom domains"**
2. Click **"Set up a custom domain"**
3. Enter: `unilink.ng`
4. Click **"Continue"**

**Two scenarios:**

#### A) Domain already on Cloudflare:
- Cloudflare auto-configures DNS
- SSL active immediately ✅
- Done!

#### B) Domain on another registrar (Namecheap, GoDaddy, etc):

**Option 1: Transfer DNS to Cloudflare (Recommended)**
1. Cloudflare → **"Add site"** → Enter `unilink.ng`
2. Select **"Free"** plan
3. Cloudflare shows you nameservers like:
   - `ns1.cloudflare.com`
   - `ns2.cloudflare.com`
4. Go to your domain registrar (where you bought unilink.ng)
5. Update nameservers to Cloudflare's
6. Wait 10-30 minutes for DNS propagation
7. Cloudflare auto-configures everything ✅

**Option 2: Keep DNS at registrar (Add CNAME)**
1. Go to your domain registrar's DNS settings
2. Add these records:

| Type  | Name | Target                          |
|-------|------|---------------------------------|
| CNAME | @    | unilink.pages.dev              |
| CNAME | www  | unilink.pages.dev              |

**Note:** Some registrars don't allow CNAME on root (@). If blocked, use Option 1.

### Step 6: Add www subdomain (Optional but recommended)

In Cloudflare Pages:
1. Custom domains → **"Set up a custom domain"**
2. Enter: `www.unilink.ng`
3. Save

Both `unilink.ng` and `www.unilink.ng` will work!

## Get Your Supabase Credentials

From Supabase Dashboard:
1. https://supabase.com/dashboard
2. Select your project
3. **Settings** → **API**
4. Copy:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public** key (VITE_SUPABASE_ANON_KEY)

## Auto-Deploy Setup ✅

Already configured! Every time you push to GitHub:
```powershell
git push origin main
```

Cloudflare automatically:
1. Detects the push
2. Builds your app (npm run build)
3. Deploys to production
4. Updates unilink.ng

## Verify Deployment

After setup:
- Test: https://unilink.pages.dev
- Production: https://unilink.ng (after DNS)
- Check build logs in Cloudflare dashboard

## Troubleshooting

**Build fails?**
- Check environment variables are set
- View build logs in Cloudflare dashboard

**Domain not working?**
- Wait 10-30 minutes for DNS propagation
- Check DNS settings (use https://dnschecker.org)
- Verify nameservers or CNAME records

**Still on old version?**
- Hard refresh: Ctrl+Shift+R
- Clear Cloudflare cache in dashboard

## Benefits Over Netlify

| Feature          | Netlify Free | Cloudflare Pages |
|-----------------|--------------|------------------|
| Bandwidth       | 100GB/mo     | **UNLIMITED**    |
| Build minutes   | 300/mo       | 500/mo           |
| Sites           | 1 team       | Unlimited        |
| CDN             | Good         | **Fastest**      |
| DDoS protection | Basic        | **Enterprise**   |

---

**Ready?** Just follow Step 1-2 above to get started! 🚀
