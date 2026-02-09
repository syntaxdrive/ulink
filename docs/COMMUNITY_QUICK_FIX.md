# Quick Fix: Community Issues

## ✅ **Issue #1: Feed Posts in Communities - FIXED!**

### What was wrong:
Real-time subscriptions weren't filtering posts by `community_id`, so when someone created a post in the main feed, it would appear in ALL community feeds in real-time.

### What I fixed:
Updated `src/features/feed/hooks/useFeed.ts` to properly filter real-time posts:
- Main feed: Only shows posts with `community_id = null`
- Community feed: Only shows posts with `community_id = [that community]`

### Test it:
1. Open main feed in one tab
2. Open a community in another tab
3. Create a post in main feed
4. ✅ Should appear in main feed only
5. Create a post in community
6. ✅ Should appear in that community only

---

## ⚠️ **Issue #2: Image Uploads - Needs Supabase Setup**

### What's wrong:
The `community-images` storage bucket doesn't exist in your Supabase project.

### How to fix (2 minutes):

#### Step 1: Create Storage Bucket
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in left sidebar
4. Click **"Create a new bucket"**
5. Enter name: `community-images`
6. Toggle **"Public bucket"** to **ON** ✅
7. Click **"Create bucket"**

#### Step 2: Set Permissions
1. Click **SQL Editor** in left sidebar
2. Click **"New Query"**
3. Copy and paste this:

```sql
-- Allow public read access
CREATE POLICY "Public can view community images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'community-images' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'community-images' );

-- Allow users to update
CREATE POLICY "Authenticated users can update community images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'community-images' );

-- Allow users to delete
CREATE POLICY "Authenticated users can delete community images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'community-images' );
```

4. Click **Run** (or press Ctrl+Enter)

#### Step 3: Test
1. Go to any community you admin
2. Click the Settings gear icon
3. Upload an icon image
4. Upload a cover image
5. Click "Save Changes"
6. ✅ Images should appear!

---

## 📁 **Files**

I've created:
- ✅ `COMMUNITY_ISSUES_FIX.md` - Detailed explanation
- ✅ `migrations/community_storage_setup.sql` - SQL to run
- ✅ Fixed `src/features/feed/hooks/useFeed.ts` - Real-time filtering

---

## 🎯 **Summary**

**Feed Filtering:** ✅ FIXED (code updated)  
**Image Uploads:** ⚠️ NEEDS SUPABASE SETUP (2 minutes)

Just create the storage bucket and run the SQL, then everything will work! 🚀
