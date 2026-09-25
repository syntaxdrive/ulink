# SQL FILE AUDIT - Which Files Are Duplicates?

## 🔍 THE PROBLEM

You have **multiple versions** of SQL files and can't tell:
- ❌ Which one was actually run
- ❌ Which one is the "correct" version  
- ❌ What's actually in the database vs what's in files
- ❌ Why there's a mismatch (error: "points_earned column doesn't exist")

---

## 📊 FILE COMPARISON RESULTS

### **POINTS_AND_LEADERBOARD.sql** - Two Locations

| Location | Lines | Status | Notes |
|----------|-------|--------|-------|
| `/sql/POINTS_AND_LEADERBOARD.sql` | 280 | ✅ **IDENTICAL** | Original file |
| `/supabase/migrations/20260216_points_and_leaderboard.sql` | 283 | ✅ **IDENTICAL** | Migration copy |

**Verdict:** These are the SAME file (3 line difference is just formatting)

**What it should create:**
```sql
CREATE TABLE points_history (
    id UUID,
    user_id UUID,
    action_type TEXT,
    points_earned INTEGER NOT NULL,  ← This column SHOULD exist
    reference_id UUID,               ← This column SHOULD exist
    created_at TIMESTAMPTZ
);
```

---

## 🚨 THE MYSTERY: Why Does The Error Say Column Doesn't Exist?

### **Possible Scenarios:**

1. **Table created by different script** ✅ MOST LIKELY
   - Someone ran an older/incomplete version
   - Or manually created the table without those columns

2. **Migration partially failed** 
   - Script started but didn't finish
   - Error occurred before those columns were created

3. **Table was modified later**
   - Someone manually dropped the columns
   - Or ran a destructive ALTER TABLE

---

## 🔬 HOW TO CHECK CURRENT DATABASE STATE

### **Run this in Supabase SQL Editor:**

```sql
-- 1. Check if points_history table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'points_history'
);

-- 2. If table exists, check its columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'points_history'
ORDER BY ordinal_position;

-- 3. Check how many rows it has
SELECT COUNT(*) FROM points_history;

-- 4. Sample the data structure
SELECT * FROM points_history LIMIT 1;
```

---

## 📋 DIAGNOSIS RESULTS (Fill this in after running above)

```
Points History Table:
├── Exists? [ ] YES [ ] NO
├── Columns Found:
│   [ ] id
│   [ ] user_id  
│   [ ] action_type
│   [ ] points_earned    ← MISSING = This is your problem
│   [ ] reference_id     ← MISSING = This is your problem
│   [ ] created_at
└── Row count: _______
```

---

## ✅ THE FIX (Based on Diagnosis)

### **Scenario A: Table exists but missing columns** ← YOU ARE HERE

**Solution:** Run `sql/fix_points_history.sql`

```sql
-- This adds the missing columns safely
ALTER TABLE points_history 
ADD COLUMN IF NOT EXISTS points_earned INTEGER NOT NULL DEFAULT 0;

ALTER TABLE points_history 
ADD COLUMN IF NOT EXISTS reference_id UUID;
```

**Then run:** `sql/calculate_historical_points.sql`

---

### **Scenario B: Table doesn't exist at all**

**Solution:** Run the full migration

1. Drop existing migration from tracking (if any):
   ```sql
   DELETE FROM supabase_migrations.schema_migrations 
   WHERE version = '20260216_points_and_leaderboard';
   ```

2. Run fresh:
   ```bash
   supabase db push
   ```

3. Or manually run entire file:
   - `supabase/migrations/20260216_points_and_leaderboard.sql`

---

### **Scenario C: Table exists with correct columns**

**Problem is elsewhere:**
- Check if triggers are created
- Check if functions exist
- Run verification queries

---

## 🗂️ OTHER DUPLICATE FILES FOUND

### **Files that might have multiple versions:**

| File Pattern | Locations | Status |
|--------------|-----------|--------|
| `fix_notifications_*.sql` | 10+ files in /sql/ | ⚠️ Many iterations, likely obsolete |
| `setup_*.sql` | 20+ files in /sql/ | ⚠️ Unclear which were run |
| `create_*.sql` | Multiple | ❓ Need to compare |

**Action needed:** Audit each category separately

---

## 🎯 IMMEDIATE ACTION PLAN

### **Step 1: Diagnose Current State (2 minutes)**

Run the diagnosis queries above and fill in the checklist.

### **Step 2: Apply Fix (5 minutes)**

Based on diagnosis:
- **Missing columns?** → Run `sql/fix_points_history.sql`
- **No table?** → Run full migration
- **Everything exists?** → Check triggers/functions

### **Step 3: Verify Fix (1 minute)**

```sql
-- Should return both columns now
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'points_history';

-- Should work without error
SELECT user_id, points_earned FROM points_history LIMIT 1;
```

### **Step 4: Calculate Points (2 minutes)**

Run `sql/calculate_historical_points.sql`

### **Step 5: Document What You Did**

Update `sql/DEPLOYMENT_LOG.md` with:
- What was the actual problem
- What file you ran
- When you ran it
- Verification that it worked

---

## 🧹 CLEANUP PLAN (After Fix Works)

### **Phase 1: Mark Duplicates**

```bash
# Windows PowerShell
# Move the /sql/ version to archive since migration exists
move sql\POINTS_AND_LEADERBOARD.sql sql\archive\POINTS_AND_LEADERBOARD_reference.sql
```

### **Phase 2: Consolidate Fix Scripts**

```bash
# After fix_points_history.sql is confirmed working:
move sql\fix_points_history.sql sql\archive\pre_migration_cleanup\fix_points_history_APPLIED_20260217.sql
```

### **Phase 3: Keep Only Active Files**

```
sql/
├── utilities/          ← Helper scripts
├── templates/          ← Reusable patterns  
├── archive/            ← Historical files
└── DEPLOYMENT_LOG.md   ← What's been run
```

---

## 📝 LESSONS LEARNED

### **Why This Happened:**

1. ❌ Running SQL manually without tracking
2. ❌ Making copies of files instead of versioning
3. ❌ No clear "source of truth" for database state
4. ❌ No documentation of what was run

### **How to Prevent This:**

1. ✅ Always use migrations in `/supabase/migrations/`
2. ✅ Never copy files - version them with timestamps
3. ✅ Keep DEPLOYMENT_LOG.md updated
4. ✅ Test migrations locally before production
5. ✅ One file = one change = one migration

---

## 🆘 STILL CONFUSED?

### **Quick Decision Tree:**

```
Does points_history table exist?
    ├── NO → Run full migration (POINTS_AND_LEADERBOARD.sql)
    └── YES → Does it have points_earned column?
        ├── NO → Run fix_points_history.sql
        └── YES → Check triggers/functions
```

### **Can't tell what's deployed?**

Run this mega-check:

```sql
-- Show ALL tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Show ALL functions
SELECT proname FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
ORDER BY proname;

-- Show ALL triggers  
SELECT trigger_name, event_object_table 
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

Compare results to what should exist according to your SQL files.

---

## ✅ SUCCESS CRITERIA

- [ ] Diagnosis complete (know what's actually in database)
- [ ] Fix applied (points_earned column now exists)
- [ ] Calculate points successful (leaderboard has real data)
- [ ] Documentation updated (know what you ran)
- [ ] Files organized (no more duplicates confusion)

---

**Start with the diagnosis queries above → Fill in the checklist → Apply the right fix!**

**Last Updated:** February 17, 2026
