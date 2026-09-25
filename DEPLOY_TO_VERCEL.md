# Deploy UniLink to Vercel

## Quick Setup (5 minutes)

### 1. Install Vercel CLI (if not installed)
```powershell
npm install -g vercel
```

### 2. Deploy to Vercel
```powershell
vercel
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** (Select your account)
- **Link to existing project?** N
- **Project name?** ulink (or press Enter)
- **Directory?** ./ (press Enter)
- **Override settings?** N

### 3. Add Environment Variables
After first deploy, add your Supabase credentials:

```powershell
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase anon key
```

Select: **Production, Preview, Development** (all three)

### 4. Deploy to Production
```powershell
vercel --prod
```

### 5. Connect Custom Domain (unilink.ng)

**In Vercel Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Select your `ulink` project
3. Click **Settings** → **Domains**
4. Add `unilink.ng` and `www.unilink.ng`

**Update DNS (Your Domain Registrar):**

Add these DNS records:

| Type  | Name | Value                    |
|-------|------|--------------------------|
| A     | @    | 76.76.21.21             |
| CNAME | www  | cname.vercel-dns.com    |

**Vercel will automatically:**
- Generate SSL certificate (HTTPS)
- Handle www redirects
- Deploy on every git push

## Alternative: Deploy via GitHub Integration

1. Go to: https://vercel.com/new
2. Import your GitHub repo: `syntaxdrive/ulink`
3. Add environment variables
4. Deploy!
5. Add custom domain in settings

## Verify Deployment

After deployment:
- Test URL: Will be shown after `vercel --prod`
- Custom domain: https://unilink.ng (after DNS propagation, ~10 minutes)

## Auto-Deploy on Push

Vercel automatically deploys when you push to GitHub:
- Push to `main` → Deploys to production
- Opens Pull Request → Creates preview deployment

## Get Your Supabase Credentials

Already configured in `.env.local`, or get them from:
1. https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy the URL and anon key
