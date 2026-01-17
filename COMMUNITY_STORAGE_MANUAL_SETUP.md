# Community Storage Setup - Manual Steps

If you're getting permission errors with the SQL script, follow these manual steps in the Supabase Dashboard:

## Option 1: Create Bucket via Dashboard (Easiest)

1. **Go to Supabase Dashboard** → **Storage**

2. **Click "New bucket"**

3. **Fill in the form:**
   - **Name:** `community-images`
   - **Public bucket:** ✓ (checked)
   - **File size limit:** `5242880` (5MB in bytes)
   - **Allowed MIME types:** 
     ```
     image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml
     ```

4. **Click "Create bucket"**

5. **Set up policies:**
   - Click on the `community-images` bucket
   - Go to "Policies" tab
   - Click "New policy"
   
   **Policy 1: Public Read**
   - Policy name: `Public read access`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - USING expression: `bucket_id = 'community-images'`
   - Click "Save"
   
   **Policy 2: Authenticated Upload**
   - Click "New policy" again
   - Policy name: `Authenticated upload`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression: `bucket_id = 'community-images'`
   - Click "Save"
   
   **Policy 3: Authenticated Update**
   - Click "New policy" again
   - Policy name: `Authenticated update`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'community-images'`
   - Click "Save"
   
   **Policy 4: Authenticated Delete**
   - Click "New policy" again
   - Policy name: `Authenticated delete`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'community-images'`
   - Click "Save"

## Option 2: Simplified SQL (If Dashboard doesn't work)

If you prefer SQL, run this simplified version in Supabase SQL Editor:

```sql
-- Just create the bucket (policies can be added via Dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images',
  'community-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;
```

Then add policies via the Dashboard as described in Option 1, step 5.

## Verification

After setup, verify it works:

1. **Check bucket exists:**
   - Go to Storage in Supabase Dashboard
   - You should see `community-images` bucket

2. **Check policies:**
   - Click on the bucket
   - Go to "Policies" tab
   - You should see 4 policies (read, upload, update, delete)

3. **Test in app:**
   - Try creating a community with an icon/cover image
   - Images should upload successfully

## Troubleshooting

**Error: "Bucket already exists"**
- That's fine! The bucket is already created
- Just set up the policies via Dashboard

**Error: "Permission denied"**
- Make sure you're logged in as the project owner
- Try using the Dashboard UI instead of SQL

**Images not uploading**
- Check that policies are created
- Check browser console for specific error
- Verify bucket is set to "public"

## Why This Approach?

The `storage.objects` table has special permissions in Supabase. Instead of trying to modify it directly with SQL (which requires owner permissions), we:

1. Create the bucket via INSERT (which works)
2. Add policies via Dashboard UI (which has proper permissions)

This avoids the "must be owner of table objects" error.

---

**Recommended:** Use Option 1 (Dashboard UI) - it's the easiest and most reliable method!
