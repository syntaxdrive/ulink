# 🚀 STEP-BY-STEP DATABASE DEPLOYMENT GUIDE

**Time Required:** 15-20 minutes  
**Skill Level:** Copy/paste into SQL Editor

---

## ⚠️ IMPORTANT: Before You Start

**This will:**
- ✅ Delete all tables in public schema
- ✅ Delete all functions, triggers, policies
- ✅ Keep your Supabase Auth users (auth.users table is preserved)
- ✅ Deploy clean, organized database schema

**You will need:**
- Access to Supabase SQL Editor: `https://app.supabase.com/project/rwtdjpwsxtwfeecseugg/sql`
- 15 minutes of uninterrupted time

---

## Step 1: Wipe Existing Database

**Location:** Supabase Dashboard → SQL Editor

1. Click "New Query" (or use existing tab)
2. Open [000_WIPE_DATABASE.sql](000_WIPE_DATABASE.sql) from this folder
3. Copy entire file contents (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. Wait 10-30 seconds for completion

**Expected Output:**
```
NOTICE: Starting database cleanup...
NOTICE: Dropping all tables...
NOTICE:   ✓ Dropped table: profiles
NOTICE:   ✓ Dropped table: posts
... (more tables)
NOTICE: Dropping all functions...
... (more functions)
NOTICE: Database cleanup complete!
```

**If you see errors about "does not exist":** That's normal! Continue to next step.

---

## Step 2: Enable UUID Extension

**In same SQL Editor:**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Expected Output:**
```
CREATE EXTENSION
```

---

## Step 3: Deploy Migration 001 (Foundation)

1. Open [001_foundation_profiles_auth.sql](001_foundation_profiles_auth.sql)
2. Copy entire file contents
3. Paste into SQL Editor (clear previous query first)
4. Click "Run"
5. Wait for completion (5-10 seconds)

**Expected Output:**
```
NOTICE: Migration 001 completed successfully
```

**If error occurs:** STOP and share the error message. Do not continue.

---

## Step 4: Deploy Migration 002 (Network)

1. Open [002_network_connections_follows.sql](002_network_connections_follows.sql)
2. Copy entire file contents
3. Paste into SQL Editor
4. Click "Run"

**Expected:** `NOTICE: Migration 002 completed successfully`

---

## Step 5: Deploy Migration 003 (Messaging)

1. Open [003_messaging_system.sql](003_messaging_system.sql)
2. Copy, paste, run

**Expected:** `NOTICE: Migration 003 completed successfully`

---

## Step 6: Deploy Migration 004 (Feed)

1. Open [004_feed_posts_engagement.sql](004_feed_posts_engagement.sql)
2. Copy, paste, run

**Expected:** `NOTICE: Migration 004 completed successfully`

---

## Step 7: Deploy Migration 005 (Communities)

1. Open [005_communities_system.sql](005_communities_system.sql)
2. Copy, paste, run

**Expected:** `NOTICE: Migration 005 completed successfully`

---

## Step 8: Deploy Migration 006 (Jobs)

1. Open [006_jobs_applications.sql](006_jobs_applications.sql)
2. Copy, paste, run

**Expected:** `NOTICE: Migration 006 completed successfully`

---

## Step 9: Deploy Migration 007 (Courses)

1. Open [007_learning_courses.sql](007_learning_courses.sql)
2. Copy, paste, run

**Expected:** `NOTICE: Migration 007 completed successfully`

---

## Step 10: Deploy Migration 008 (Points & Leaderboard) 🎯

**This fixes your zero points issue!**

1. Open [008_points_leaderboard.sql](008_points_leaderboard.sql)
2. Copy, paste, run

**Expected:** `NOTICE: Migration 008 completed successfully`

---

## Step 11: Deploy Migration 009 (Notifications)

1. Open [009_notifications_system.sql](009_notifications_system.sql)
2. Copy, paste, run

**Expected:** `NOTICE: Migration 009 completed successfully`

---

## Step 12: Deploy Migration 010 (Admin)

1. Open [010_admin_moderation.sql](010_admin_moderation.sql)
2. Copy, paste, run

**Expected:** `NOTICE: Migration 010 completed successfully`

---

## Step 13: Verify Deployment

Run the validation script:

1. Open [VALIDATE_DEPLOYMENT.sql](VALIDATE_DEPLOYMENT.sql)
2. Copy, paste, run

**Expected Output:**
```
NOTICE: =================================================
NOTICE:        DATABASE VALIDATION REPORT
NOTICE: =================================================
NOTICE: 1. TABLE COUNT:
NOTICE:    ✅ PASSED - Found 25 tables (expected 25)
NOTICE: 2. REQUIRED TABLES:
NOTICE:    ✅ PASSED - All 25 tables exist
NOTICE: 3. FUNCTIONS:
NOTICE:    ✅ PASSED - Found 16+ functions
... (more checks)
```

---

## Step 14: Create Admin User

### Option A: If you already have an account

1. Log into your app with your existing account
2. Find your user ID in Supabase Dashboard:
   - Go to: Authentication → Users
   - Copy your User UID

3. Grant admin privileges:
```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = 'paste-your-user-id-here';
```

### Option B: Create new admin account

1. Sign up via your app's signup page
2. Find your new user ID (same as above)
3. Grant admin privileges (same SQL as above)

---

## Step 15: Test Your App

1. **Refresh your app** (hard refresh: Ctrl+Shift+R)
2. **Login** with your account
3. **Create a post** → Check if you get +10 points
4. **View leaderboard** → Should show points now!
5. **Send a message** → Test messaging
6. **Create a community** → Test communities
7. **Post a job** → Test jobs

---

## Troubleshooting

### "Migration XXX failed with error..."

**Action:** 
1. Don't panic
2. Copy the exact error message
3. Note which migration number failed
4. Stop and ask for help with the error

### "No tables exist after running migrations"

**Possible causes:**
- Didn't run wipe script first
- Ran migrations out of order
- Network issue during execution

**Fix:** Start over from Step 1

### "Points still showing zero"

**Check:**
```sql
-- Did migration 008 run?
SELECT * FROM public.points_history;

-- Are triggers installed?
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name LIKE '%points%';
```

### "Can't login after deployment"

**Cause:** Auth users are preserved, but profiles table is new

**Fix:** Your existing auth.users are fine. The trigger will auto-create profiles on next login.

---

## Post-Deployment Checklist

After successful deployment:

- [ ] All 10 migrations completed successfully
- [ ] Validation script shows all ✅ checks passed
- [ ] Admin user created
- [ ] App loads without errors
- [ ] Can create posts
- [ ] Points appear on leaderboard
- [ ] Can send messages
- [ ] Can navigate without errors

---

## Optional: Enable Realtime

For real-time features (messages, notifications):

```sql
-- Enable Realtime on specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
```

---

## Optional: Seed Data

### Add Gold Verified Users

```sql
-- Replace with actual user IDs from your auth.users table
INSERT INTO public.gold_verified_users (user_id, verified_by, reason)
VALUES 
  ('user-id-1', 'admin-id', 'Founder'),
  ('user-id-2', 'admin-id', 'VIP Partner')
ON CONFLICT (user_id) DO NOTHING;
```

---

## 🎉 You're Done!

Your database is now:
- ✅ Clean and organized
- ✅ Fully documented
- ✅ Properly secured with RLS
- ✅ Optimized with indexes
- ✅ Ready for production

**Going forward:** Any new database changes should be added as migration 011, 012, etc. in this folder.
