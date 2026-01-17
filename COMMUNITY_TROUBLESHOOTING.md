# Community Feature Troubleshooting Guide

## 🔍 Common Issues and Solutions

This guide helps you diagnose and fix common issues with the community feature.

---

## Issue 1: "Storage bucket not found" Error

### Symptoms
- Error when trying to upload icon or cover image
- Console shows: `StorageApiError: Bucket not found`

### Diagnosis
```sql
-- Run in Supabase SQL Editor
SELECT * FROM storage.buckets WHERE id = 'community-images';
```

If this returns no rows, the bucket doesn't exist.

### Solution
1. Run the entire `sql/setup_community_storage.sql` file in Supabase SQL Editor
2. Verify the bucket was created:
   ```sql
   SELECT id, name, public FROM storage.buckets WHERE id = 'community-images';
   ```
3. Expected result: One row with `id = 'community-images'`, `public = true`

### Alternative Manual Fix
1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `community-images`
4. Public: ✓ (checked)
5. File size limit: 5242880 (5MB)
6. Allowed MIME types: `image/jpeg,image/jpg,image/png,image/gif,image/webp`
7. Click "Create bucket"

---

## Issue 2: "Permission denied" on Image Upload

### Symptoms
- Image upload fails with permission error
- Console shows: `StorageApiError: new row violates row-level security policy`

### Diagnosis
```sql
-- Check storage policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%community%';
```

If no policies are returned, they don't exist.

### Solution
Run the storage policy section from `sql/setup_community_storage.sql`:

```sql
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'community-images' AND
    (
        (storage.foldername(name))[1] = 'community-icons' OR
        (storage.foldername(name))[1] = 'community-covers'
    )
);

CREATE POLICY "Community admins can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'community-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Community admins can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community-images' AND auth.uid() IS NOT NULL);
```

---

## Issue 3: Creator Not Added as Owner

### Symptoms
- Community is created but creator cannot edit it
- Member count shows 0 instead of 1
- Settings button doesn't appear for creator

### Diagnosis
```sql
-- Check if trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'communities'
AND trigger_schema = 'public';
```

If no trigger is returned, it doesn't exist.

### Solution
Run the trigger creation from `sql/create_communities_schema.sql`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_community() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.community_members (community_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_community_created ON public.communities;
CREATE TRIGGER on_community_created
    AFTER INSERT ON public.communities
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_community();
```

### Verify Fix
```sql
-- Create a test community and check
SELECT 
    c.name,
    cm.user_id,
    cm.role
FROM communities c
JOIN community_members cm ON c.id = cm.community_id
WHERE c.slug = 'your-test-community-slug';
```

---

## Issue 4: "Duplicate Slug" Error

### Symptoms
- Error when creating community: "This community URL identifier is already taken"
- Even with unique name

### Diagnosis
```sql
-- Check existing slugs
SELECT slug, name FROM communities ORDER BY created_at DESC;
```

### Solution
1. **Manual**: Edit the slug in the create modal before submitting
2. **Code Fix**: The auto-generation might create conflicts. Try adding more randomness:

```typescript
// In CreateCommunityModal.tsx
const handleNameChange = (val: string) => {
    setName(val);
    const baseSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    // Add random suffix if needed
    setSlug(baseSlug);
};
```

---

## Issue 5: Images Not Displaying

### Symptoms
- Community created successfully but icon/cover don't show
- Broken image icon appears

### Diagnosis
1. Check browser console for 404 errors
2. Check if URLs are correct:
   ```sql
   SELECT slug, icon_url, cover_image_url FROM communities WHERE slug = 'your-slug';
   ```
3. Try accessing the URL directly in browser

### Solution

**If URL is null:**
- Upload failed silently
- Check storage bucket exists
- Check storage policies

**If URL exists but 404:**
- File wasn't actually uploaded
- Check storage bucket in Supabase Dashboard
- Look for files in `community-icons/` and `community-covers/` folders

**If URL is wrong format:**
- Should be: `https://[project-ref].supabase.co/storage/v1/object/public/community-images/community-icons/[filename]`
- If different, check `getPublicUrl()` call

---

## Issue 6: Cannot Join Public Community

### Symptoms
- "Join Group" button doesn't work
- No error message shown
- Button doesn't change to "Joined"

### Diagnosis
```sql
-- Check RLS policy for community_members
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'community_members'
AND cmd = 'INSERT';
```

### Solution
Ensure the join policy exists:

```sql
CREATE POLICY "Users can join public communities" 
ON public.community_members FOR INSERT 
TO authenticated 
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.communities 
        WHERE id = community_id AND privacy = 'public'
    )
);
```

---

## Issue 7: Private Community Visible to Non-Members

### Symptoms
- Private communities appear in search results
- Non-members can access private community pages

### Diagnosis
```sql
-- Check RLS policy for communities
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'communities'
AND cmd = 'SELECT';
```

### Solution
Ensure the view policy is correct:

```sql
CREATE POLICY "Communities are viewable by everyone" 
ON public.communities FOR SELECT 
USING (privacy = 'public' OR (
    privacy = 'private' AND EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = communities.id AND user_id = auth.uid()
    )
));
```

---

## Issue 8: Member Count Incorrect

### Symptoms
- Member count shows wrong number
- Count doesn't update after join/leave

### Diagnosis
```sql
-- Check actual member count vs displayed
SELECT 
    c.slug,
    c.name,
    (SELECT COUNT(*) FROM community_members WHERE community_id = c.id) as actual_count
FROM communities c
WHERE c.slug = 'your-slug';
```

### Solution
The count is computed on each query. If it's wrong:

1. **Check for orphaned members:**
   ```sql
   SELECT cm.* 
   FROM community_members cm
   LEFT JOIN communities c ON cm.community_id = c.id
   WHERE c.id IS NULL;
   ```

2. **Delete orphaned members:**
   ```sql
   DELETE FROM community_members
   WHERE community_id NOT IN (SELECT id FROM communities);
   ```

3. **Refresh the page** - the count is fetched fresh each time

---

## Issue 9: Cannot Post in Community

### Symptoms
- "Create Post" button doesn't appear
- Posts don't show up in community feed

### Diagnosis
1. Check if user is a member:
   ```sql
   SELECT * FROM community_members 
   WHERE community_id = 'community-uuid' 
   AND user_id = 'user-uuid';
   ```

2. Check if posts table has community_id column:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'posts' AND column_name = 'community_id';
   ```

### Solution

**If not a member:**
- Join the community first

**If column doesn't exist:**
```sql
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);
```

---

## Issue 10: Community Posts Appear in Main Feed

### Symptoms
- Posts created in communities show up in main feed
- Main feed shows all posts instead of just global ones

### Diagnosis
Check the feed query logic in `useFeed.ts`:

```typescript
if (communityId) {
    query = query.eq('community_id', communityId);
} else {
    query = query.is('community_id', null);
}
```

### Solution
This is correct behavior. Main feed should only show posts where `community_id IS NULL`.

If posts still appear:
1. Check the post was created with correct `community_id`
2. Check browser console for errors
3. Try refreshing the page
4. Check the `useFeed` hook is being called correctly

---

## Issue 11: File Size Validation Not Working

### Symptoms
- Large files (>5MB) are accepted
- No error message shown

### Diagnosis
Check if validation function exists in `CreateCommunityModal.tsx`

### Solution
The validation was added in the recent update. If missing, add:

```typescript
const validateImageFile = (file: File, type: 'icon' | 'cover'): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
        return `${type === 'icon' ? 'Icon' : 'Cover'} image must be less than 5MB`;
    }

    if (!allowedTypes.includes(file.type)) {
        return `${type === 'icon' ? 'Icon' : 'Cover'} must be a valid image`;
    }

    return null;
};
```

---

## Issue 12: Search Not Working

### Symptoms
- Typing in search box doesn't filter communities
- All communities still show

### Diagnosis
Check `CommunitiesPage.tsx` filter logic:

```typescript
const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### Solution
This should work. If not:
1. Check `searchQuery` state is updating
2. Check `filteredCommunities` is being used in the render
3. Check for JavaScript errors in console

---

## Debugging Checklist

When encountering any issue:

- [ ] Check browser console for JavaScript errors
- [ ] Check Network tab for failed API requests
- [ ] Check Supabase logs for database errors
- [ ] Verify user is authenticated
- [ ] Check RLS policies are in place
- [ ] Verify storage bucket exists
- [ ] Check triggers are enabled
- [ ] Clear browser cache and cookies
- [ ] Try in incognito/private mode
- [ ] Check `.env` file has correct credentials
- [ ] Restart development server

---

## SQL Debugging Queries

### Check Everything
```sql
-- Tables exist?
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('communities', 'community_members');

-- RLS enabled?
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('communities', 'community_members');

-- Policies exist?
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('communities', 'community_members');

-- Triggers exist?
SELECT trigger_name, event_object_table FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'communities';

-- Storage bucket exists?
SELECT * FROM storage.buckets WHERE id = 'community-images';

-- Storage policies exist?
SELECT policyname FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%community%';
```

---

## Getting Help

If you're still stuck after trying these solutions:

1. **Check the logs:**
   - Browser console (F12)
   - Supabase Dashboard → Logs
   - Network tab for API calls

2. **Gather information:**
   - What were you trying to do?
   - What happened instead?
   - Any error messages?
   - Screenshots if possible

3. **Review documentation:**
   - `COMMUNITY_FEATURE_RESEARCH.md` - Detailed documentation
   - `COMMUNITY_QUICK_FIX.md` - Quick start guide
   - `COMMUNITY_ARCHITECTURE.md` - System architecture

4. **Test in isolation:**
   - Create a minimal test case
   - Try with a fresh community
   - Test with different user accounts

---

## Prevention Tips

To avoid issues in the future:

1. **Always run setup scripts** before using features
2. **Test thoroughly** after any database changes
3. **Keep backups** of working configurations
4. **Document changes** you make
5. **Use version control** (git) for code changes
6. **Monitor logs** regularly
7. **Validate user input** on frontend and backend
8. **Handle errors gracefully** with user-friendly messages

---

**Last Updated**: 2026-01-17
**Version**: 1.0
