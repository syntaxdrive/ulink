# How to Enable Repost Feature

## The Error You're Seeing

```
Error creating repost: Object
Failed to load resource: the server responded with a status of 400
```

This means the database columns for the repost feature don't exist yet.

## Quick Fix (2 Steps)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration
Copy and paste this SQL:

```sql
-- Add repost columns to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS repost_comment TEXT,
ADD COLUMN IF NOT EXISTS reposts_count INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_original_post_id ON posts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_repost ON posts(is_repost);

-- Update existing posts
UPDATE posts SET reposts_count = 0 WHERE reposts_count IS NULL;
```

Click **Run** (or press Ctrl+Enter)

### Step 3: Test
1. Refresh your app
2. Click the repost button (green 🔁 icon)
3. Choose "Repost" or "Quote Repost"
4. It should work now! ✅

## Alternative: Use the Migration File

I've created a migration file at:
```
migrations/repost_feature.sql
```

You can copy the contents and paste into Supabase SQL Editor.

## What These Columns Do

- `is_repost`: Marks if a post is a repost
- `original_post_id`: Links to the original post
- `repost_comment`: Stores user's comment for quote reposts
- `reposts_count`: Counts how many times a post has been reposted

## Troubleshooting

**If you still get errors:**
1. Make sure you're running the SQL in the correct Supabase project
2. Check that you have permission to alter tables
3. Try refreshing the app after running the migration

**If it says "column already exists":**
- That's fine! The `IF NOT EXISTS` clause prevents errors
- The migration is safe to run multiple times

## Need Help?

The error message will now tell you if the database migration is needed:
```
"Repost feature requires database migration. Please run the SQL migration from REPOST_FEATURE.md"
```
