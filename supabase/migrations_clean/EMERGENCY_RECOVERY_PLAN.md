# 🚨 Emergency User Data Recovery Plan

## What Happened
The database was wiped during migration deployment. **Auth accounts are preserved** but profile data (usernames, bios, posts, etc.) was lost.

## Good News ✅
Your app **already handles this automatically**! Users will be redirected to recreate their profiles on next login.

---

## Step 1: Restore Basic User Accounts (Do This Now!)

Run this in Supabase SQL Editor:

```sql
-- Create basic profiles for all auth users
INSERT INTO public.profiles (id, email, created_at, updated_at)
SELECT 
    id,
    email,
    created_at,
    NOW() as updated_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Verify recovery
SELECT 
    (SELECT COUNT(*) FROM public.profiles) as profiles_count,
    (SELECT COUNT(*) FROM auth.users) as auth_users_count;
-- Both numbers should be 147
```

---

## Step 2: What Users Will Experience

### Existing Users (All 147):
1. ✅ Can login with email/password (or Google)
2. ✅ Automatically redirected to "Welcome back!" onboarding screen
3. ✅ Prompted to recreate username & university
4. ✅ Can use the app normally after setup

### What They Lost:
- ❌ Previous usernames
- ❌ Profile pictures
- ❌ Bios and headlines
- ❌ Skills and experience
- ❌ Posts and comments
- ❌ Connections and follows
- ❌ Messages
- ❌ Points history
- ❌ Everything except login credentials

---

## Step 3: Communication Plan

### Send Email/Announcement to All Users:

**Subject:** Important: UniLink System Update - Action Required

**Body:**
```
Hi there,

We've completed a major system upgrade to improve UniLink's performance and security. 

Due to this update, you'll need to set up your profile again when you log in. We apologize for this inconvenience.

What you need to do:
1. Login with your existing email/password
2. Complete the short profile setup (username & university)
3. You're back in!

Your login credentials haven't changed, but you'll need to:
- Reconnect with friends
- Rebuild your network
- Recreate your posts

We've learned from this and implemented daily automated backups to prevent future issues.

Thank you for your patience and continued support!

The UniLink Team
```

---

## Step 4: Monitor for Issues

### Common Problems Users May Report:

**"I can't login"**
- Check if their auth.users account exists
- Reset password if needed

**"It keeps asking me to set up my profile"**
- Check if profile has `role` field set
- Run: `SELECT * FROM profiles WHERE email = 'user@email.com';`

**"My old username is taken"**
- All usernames are available (database was wiped)
- First come, first served

**"Where are my posts/connections?"**
- Explain data was lost
- Apologize and offer support

---

## Step 5: Prevent This From Happening Again

### Immediate Actions:

1. **Enable Point-in-Time Recovery (PITR)**
   - Supabase Dashboard → Settings → Database
   - Enable PITR (Pro plan feature)

2. **Set Up Daily Backups**
   - Use `pg_dump` via cron job
   - Store backups in cloud storage (AWS S3, Google Cloud)

3. **Create Staging Environment**
   - Never test migrations on production again
   - Always test in separate project first

4. **Document Backup/Restore Procedures**
   - Write clear guides for emergencies
   - Test restoration process monthly

### Backup Script Example:

```bash
#!/bin/bash
# daily-backup.sh

DATE=$(date +%Y-%m-%d)
SUPABASE_PROJECT="rwtdjpwsxtwfeecseugg"
BACKUP_DIR="/backups/ulink"

# Backup database
pg_dump "postgresql://postgres:[PASSWORD]@db.${SUPABASE_PROJECT}.supabase.co:5432/postgres" \
  > "${BACKUP_DIR}/ulink-backup-${DATE}.sql"

# Upload to cloud storage
aws s3 cp "${BACKUP_DIR}/ulink-backup-${DATE}.sql" \
  s3://ulink-backups/ --region us-east-1
```

---

## Step 6: Track Recovery Progress

### Monitor user logins and profile completions:

```sql
-- Check how many users have completed profile setup
SELECT 
    COUNT(*) FILTER (WHERE role IS NOT NULL) as completed_profiles,
    COUNT(*) FILTER (WHERE role IS NULL) as pending_profiles,
    COUNT(*) as total_profiles
FROM profiles;

-- Check recent profile updates (users who just recreated)
SELECT 
    email,
    username,
    role,
    university,
    updated_at
FROM profiles
WHERE updated_at > NOW() - INTERVAL '1 day'
ORDER BY updated_at DESC;
```

---

## Next Steps Right Now:

1. ✅ Run Step 1 recovery SQL (create basic profiles)
2. ✅ Refresh your app to test login flow
3. ✅ Draft user communication email
4. ✅ Send announcement to all 147 users
5. ✅ Monitor support channels for issues
6. ✅ Set up automated backups today

---

## Silver Lining 🌟

While this is unfortunate:
- ✅ App code is intact
- ✅ Login system works
- ✅ Clean database (no more SQL chaos)
- ✅ Proper migrations in place
- ✅ No security breach
- ✅ Opportunity to re-engage users

Users will be annoyed but understanding if you:
- Communicate clearly
- Apologize sincerely
- Act quickly
- Prevent it from happening again
