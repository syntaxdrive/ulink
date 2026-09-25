# WHICH SQL FILE SHOULD I RUN? - Decision Tree

## 🎯 START HERE

**You're confused because you have duplicate/similar SQL files and don't know which is correct.**

**Solution:** Run diagnostic → Follow decision tree → Execute correct file

---

## 📋 STEP 1: RUN DIAGNOSTIC (30 seconds)

1. Open Supabase Dashboard → SQL Editor
2. Copy/paste entire contents of: **`sql/DIAGNOSE_DATABASE_STATE.sql`**
3. Click "Run"
4. Look at results below ↓

---

## 🌳 STEP 2: FOLLOW DECISION TREE

### **Question 1: Does `points_history` table exist?**

Look at first query result:
- ✅ **"points_history table EXISTS"** → Go to Question 2
- ❌ **"points_history table DOES NOT EXIST"** → Go to Solution A

---

### **Question 2: Does `points_earned` column exist?**

Look at second query results (column list):

```
Do you see these two columns?
├── points_earned
└── reference_id
```

- ✅ **YES, both exist** → Go to Question 3  
- ❌ **NO, one or both missing** → Go to Solution B

---

### **Question 3: Do points functions exist?**

Look at queries 5 & 6 results:

```
✅ award_points() function EXISTS
✅ get_leaderboard() function EXISTS
```

- ✅ **Both exist** → Go to Question 4
- ❌ **One or both missing** → Go to Solution C

---

### **Question 4: Do users have points?**

Look at query 4 results:

```
users_with_points: [some number]
max_points: [some number > 0]
```

- ✅ **Yes, there are points** → Go to Solution D
- ❌ **No points (all zeros)** → Go to Solution E

---

## 🔧 SOLUTIONS

### **Solution A: Table Doesn't Exist → Run Full Migration**

**File to run:** `supabase/migrations/20260216_points_and_leaderboard.sql`

**Why:** You need the complete points system setup

**How:**
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste ENTIRE file contents
3. Run
4. Proceed to Solution E (calculate points)

**Then create migration record:**
```bash
supabase db push
```

---

### **Solution B: Missing Columns → Run Fix Script** ← **MOST LIKELY FOR YOU**

**File to run:** `sql/fix_points_history.sql`

**Why:** Table was created without those columns (maybe old version)

**How:**
1. Open Supabase Dashboard → SQL Editor  
2. Copy/paste contents of `sql/fix_points_history.sql`
3. Run
4. Verify:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'points_history';
   ```
5. Should now see `points_earned` and `reference_id`
6. Proceed to Solution E (calculate points)

---

### **Solution C: Missing Functions → Re-run Migration**

**File to run:** `supabase/migrations/20260216_points_and_leaderboard.sql`

**Why:** Migration was incomplete or functions were dropped

**How:**
1. Same as Solution A
2. The file has `CREATE OR REPLACE FUNCTION` so safe to re-run

---

### **Solution D: Everything Works! 🎉**

**File to run:** Nothing!

**Status:** Your points system is fully operational

**Verify:**
- Check leaderboard in app
- Points should display correctly
- If you see zeros, see Solution E

---

### **Solution E: Calculate Historical Points**

**File to run:** `sql/calculate_historical_points.sql`

**Why:** Database is set up but no points calculated from existing activity

**How:**
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste contents of `sql/calculate_historical_points.sql`
3. Run
4. Watch output - will show points being calculated per user
5. Check leaderboard - should now show real points!

**Note:** This is a **ONE-TIME** script. Don't run multiple times (will count activity twice).

---

## 📊 QUICK REFERENCE TABLE

| Symptom | Diagnostic Result | Solution | File to Run |
|---------|------------------|----------|-------------|
| Error: "column points_earned does not exist" | Missing columns in points_history | B | `fix_points_history.sql` |
| Error: "relation points_history does not exist" | Table doesn't exist | A | `20260216_points_and_leaderboard.sql` |
| Leaderboard shows all zeros | No points calculated | E | `calculate_historical_points.sql` |
| Error: "function award_points does not exist" | Missing functions | C | `20260216_points_and_leaderboard.sql` |
| Everything shows errors | Nothing deployed | A → E | Run in order |

---

## 🎯 MOST LIKELY PATH (Based on Your Error)

```
Your error: "column points_earned does not exist"

Decision Tree:
├── Q1: Table exists? → YES (error mentions the table)
├── Q2: points_earned exists? → NO (that's the error)
└── Solution: B

Action:
1. Run DIAGNOSE_DATABASE_STATE.sql to confirm
2. Run fix_points_history.sql 
3. Run calculate_historical_points.sql
4. Check leaderboard
5. Done! ✅
```

---

## 🚨 COMMON MISTAKES TO AVOID

### **Mistake 1: Running Wrong File**
❌ Running `POINTS_AND_LEADERBOARD.sql` when you only need `fix_points_history.sql`
- Wastes time
- Might cause conflicts
- Unnecessary

### **Mistake 2: Running calculate_historical_points.sql Multiple Times**
❌ Will count activity multiple times
- Users get inflated points
- Leaderboard becomes inaccurate
- Hard to fix

### **Mistake 3: Not Verifying After Each Step**
❌ Running multiple scripts without checking results
- Can't pinpoint which one failed
- Creates more confusion

### **Mistake 4: Running Files in Wrong Order**  
❌ Trying to calculate points before fixing table structure
- Will fail with same error
- No progress made

---

## ✅ CORRECT WORKFLOW

```
1. Run DIAGNOSE_DATABASE_STATE.sql
   ↓
2. Read results carefully
   ↓
3. Follow decision tree exactly
   ↓
4. Run ONLY the file(s) indicated
   ↓
5. Verify EACH step worked
   ↓
6. Move to next step only if current step succeeded
   ↓
7. Document what you did in DEPLOYMENT_LOG.md
```

---

## 🗂️ FILE STATUS GUIDE

### **Active Files (Use These):**

| File | Purpose | When to Run |
|------|---------|-------------|
| `DIAGNOSE_DATABASE_STATE.sql` | Check current state | Always first |
| `fix_points_history.sql` | Add missing columns | If diagnosis shows missing columns |
| `calculate_historical_points.sql` | Populate points | After structure is correct |
| `20260216_points_and_leaderboard.sql` | Full setup | If nothing exists |

### **Reference Files (Don't Run):**

| File | Status | Action |
|------|--------|--------|
| `sql/POINTS_AND_LEADERBOARD.sql` | Duplicate of migration | Archive it |
| `update_storage_limits_10mb.sql` | Wrong system (using Cloudinary) | Ignore |

---

## 📞 STILL CONFUSED?

### **Copy/paste this into your terminal:**

```bash
# Windows PowerShell
cd c:\Users\User\Desktop\ulink\ulink

# Show me what's in my sql folder
dir sql\*point*

# Expected output:
#   calculate_historical_points.sql   ← Use for step 3
#   fix_points_history.sql            ← Use for step 2  
#   POINTS_AND_LEADERBOARD.sql        ← Reference only
```

### **Or run this in Supabase SQL Editor:**

```sql
-- One command to show everything
SELECT 
    'Table exists: ' || 
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'points_history') 
    THEN 'YES' ELSE 'NO' END as status
UNION ALL
SELECT 
    'points_earned column exists: ' ||
    CASE WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'points_history' AND column_name = 'points_earned')
    THEN 'YES' ELSE 'NO' END
UNION ALL  
SELECT
    'Users with points: ' || COUNT(*)::TEXT
FROM profiles WHERE points > 0;
```

Results will tell you exactly which solution path to take.

---

## 🎉 SUCCESS CHECKLIST

- [ ] Ran DIAGNOSE_DATABASE_STATE.sql
- [ ] Identified which solution applies
- [ ] Ran ONLY the correct file(s)
- [ ] Verified each step worked
- [ ] Leaderboard now shows real points
- [ ] Documented what I did
- [ ] Archived/organized SQL files

---

**You got this! Start with the diagnostic and follow the tree. No guessing needed.** 🌳

**Last Updated:** February 17, 2026
