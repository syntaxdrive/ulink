# UniLink Codebase Organization & Architecture Guide

## 📋 Project Overview

**UniLink Nigeria** is a professional networking platform for Nigerian university students and organizations (think LinkedIn for students). Built with React + Vite + TypeScript + Supabase.

---

## 🏗️ Project Structure

```
ulink/
├── src/                          # Frontend source code
│   ├── features/                 # Feature-based modules
│   │   ├── admin/               # Admin dashboard & management
│   │   ├── auth/                # Authentication & onboarding
│   │   ├── communities/         # Community feature
│   │   ├── feed/                # Posts, social feed
│   │   ├── jobs/                # Job board & applications
│   │   ├── landing/             # Landing pages
│   │   ├── layout/              # App layout & navigation
│   │   ├── leaderboard/         # Points & leaderboard system
│   │   ├── learn/               # Learning courses
│   │   ├── legal/               # Terms, Privacy, etc.
│   │   ├── messages/            # Direct messaging
│   │   ├── network/             # Connections & networking
│   │   ├── notifications/       # Notification center
│   │   ├── preferences/         # Profile editing (inline)
│   │   ├── profile/             # User profile pages
│   │   └── settings/            # App settings
│   ├── components/              # Shared components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # External library configs (Supabase)
│   ├── services/                # API services
│   ├── stores/                  # Zustand state management
│   ├── types/                   # TypeScript types
│   └── utils/                   # Utility functions
│
├── supabase/                    # ✅ PROPER MIGRATIONS (USE THIS)
│   └── migrations/              # Timestamped migration files
│       ├── 20260209_admin_badge_functions.sql
│       ├── 20260209_course_functions.sql
│       ├── 20260209_create_courses.sql
│       ├── 20260209_create_sponsored_posts.sql
│       ├── 20260209_create_whiteboards.sql
│       ├── 20260216_points_and_leaderboard.sql
│       └── make_admin.sql
│
├── sql/                         # ⚠️ AD-HOC SCRIPTS (CLEANUP NEEDED)
│   ├── calculate_historical_points.sql
│   ├── fix_points_history.sql
│   ├── POINTS_AND_LEADERBOARD.sql
│   ├── supabase_schema.sql
│   └── ... (100+ files - mostly one-off fixes)
│
├── docs/                        # Documentation
├── android/                     # Capacitor Android build
├── public/                      # Static assets
└── dist/                        # Build output

```

---

## 🚨 CRITICAL: SQL File Organization Problem

### **Current Issue**

You have **TWO places for SQL files**:

1. **`/supabase/migrations/`** (7 files) - ✅ **PROPER** migrations with timestamps
2. **`/sql/`** (100+ files) - ⚠️ **AD-HOC** scripts that have been run manually

### **The Problem**

When you run SQL files manually in Supabase SQL Editor:
- ❌ **No version tracking** - Can't tell what's been run
- ❌ **No rollback capability** - Can't undo changes
- ❌ **Team sync issues** - Other devs don't know what's deployed
- ❌ **Duplicate execution risk** - Might run the same SQL twice
- ❌ **No audit trail** - Can't track when/who ran what
- ❌ **Production hazards** - Easy to run wrong scripts in prod

### **The Solution: Proper Migration System**

```bash
# Supabase tracks migrations automatically
supabase/
└── migrations/
    ├── 20260209_create_courses.sql        # ✅ Tracked
    ├── 20260216_points_and_leaderboard.sql # ✅ Tracked
    └── 20260217_fix_points_history.sql    # ✅ To be created
```

---

## 📝 How to Organize Your SQL Files

### **Step 1: Identify What's Been Run**

Look at your Supabase Dashboard > Database > Migrations
- This shows which migrations have been applied
- Anything NOT there needs to be migrated properly

### **Step 2: Create Proper Migrations**

For any new database changes, create a migration:

```bash
# Create a new migration file
supabase migration new your_migration_name
```

This creates: `supabase/migrations/20260217123456_your_migration_name.sql`

### **Step 3: Migration Naming Convention**

```
YYYYMMDD_descriptive_name.sql

Examples:
✅ 20260217_fix_points_history.sql
✅ 20260217_update_storage_limits.sql
✅ 20260217_add_user_badges.sql

❌ fix.sql
❌ update1.sql
❌ final_final_v3.sql
```

### **Step 4: Deploy Migrations**

```bash
# Link to your Supabase project (one-time)
supabase link --project-ref rwtdjpwsxtwfeecseugg

# Push all new migrations
supabase db push

# Or deploy via Supabase CLI
supabase db remote commit
```

---

## 🗂️ File Reorganization Plan

### **Phase 1: Audit (Do This First)**

Create a spreadsheet/document listing:

| SQL File | Purpose | Status | Action |
|----------|---------|--------|--------|
| POINTS_AND_LEADERBOARD.sql | Points system setup | ⚠️ Partially deployed | Create migration |
| fix_points_history.sql | Fix missing column | ❌ Not deployed | Create migration |
| calculate_historical_points.sql | One-time script | ⚠️ Run once | Keep as utility |
| supabase_schema.sql | Base schema | ✅ Deployed | Archive |

### **Phase 2: Move to Migrations**

**Core System Files → Migrations:**
```
sql/POINTS_AND_LEADERBOARD.sql → supabase/migrs/20260216_points_and_leaderboard.sql ✅ (Already there)
sql/fix_points_history.sql → supabase/migrations/20260217_fix_points_history.sql
```

**One-Time Scripts → Utilities Folder:**
```
sql/calculate_historical_points.sql → sql/utilities/calculate_historical_points.sql
sql/verify_*.sql → sql/utilities/verification/
sql/check_*.sql → sql/utilities/diagnostics/
```

**Obsolete Scripts → Archive:**
```
sql/obsolete/
├── old_fixes/
└── deprecated/
```

### **Phase 3: Create Structure**

```
supabase/
└── migrations/           # Active migrations (version controlled)
    ├── 20260209_*.sql
    ├── 20260216_*.sql
    └── 20260217_*.sql

sql/
├── utilities/            # One-time helper scripts
│   ├── calculate_historical_points.sql
│   ├── verification/
│   └── diagnostics/
├── templates/            # SQL templates for common tasks
└── archive/              # Old/obsolete files
    └── pre_migration_cleanup/
```

---

## 🎯 Feature Architecture

### **Core Features**

| Feature | Purpose | Key Files |
|---------|---------|-----------|
| **Feed** | Social posts, images, videos | `src/features/feed/` |
| **Network** | Connections, following | `src/features/network/` |
| **Messages** | Direct messaging | `src/features/messages/` |
| **Jobs** | Job board, applications | `src/features/jobs/` |
| **Communities** | Topic-based groups | `src/features/communities/` |
| **Leaderboard** | Points & rankings | `src/features/leaderboard/` |
| **Learn** | Courses & resources | `src/features/learn/` |
| **Profile** | User profiles | `src/features/profile/` |
| **Admin** | Platform management | `src/features/admin/` |

### **Database Tables**

**Core Tables:**
- `profiles` - User accounts & profiles
- `posts` - Social posts
- `connections` - Network graph
- `messages` - Direct messages
- `jobs` - Job listings
- `communities` - Community groups
- `notifications` - User notifications
- `points_history` - Points tracking

**Supporting Tables:**
- `likes`, `comments`, `follows`
- `reports`, `polls`, `certificates`
- `courses`, `whiteboards`
- `sponsored_posts`

---

## 🔄 Recommended Workflow Going Forward

### **For Database Changes:**

1. **Create Migration File**
   ```bash
   supabase migration new add_feature_name
   ```

2. **Write SQL in Migration File**
   ```sql
   -- supabase/migrations/20260217_add_feature.sql
   CREATE TABLE new_table (...);
   CREATE INDEX ...;
   ```

3. **Test Locally (Optional)**
   ```bash
   supabase start  # Local Supabase
   supabase db reset  # Test migrations
   ```

4. **Deploy to Production**
   ```bash
   supabase db push
   ```

### **For One-Time Scripts:**

- Save in `sql/utilities/`
- Add comments explaining when/why to run
- Document in a README
- Don't delete after running (keep for reference)

### **For Verification Scripts:**

- Save in `sql/utilities/verification/`
- Use for debugging/testing
- Don't run in production

---

## 🚀 Immediate Action Items

### **Priority 1: Fix Critical Issues**

```bash
# 1. Fix points_history table
File: sql/fix_points_history.sql
Action: Run in Supabase SQL Editor NOW
Purpose: Fix "column points_earned does not exist" error

# 2. Calculate historical points
File: sql/calculate_historical_points.sql
Action: Run ONCE after fix_points_history
Purpose: Populate leaderboard with existing data
```

### **Priority 2: Clean Up SQL Folder**

```bash
# Create new structure
mkdir -p sql/utilities/{verification,diagnostics,one-time}
mkdir -p sql/archive/pre_migration_cleanup

# Move files (examples)
mv sql/check_*.sql sql/utilities/diagnostics/
mv sql/verify_*.sql sql/utilities/verification/
mv sql/calculate_*.sql sql/utilities/one-time/

# Move obsolete files
mv sql/fix_*.sql sql/archive/pre_migration_cleanup/  # After confirmed working
```

### **Priority 3: Document What's Deployed**

Create `sql/DEPLOYMENT_LOG.md`:

```markdown
# SQL Deployment Log

## Deployed Migrations
- ✅ 20260209_admin_badge_functions.sql
- ✅ 20260209_create_courses.sql
- ✅ 20260216_points_and_leaderboard.sql

## Pending Migrations
- ⏳ fix_points_history.sql → Create migration

## One-Time Scripts Run
- 2026-02-17: calculate_historical_points.sql

## Known Issues
- points_history missing columns (fixed by fix_points_history.sql)
```

---

## 📚 Key Technologies

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State**: Zustand
- **Routing**: React Router v7
- **Mobile**: Capacitor (Android)
- **Deployment**: Capawesome (OTA updates)
- **Storage**: Cloudinary (images/files)

---

## 🎨 Design System

**Colors:**
- Primary: Emerald Green (#10b981)
- Dark Mode: Zinc scales
- Light Mode: Stone scales

**Components:**
- Rounded corners: `rounded-xl`, `rounded-2xl`
- Shadows: Subtle, layered
- Transitions: Smooth, 200-300ms
- Typography: Clean, readable

---

## 📞 Need Help?

**Common Issues:**
1. **Database errors** → Check `sql/utilities/diagnostics/`
2. **Migration conflicts** → Use `supabase db reset`
3. **Missing tables** → Check if migration was applied

**Next Steps:**
1. Run fix_points_history.sql
2. Run calculate_historical_points.sql
3. Organize SQL folder
4. Create deployment log
5. Use migrations for all future changes

---

**Last Updated:** February 17, 2026
**Version:** 1.0
