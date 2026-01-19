-- Delete All Communities Script
-- ⚠️ WARNING: This will permanently delete ALL communities, posts, and memberships!
-- ⚠️ This action CANNOT be undone!
-- ✅ SAFE: Only deletes community data, nothing else in your app

-- Step 1: Show what will be deleted (REVIEW THIS FIRST!)
SELECT 
    '🔍 PREVIEW: What will be deleted' as info,
    c.id,
    c.name,
    c.slug,
    c.created_at,
    (SELECT COUNT(*) FROM community_members WHERE community_id = c.id) as member_count,
    (SELECT COUNT(*) FROM posts WHERE community_id = c.id) as post_count
FROM communities c
ORDER BY c.created_at DESC;

-- Step 2: Safety Check - Show what WON'T be deleted
SELECT 
    '✅ SAFE: These will NOT be deleted' as info,
    (SELECT COUNT(*) FROM posts WHERE community_id IS NULL) as main_feed_posts,
    (SELECT COUNT(*) FROM profiles) as user_profiles,
    (SELECT COUNT(*) FROM follows) as follows,
    (SELECT COUNT(*) FROM connections) as connections,
    (SELECT COUNT(*) FROM messages) as messages,
    (SELECT COUNT(*) FROM notifications) as notifications,
    (SELECT COUNT(*) FROM jobs) as jobs;

-- Step 3: Uncomment the lines below ONLY if you're sure you want to delete

/*
-- ⚠️ DELETION STARTS HERE - Only community-related data

-- Delete community posts (ONLY posts with community_id, NOT main feed posts)
DELETE FROM posts WHERE community_id IS NOT NULL;

-- Delete community memberships (ONLY community_members table)
DELETE FROM community_members;

-- Delete communities (ONLY communities table)
DELETE FROM communities;

-- ✅ VERIFICATION: Check what was deleted and what remains
SELECT 
    '✅ Deleted' as status,
    (SELECT COUNT(*) FROM communities) as remaining_communities,
    (SELECT COUNT(*) FROM community_members) as remaining_members,
    (SELECT COUNT(*) FROM posts WHERE community_id IS NOT NULL) as remaining_community_posts;

SELECT 
    '✅ Still Safe - NOT Deleted' as status,
    (SELECT COUNT(*) FROM posts WHERE community_id IS NULL) as main_feed_posts,
    (SELECT COUNT(*) FROM profiles) as user_profiles,
    (SELECT COUNT(*) FROM follows) as follows,
    (SELECT COUNT(*) FROM connections) as connections,
    (SELECT COUNT(*) FROM messages) as messages,
    (SELECT COUNT(*) FROM notifications) as notifications,
    (SELECT COUNT(*) FROM jobs) as jobs;

-- All community counts should be 0
-- All other counts should be unchanged
*/

-- ✅ After running this, you can create fresh communities with the fixed code!
