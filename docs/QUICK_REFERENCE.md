# 🎯 Netlify Migration - Quick Reference

## 📦 What Was Configured

✅ `netlify.toml` - Build settings, redirects, security headers, caching  
✅ `public/_redirects` - SPA routing  
✅ `public/_headers` - Security & cache headers  
✅ `.env.example` - Environment variable template  
✅ Updated `.gitignore` - Exclude Netlify files  

## 🚀 Deploy in 3 Steps

### 1️⃣ Push to Git
```bash
git add .
git commit -m "Configure for Netlify"
git push origin main
```

### 2️⃣ Deploy on Netlify
- Go to [netlify.com/app](https://app.netlify.com/)
- **Add new site** → Import from Git
- Select your repo
- Add environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Click **Deploy**

### 3️⃣ Update OAuth URLs
**Supabase:** Auth → URL Config → Add Netlify URL  
**Google:** Cloud Console → OAuth Client → Add Netlify URL  

## 🔑 Key Commands

```bash
# Test build locally
npm run build

# Preview build
npm run preview

# Deploy via CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## 📊 Netlify Free vs InfinityFree

| Metric | InfinityFree | Netlify Free |
|--------|-------------|--------------|
| Bandwidth | Crashed at <100 users | **100GB** (~250k views) |
| Uptime | Poor | **99.9%+** |
| Deploy | Manual FTP | **Git push** |
| Rollback | None | **1-click** |

## ⚠️ Don't Forget!

- [ ] Set environment variables in Netlify
- [ ] Update Supabase redirect URLs
- [ ] Update Google OAuth URLs (if using)
- [ ] Test authentication after deployment
- [ ] Remove old InfinityFree `.htaccess` (not needed)

## 📖 Full Guides

- **Quick Start:** `NETLIFY_MIGRATION_SUMMARY.md`
- **Step-by-Step:** `NETLIFY_DEPLOYMENT.md`
- **Checklist:** `NETLIFY_MIGRATION_CHECKLIST.md`

## 🆘 Troubleshooting

**Build fails?** → Check env vars are set  
**404 errors?** → `_redirects` file should be in `public/`  
**Auth fails?** → Update OAuth redirect URLs  
**Slow?** → Check Lighthouse score in DevTools  

---

**For 1000 daily users:** Netlify Free is perfect. Upgrade to Pro ($19/mo) if you exceed 100GB bandwidth.
