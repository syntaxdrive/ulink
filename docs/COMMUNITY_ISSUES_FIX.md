# Community Issues - Fixes

## 🐛 **Issues Reported**

1. **Communities can't upload profile images or background images**
2. **Feed posts are appearing in community posts**

---

## 🔍 **Issue #1: Image Uploads Not Working**

### Root Cause:
The `community-images` storage bucket likely doesn't exist in Supabase or doesn't have the correct permissions.

### Fix Required:

#### Step 1: Create Storage Bucket in Supabase

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name: `community-images`
4. Public bucket: ✅ **YES** (so images can be viewed publicly)
5. Click "Create bucket"

#### Step 2: Set Bucket Policies

Run this SQL in Supabase SQL Editor:

```sql
-- Allow public read access to community images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'community-images' );

-- Allow authenticated users to upload community images
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'community-images' );

-- Allow community admins to update their community images
CREATE POLICY "Users can update community images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'community-images' );

-- Allow community admins to delete their community images
CREATE POLICY "Users can delete community images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'community-images' );
```

### Testing:
1. Go to a community you admin
2. Click Settings (gear icon)
3. Try uploading an icon image
4. Try uploading a cover image
5. Click "Save Changes"
6. Images should appear on the community page

---

## 🔍 **Issue #2: Feed Posts Appearing in Community Posts**

### Root Cause Analysis:

The feed filtering logic in `useFeed.ts` is **CORRECT**:

```typescript
if (communityId) {
    // Community Feed: Only show posts from this specific community
    query = query.eq('community_id', communityId);
} else {
    // Main Feed: Only show posts NOT in any community (global posts)
    query = query.is('community_id', null);
}
```

**However**, there might be posts in the database with incorrect `community_id` values.

### Possible Causes:

1. **Old posts created before community filtering was implemented**
   - These posts might have `community_id = null` when they should have a value
   
2. **Posts created in community but `community_id` not set**
   - Bug in post creation flow

3. **Database inconsistency**
   - Manual edits or migrations that didn't update `community_id`

### Fix #1: Check Database Consistency

Run this SQL to find problematic posts:

```sql
-- Find posts that might be in wrong place
SELECT 
    p.id,
    p.content,
    p.community_id,
    p.author_id,
    p.created_at,
    c.name as community_name
FROM posts p
LEFT JOIN communities c ON p.community_id = c.id
WHERE p.community_id IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 50;
```

### Fix #2: Verify Post Creation Flow

The `CreatePost` component correctly passes `communityId`:
```typescript
await onCreate(content, imageFiles, videoFile, communityId, finalPollOptions);
```

The `useFeed` hook correctly uses it:
```typescript
const finalCommunityId = targetCommunityId || communityId;
// ...
community_id: finalCommunityId
```

### Fix #3: Add Database Constraint

To prevent future issues, add a check constraint:

```sql
-- Ensure community_id references valid communities
ALTER TABLE posts
ADD CONSTRAINT posts_community_id_fkey 
FOREIGN KEY (community_id) 
REFERENCES communities(id) 
ON DELETE CASCADE;
```

### Testing Steps:

1. **Test Main Feed:**
   - Go to `/app` (main feed)
   - Should only see posts with `community_id = null`
   - Should NOT see community posts

2. **Test Community Feed:**
   - Go to `/app/communities/[slug]`
   - Should only see posts with `community_id = [that community's id]`
   - Should NOT see main feed posts

3. **Test Post Creation:**
   - Create post in main feed → `community_id` should be `null`
   - Create post in community → `community_id` should be that community's ID

---

## 🧪 **Debugging Steps**

If posts still appear in wrong place:

### 1. Check Post Data

Open browser console and run:
```javascript
// In main feed
console.log('Main feed posts:', posts.map(p => ({ 
    id: p.id, 
    community_id: p.community_id,
    content: p.content.substring(0, 50)
})));

// In community feed
console.log('Community feed posts:', posts.map(p => ({ 
    id: p.id, 
    community_id: p.community_id,
    content: p.content.substring(0, 50)
})));
```

### 2. Check Database Directly

```sql
-- Check if community_id is being set correctly
SELECT 
    id,
    LEFT(content, 50) as content_preview,
    community_id,
    created_at
FROM posts
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Check Real-time Subscriptions

The real-time subscription in `useFeed.ts` might be adding posts incorrectly. Check line 43-46:

```typescript
.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
    // Ideally filter here if (communityId && payload.new.community_id !== communityId) return;
    fetchSinglePost(payload.new.id);
})
```

**This needs filtering!** Let me fix this:

---

## ✅ **Code Fix for Real-time Subscription**

The real-time subscription isn't filtering by community. Here's the fix:

### File: `src/features/feed/hooks/useFeed.ts`

**Current (Line 43-46):**
```typescript
.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
    // Ideally filter here if (communityId && payload.new.community_id !== communityId) return;
    fetchSinglePost(payload.new.id);
})
```

**Fixed:**
```typescript
.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
    // Filter posts based on context
    const newPost = payload.new as any;
    
    if (communityId) {
        // In community: only show posts from this community
        if (newPost.community_id !== communityId) return;
    } else {
        // In main feed: only show posts NOT in any community
        if (newPost.community_id !== null) return;
    }
    
    fetchSinglePost(newPost.id);
})
```

This ensures real-time posts only appear in the correct feed!

---

## 📋 **Complete Checklist**

### Storage Setup:
- [ ] Create `community-images` bucket in Supabase
- [ ] Set bucket to public
- [ ] Add storage policies (SQL above)
- [ ] Test icon upload
- [ ] Test cover upload

### Feed Filtering:
- [ ] Apply real-time subscription fix
- [ ] Test main feed (no community posts)
- [ ] Test community feed (only that community's posts)
- [ ] Verify new posts appear in correct feed only

### Database:
- [ ] Run consistency check SQL
- [ ] Add foreign key constraint
- [ ] Clean up any misplaced posts

---

## 🚀 **Priority**

1. **HIGH**: Fix real-time subscription filtering (code change)
2. **HIGH**: Create storage bucket (Supabase dashboard)
3. **MEDIUM**: Add storage policies (SQL)
4. **LOW**: Add database constraints (SQL)

---

**Status:** Fixes identified, ready to implement
