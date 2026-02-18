# SQL Migration Strategy & Deployment Log

## 🎯 Migration Strategy

### **Current State**
- ✅ 7 files in `/supabase/migrations/` (properly tracked)
- ⚠️ 100+ files in `/sql/` (manually run, untracked)
- ❌ No clear record of what's been deployed

### **Goal**
- All schema changes go through proper migrations
- Clear audit trail of database state
- Easy rollback capability
- Team synchronization

---

## 📋 Deployed Migrations

### **Confirmed Deployed (via Supabase Dashboard)**

| Date | Migration | Status | Notes |
|------|-----------|--------|-------|
| 2026-02-09 | `20260209_admin_badge_functions.sql` | ✅ Deployed | Admin badge system |
| 2026-02-09 | `20260209_course_functions.sql` | ✅ Deployed | Course management |
| 2026-02-09 | `20260209_create_courses.sql` | ✅ Deployed | Courses table |
| 2026-02-09 | `20260209_create_sponsored_posts.sql` | ✅ Deployed | Sponsored content |
| 2026-02-09 | `20260209_create_whiteboards.sql` | ✅ Deployed | Whiteboard feature |
| 2026-02-16 | `20260216_points_and_leaderboard.sql` | ⚠️ Partial | Points system (MISSING points_history columns) |
| 2026-02-09 | `make_admin.sql` | ✅ Deployed | Admin user creation |

---

## ⏳ Pending Migrations

### **To Create:**

1. **fix_points_history.sql** → `20260217_fix_points_history.sql`
   - Purpose: Add missing `points_earned` and `reference_id` columns
   - Priority: 🔴 CRITICAL
   - Fixes: "column points_earned does not exist" error

2. **Core schema verification**
   - Review `sql/supabase_schema.sql`
   - Ensure all base tables exist
   - Create migration if needed

---

## 🔧 One-Time Scripts Log

### **Run History:**

| Date | Script | Run By | Result | Notes |
|------|--------|--------|--------|-------|
| - | `calculate_historical_points.sql` | - | ⏳ Pending | Wait for points_history fix |

### **To Run (After Migrations):**

1. `sql/fix_points_history.sql` - Fix points_history table ← **RUN THIS FIRST**
2. `sql/calculate_historical_points.sql` - Populate historical points ← **RUN THIS SECOND**

---

## 📁 SQL Folder Reorganization

### **Phase 1: Current Structure (BEFORE)**

```
sql/ (100+ files in flat structure)
├── POINTS_AND_LEADERBOARD.sql
├── fix_points_history.sql
├── calculate_historical_points.sql
├── fix_notifications_*.sql (10+ files)
├── setup_*.sql (20+ files)
├── check_*.sql (5+ files)
└── ... (many more)
```

### **Phase 2: Proposed Structure (AFTER)**

```
sql/
├── utilities/
│   ├── one-time/                    # Scripts to run once
│   │   ├── calculate_historical_points.sql
│   │   └── migrate_old_data.sql
│   ├── verification/                # Checking database state
│   │   ├── verify_community_setup.sql
│   │   ├── check_messages_schema.sql
│   │   └── list_verified_users.sql
│   ├── diagnostics/                 # Debugging
│   │   ├── inspect_notifications.sql
│   │   ├── debug_notifications.sql
│   │   └── fetch_unread_counts.sql
│   └── admin/                       # Admin tasks
│       ├── assign_founder_roles.sql
│       ├── create_admin_account.sql
│       └── add_gold_ticks.sql
├── templates/                       # Reusable SQL patterns
│   ├── create_notifications_template.sql
│   └── rls_policy_template.sql
├── archive/                         # Historical/obsolete
│   └── pre_migration_cleanup/
│       ├── fix_notifications_v1.sql
│       ├── fix_notifications_v2.sql
│       └── ... (old fixes)
└── README.md                        # Documentation
```

### **Phase 3: Move Commands**

```bash
# Create structure
mkdir -p sql/utilities/{one-time,verification,diagnostics,admin}
mkdir -p sql/templates
mkdir -p sql/archive/pre_migration_cleanup

# Categorize files
# One-time scripts
mv sql/calculate_historical_points.sql sql/utilities/one-time/

# Verification scripts
mv sql/verify_*.sql sql/utilities/verification/
mv sql/check_*.sql sql/utilities/verification/
mv sql/list_*.sql sql/utilities/verification/

# Diagnostic scripts
mv sql/inspect_*.sql sql/utilities/diagnostics/
mv sql/debug_*.sql sql/utilities/diagnostics/
mv sql/fetch_*.sql sql/utilities/diagnostics/

# Admin scripts
mv sql/assign_*.sql sql/utilities/admin/
mv sql/create_admin_*.sql sql/utilities/admin/
mv sql/add_gold_*.sql sql/utilities/admin/
mv sql/remove_gold_*.sql sql/utilities/admin/

# Archive old fix scripts (after confirming they worked)
mv sql/fix_notifications_*.sql sql/archive/pre_migration_cleanup/
mv sql/fix_*_final.sql sql/archive/pre_migration_cleanup/
```

---

## 🚀 Going Forward: Best Practices

### **For Schema Changes:**

1. ✅ **Create Migration**
   ```bash
   supabase migration new descriptive_name
   ```

2. ✅ **Write in Migration File**
   ```sql
   -- supabase/migrations/YYYYMMDD_descriptive_name.sql
   CREATE TABLE ...;
   ALTER TABLE ...;
   ```

3. ✅ **Test Locally** (Optional but recommended)
   ```bash
   supabase start
   supabase db reset
   ```

4. ✅ **Deploy**
   ```bash
   supabase db push
   ```

5. ✅ **Document Here**
   - Add to "Deployed Migrations" table
   - Note any follow-up scripts needed

### **For One-Time Scripts:**

1. ✅ Save in `sql/utilities/one-time/`
2. ✅ Add clear comments at top:
   ```sql
   -- RUN ONCE: After migration XYZ
   -- Purpose: Populate historical data
   -- Safe to re-run: NO (has side effects)
   ```
3. ✅ Document in "One-Time Scripts Log"
4. ✅ Keep file even after running (for reference)

### **For Debugging:**

1. ✅ Save in `sql/utilities/diagnostics/`
2. ✅ Use SELECT queries (read-only preferred)
3. ✅ Name descriptively: `debug_feature_name.sql`

---

## 🔍 How to Check What's Deployed

### **Method 1: Supabase Dashboard**
1. Go to Supabase Dashboard
2. Navigate to: Database → Migrations
3. See list of applied migrations

### **Method 2: SQL Query**
```sql
-- Check migration history
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

### **Method 3: Check Tables**
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if specific table/column exists
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'points_history';
```

---

## ⚠️ Common Issues & Solutions

### **Issue: "Column does not exist"**
**Cause:** Migration not applied or incomplete
**Solution:** 
1. Check if migration exists in `supabase/migrations/`
2. Run `supabase db push`
3. Or manually run the SQL in Supabase Dashboard

### **Issue: "Relation already exists"**
**Cause:** Migration run twice
**Solution:**
1. Use `CREATE TABLE IF NOT EXISTS`
2. Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
3. Check migration history first

### **Issue: "Can't tell what's been deployed"**
**Cause:** Files run manually without tracking
**Solution:**
1. Query database to check current state
2. Document findings in this log
3. Move to proper migrations going forward

---

## 📝 Quick Checklist for Today

- [ ] Run `sql/fix_points_history.sql` in Supabase SQL Editor
- [ ] Run `sql/calculate_historical_points.sql` after points fix
- [ ] Create migration: `supabase migration new fix_points_history`
- [ ] Copy fix_points_history.sql content into new migration
- [ ] Create `sql/utilities/` folder structure
- [ ] Move one-time scripts to appropriate folders
- [ ] Archive old fix files
- [ ] Update this log with results

---

## 📞 Need to Rollback?

### **For Migrations:**
```bash
# Rollback last migration
supabase migration repair --status reverted <version>

# Or manually in SQL Editor
DROP TABLE ...; 
-- Reverse the changes
```

### **For One-Time Scripts:**
- Check if script has a "rollback" section
- Or manually write reversal SQL
- This is why we keep scripts even after running!

---

**Last Updated:** February 17, 2026
**Maintainer:** Update this log after any database changes!
