# 🔐 Netlify Environment Variables Setup

## Your Supabase Credentials

When deploying to Netlify, you'll need to add these environment variables.

### Method 1: Via Netlify UI (Recommended)

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add these **EXACTLY** as shown:

#### Variable 1:
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://rwtdjpwsxtwfeecseugg.supabase.co`
- **Scopes:** All scopes (Production, Deploy Previews, Branch deploys)

#### Variable 2:
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dGRqcHdzeHR3ZmVlY3NldWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMzg2MjUsImV4cCI6MjA4MzcxNDYyNX0.s9fNTqVzjydNQIvSQvM6zHldnL5TU-zKg4KARE0F_b8`
- **Scopes:** All scopes (Production, Deploy Previews, Branch deploys)

5. Click **Save**
6. **Trigger a new deploy** (Deploys → Trigger deploy → Deploy site)

### Method 2: Via Netlify CLI

If you have Netlify CLI installed:

```bash
netlify env:set VITE_SUPABASE_URL "https://rwtdjpwsxtwfeecseugg.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dGRqcHdzeHR3ZmVlY3NldWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMzg2MjUsImV4cCI6MjA4MzcxNDYyNX0.s9fNTqVzjydNQIvSQvM6zHldnL5TU-zKg4KARE0F_b8"
```

## ⚠️ IMPORTANT: Update Supabase Auth Settings

After deploying to Netlify, you MUST update your Supabase redirect URLs:

### Steps:

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com/project/rwtdjpwsxtwfeecseugg

2. **Navigate to Authentication → URL Configuration**

3. **Update Site URL:**
   - Set to your Netlify URL: `https://your-site-name.netlify.app`
   - Or your custom domain: `https://unilink.ng`

4. **Add Redirect URLs:**
   Click "Add URL" and add these patterns:
   - `https://your-site-name.netlify.app/**`
   - `http://localhost:5173/**` (for local dev)
   - `https://unilink.ng/**` (when you add custom domain)

5. **Save changes**

## 🔍 Verify Environment Variables

After adding variables to Netlify:

1. Check they're set:
   - Netlify CLI: `netlify env:list`
   - UI: Site settings → Environment variables

2. Trigger a new deploy:
   - Deploys → Trigger deploy → Deploy site

3. Check build logs:
   - Should NOT show "VITE_SUPABASE_URL is undefined" errors

## ✅ Testing Checklist

After deployment with environment variables:

- [ ] Site loads without errors
- [ ] Can sign up for new account
- [ ] Can sign in with existing account
- [ ] Google OAuth works (if configured)
- [ ] Database queries work (feed, profile, etc.)
- [ ] Protected routes redirect to login

## 🚨 Troubleshooting

### Build succeeds but auth doesn't work:
- **Check:** Environment variables are set in Netlify
- **Check:** Netlify URL is added to Supabase redirect URLs
- **Check:** Variables are spelled exactly as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### "Invalid API key" error:
- **Check:** The anon key is copied correctly (it's a long JWT token)
- **Check:** No extra spaces or line breaks in the key

### Google Sign-In fails:
- **Check:** Google OAuth client has Netlify URL in authorized origins
- **Check:** Supabase has Google provider enabled
- **Check:** Redirect URLs match exactly

## 📝 Security Notes

**These are PUBLIC keys** (anon role) - safe to use in the browser:
✅ Safe to add to Netlify environment variables
✅ Safe to commit to `.env.example` (template)
❌ **DO NOT** commit `.env.local` with real values to Git
❌ **DO NOT** share your **service_role** key publicly

The anon key has Row Level Security (RLS) protection in Supabase, so it's designed to be public.

## 🎯 Quick Copy-Paste for Netlify

**For quick setup, copy these:**

```
VITE_SUPABASE_URL=https://rwtdjpwsxtwfeecseugg.supabase.co
```

```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dGRqcHdzeHR3ZmVlY3NldWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMzg2MjUsImV4cCI6MjA4MzcxNDYyNX0.s9fNTqVzjydNQIvSQvM6zHldnL5TU-zKg4KARE0F_b8
```

---

**You're all set!** Environment variables are configured for local development. Just add them to Netlify when you deploy! 🚀
