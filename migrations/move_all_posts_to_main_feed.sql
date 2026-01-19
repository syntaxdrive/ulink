-- Fix: Move All Posts to Main Feed
-- This sets community_id = NULL for all posts
-- ✅ Safe: Doesn't delete anything, just moves posts to main feed

-- Step 1: Preview what will be moved
SELECT 
    '🔍 Posts that will be moved to main feed' as info,
    COUNT(*) as total_posts_to_move,
    community_id
FROM posts
WHERE community_id IS NOT NULL
GROUP BY community_id;

-- Step 2: Uncomment to actually move the posts
/*
UPDATE posts 
SET community_id = NULL 
WHERE community_id IS NOT NULL;

-- Verify
SELECT 
    '✅ Result' as status,
    COUNT(CASE WHEN community_id IS NULL THEN 1 END) as main_feed_posts,
    COUNT(CASE WHEN community_id IS NOT NULL THEN 1 END) as community_posts
FROM posts;

-- Should show: all posts in main_feed_posts, 0 in community_posts
*/

-- ✅ After this, all posts will be in main feed only
-- You can then create new posts in communities with the fixed code
