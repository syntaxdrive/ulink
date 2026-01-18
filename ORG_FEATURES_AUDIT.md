# Organization Features Audit & Improvements

## Current Status Check

### ✅ What's Working
1. **Job Posting** - Organizations can create job posts
2. **Job Deletion** - Delete button exists (hover over job card)
3. **Job Editing** - Update policy exists
4. **Talent Search** - Organizations can search for students

### 🔍 Issues Found & Fixes Needed

#### 1. Delete Button Visibility
**Issue:** Delete button only appears on hover (might not be obvious on mobile)
**Fix:** Make it more visible or add a menu

#### 2. No Edit Functionality
**Issue:** Organizations can't edit their job posts after creation
**Fix:** Add edit button and modal

#### 3. No Job Management Dashboard
**Issue:** Organizations can't see just their own jobs
**Fix:** Add "My Jobs" filter/tab

#### 4. Missing Features for Organizations:
- No analytics (views, applications)
- No ability to close/archive jobs
- No draft functionality
- No bulk actions

## Recommended Improvements

### Priority 1: Essential (Implement Now)
1. ✅ **Make Delete Button More Visible**
2. ✅ **Add Edit Job Functionality**
3. ✅ **Add "My Jobs" Filter**
4. ✅ **Add Job Status** (Active/Closed)

### Priority 2: Nice to Have
1. Job view counter
2. Application tracking
3. Draft jobs
4. Bulk delete

### Priority 3: Future
1. Analytics dashboard
2. Applicant management
3. Job templates
4. Scheduled posting

## Implementation Plan

### Step 1: Add Job Status Field
```sql
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed'));
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
```

### Step 2: Add Edit Modal Component
- Reuse create form logic
- Pre-fill with existing data
- Update instead of insert

### Step 3: Add My Jobs Filter
- Add tab/button for "My Jobs"
- Filter by creator_id

### Step 4: Improve Delete UX
- Add confirmation modal
- Show success message
- Add undo option (optional)

## Files to Modify

1. `src/features/jobs/JobsPage.tsx` - Main jobs page
2. `sql/add_job_status.sql` - Database migration
3. `src/types/index.ts` - Add status to Job type

## Testing Checklist

- [ ] Organizations can create jobs
- [ ] Organizations can edit their own jobs
- [ ] Organizations can delete their own jobs
- [ ] Organizations can close/reopen jobs
- [ ] Organizations can filter to see only their jobs
- [ ] Students cannot edit/delete jobs
- [ ] Delete button is visible and works
- [ ] Edit saves changes correctly
