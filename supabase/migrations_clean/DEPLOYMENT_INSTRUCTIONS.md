# 🚀 Clean Database Deployment Instructions

## ⚠️ CRITICAL: What NOT To Run

**❌ DO NOT run ANY files from these folders:**
- `sql/` folder (107 old chaotic files)
- `supabase/migrations/` folder (old untracked migrations)
- Any file with `storage.buckets` (app uses Cloudinary, not Supabase Storage)

## ✅ What TO Run - ONLY These 10 Files (In Order)

Run **ONLY** these files from `supabase/migrations_clean/` folder:

1. **001_foundation_profiles_auth.sql** - Profiles table & auth trigger
2. **002_network_connections_follows.sql** - Connections & follows
3. **003_messaging_system.sql** - Direct messaging
4. **004_feed_posts_engagement.sql** - Posts, likes, comments
5. **005_communities_system.sql** - Communities
6. **006_jobs_applications.sql** - Jobs system
7. **007_learning_courses.sql** - Courses platform
8. **008_points_leaderboard.sql** - **Points & leaderboard (fixes zero points!)**
9. **009_notifications_system.sql** - Notifications & reports
10. **010_admin_moderation.sql** - Admin tools & sponsored posts

---

## 📋 Step-by-Step Deployment

### Step 1: Backup (Optional)
```sql
-- If you want to save any existing data, export it first via Supabase Dashboard
```

### Step 2: Nuclear Option - Wipe Public Schema
```sql
-- ⚠️ WARNING: This deletes ALL tables in public schema (keeps auth.users intact)
DO $$ 
DECLARE r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Drop all functions
    FOR r IN (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE';
    END LOOP;
    
    -- Drop all triggers
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.' || quote_ident(r.event_object_table) || ' CASCADE';
    END LOOP;
    
    RAISE NOTICE 'Public schema cleaned successfully';
END $$;
```

### Step 3: Enable UUID Extension
```sql
-- Required for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Step 4: Run Each Migration (001-010)

**In Supabase SQL Editor:**
1. Open `001_foundation_profiles_auth.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click "Run"
5. Wait for success message: "Migration 001 completed successfully"
6. Repeat for migrations 002-010 **in order**

**Check for success messages:**
```
NOTICE: Migration 001 completed successfully
NOTICE: Migration 002 completed successfully
...
NOTICE: Migration 010 completed successfully
```

### Step 5: Verify Schema
```sql
-- Check all tables created (should be 25 tables)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all RPC functions (should be 16+ functions)
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

### Step 6: Enable Realtime (Optional)
```sql
-- Enable realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
```

### Step 7: Create First Admin User

**Via Supabase Auth Dashboard:**
1. Create a new user (or use existing)
2. Note the user's ID

**Grant admin privileges:**
```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = 'your-user-id-here';
```

### Step 8: Test Application

1. **Login:** Authenticate as admin user
2. **Create Post:** Should award +10 points (check leaderboard)
3. **Send Message:** Test messaging system
4. **Create Job:** Test jobs posting
5. **Create Community:** Test community creation
6. **Check Leaderboard:** Points should now be visible!

---

## 🎯 Common Post-Deployment Tasks

### Seed Gold Verified Users
```sql
-- Add gold verification for specific users
INSERT INTO public.gold_verified_users (user_id, verified_by, reason)
VALUES 
  ('user-id-1', 'admin-id', 'VIP sponsor'),
  ('user-id-2', 'admin-id', 'Foundation team')
ON CONFLICT (user_id) DO NOTHING;
```

### Award Profile Completion Bonuses
```sql
-- Manually trigger for users with complete profiles
SELECT public.award_profile_completion_bonus('user-id-here');
```

### Check Points System
```sql
-- View leaderboard
SELECT * FROM public.get_leaderboard(10, 0);

-- Check user's rank
SELECT * FROM public.get_user_rank('user-id-here');

-- View points history
SELECT * FROM public.points_history ORDER BY created_at DESC LIMIT 20;
```

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Solution:** You didn't wipe the schema. Run Step 2 again.

### Error: "function does not exist"
**Solution:** You skipped a migration or ran them out of order. Start over from migration 001.

### Error: "INSERT or UPDATE violates foreign key constraint"
**Solution:** Dependencies not met. Ensure you ran all previous migrations first.

### Leaderboard Still Shows Zeros
**Solution:** 
1. Check migration 008 ran successfully
2. Create a new post (should award +10 points)
3. Check: `SELECT * FROM public.points_history;`

### Auth Trigger Not Working
**Solution:**
1. Check: `SELECT * FROM auth.users;`  (should have users)
2. Check: `SELECT * FROM public.profiles;` (should match auth.users)
3. Create new test user to trigger profile creation

---

## 📊 Database Overview

**Total Tables:** 25
**Total Functions:** 16+
**Total Triggers:** 14+

**Key Tables:**
- profiles (users)
- posts, likes, comments (feed)
- messages (DMs)
- connections, follows (network)
- communities, community_members (groups)
- jobs, job_applications (careers)
- courses, course_enrollments (learning)
- points_history (gamification)
- notifications (alerts)
- sponsored_posts (advertising)

**No Storage Buckets Needed:** App uses Cloudinary for all media.

---

## ✅ You're Done!

Once all 10 migrations run successfully:
- ✅ All 25 tables created
- ✅ All RLS policies active
- ✅ All triggers firing
- ✅ Points system working
- ✅ Leaderboard functional
- ✅ App ready for production

**Important:** Going forward, any new database changes should be added as **new numbered migrations** (011, 012, etc.) in the `migrations_clean/` folder.
