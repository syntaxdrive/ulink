# Quick Start: Fix Community Feature

## 🚀 Quick Fix Steps

Follow these steps in order to ensure the community feature works correctly:

### Step 1: Set Up Storage Bucket (5 minutes)

1. Open your Supabase Dashboard
2. Navigate to **Storage** section
3. Click on **SQL Editor** (or go directly to SQL Editor)
4. Copy and paste the contents of `sql/setup_community_storage.sql`
5. Click **Run**
6. Verify success message

**Alternative**: If bucket already exists, just verify it's configured correctly:
- Go to Storage → community-images
- Check that it's set to **Public**
- Check file size limit is at least **5MB**

### Step 2: Verify Database Setup (2 minutes)

1. In Supabase SQL Editor
2. Copy and paste the contents of `sql/verify_community_setup.sql`
3. Run each query section to verify:
   - ✅ Communities table exists
   - ✅ Community_members table exists
   - ✅ RLS is enabled
   - ✅ Policies are in place
   - ✅ Trigger exists
   - ✅ Storage bucket exists

### Step 3: Test Community Creation (5 minutes)

1. Start your development server: `npm run dev`
2. Navigate to `/app/communities`
3. Click **"Create Community"**
4. Fill in the form:
   - Name: "Test Community"
   - Description: "This is a test"
   - Upload an icon (optional)
   - Upload a cover image (optional)
   - Privacy: Public
5. Click **"Create Community"**
6. **Expected Result**: You should be redirected to the new community page

### Step 4: Test Join/Leave (2 minutes)

1. Open an incognito window or different browser
2. Sign in with a different account
3. Navigate to the test community
4. Click **"Join Group"**
5. **Expected**: Button changes to "Joined", member count increases
6. Click **"Joined"** to leave
7. Confirm the action
8. **Expected**: Button changes back to "Join Group"

### Step 5: Test Posting in Community (2 minutes)

1. As a member, try creating a post in the community
2. **Expected**: Post appears in community feed
3. Navigate to main feed (`/app/feed`)
4. **Expected**: Community post does NOT appear in main feed

## 🔧 Common Issues & Quick Fixes

### Issue: "Storage bucket not found"
```sql
-- Run this in Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

### Issue: "Permission denied" when uploading images
```sql
-- Run this in Supabase SQL Editor:
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-images');
```

### Issue: Creator not added as owner
```sql
-- Check if trigger exists:
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'communities';

-- If not, run create_communities_schema.sql again
```

### Issue: Cannot see private communities
This is expected behavior! Private communities are only visible to members.

### Issue: Duplicate slug error
The frontend checks for this, but if you see this error:
1. Try a different community name
2. Or manually edit the slug in the form

## 🧪 Testing Checklist

Use this checklist to verify everything works:

- [ ] Can create a public community
- [ ] Can create a private community
- [ ] Can upload icon image
- [ ] Can upload cover image
- [ ] Creator is automatically added as owner
- [ ] Member count shows correctly
- [ ] Can join a public community
- [ ] Can leave a community
- [ ] Can post in a community (as member)
- [ ] Cannot post in a community (as non-member)
- [ ] Community posts appear in community feed
- [ ] Community posts do NOT appear in main feed
- [ ] Can edit community (as owner/admin)
- [ ] Can search for communities
- [ ] Private communities not visible to non-members
- [ ] Settings button only visible to owners/admins

## 📊 Verification Queries

Run these in Supabase SQL Editor to check status:

```sql
-- Check all communities
SELECT 
    name, 
    slug, 
    privacy, 
    created_at,
    (SELECT COUNT(*) FROM community_members WHERE community_id = communities.id) as members
FROM communities
ORDER BY created_at DESC;

-- Check community members
SELECT 
    c.name as community,
    p.name as member,
    cm.role,
    cm.joined_at
FROM community_members cm
JOIN communities c ON cm.community_id = c.id
JOIN profiles p ON cm.user_id = p.id
ORDER BY cm.joined_at DESC;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'community-images';

-- Check storage policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%community%';
```

## 🎯 Success Criteria

You'll know the community feature is working when:

1. ✅ You can create communities without errors
2. ✅ Images upload successfully and display correctly
3. ✅ Join/leave functionality works smoothly
4. ✅ Posts appear in the correct feeds
5. ✅ Privacy settings are respected
6. ✅ Member counts are accurate
7. ✅ No console errors during any operation

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. Check browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify your `.env` file has correct Supabase credentials
4. Try clearing browser cache and reloading
5. Check network tab to see if API calls are failing

## 📝 Next Steps After Verification

Once everything is working:

1. **Add Error Handling**: Improve user feedback for errors
2. **Add Loading States**: Show spinners during operations
3. **Add Notifications**: Toast messages for success/error
4. **Optimize Performance**: Add pagination, caching
5. **Add Features**: Member list, invites, moderation tools

## 🔗 Related Files

- `sql/setup_community_storage.sql` - Storage bucket setup
- `sql/verify_community_setup.sql` - Verification queries
- `sql/create_communities_schema.sql` - Original schema
- `COMMUNITY_FEATURE_RESEARCH.md` - Detailed documentation
- `src/features/communities/` - Frontend components

---

**Estimated Total Time**: 15-20 minutes to complete all steps
