-- Feed Issue Diagnostic
-- Run this to see what's in your database

-- Check 1: How many posts are in each category?
SELECT 
    '📊 Post Distribution' as info,
    COUNT(CASE WHEN community_id IS NULL THEN 1 END) as main_feed_posts,
    COUNT(CASE WHEN community_id IS NOT NULL THEN 1 END) as community_posts,
    COUNT(*) as total_posts
FROM posts;

-- Check 2: Show recent posts with their community status
SELECT 
    '📝 Recent Posts' as info,
    id,
    LEFT(content, 50) as content_preview,
    community_id,
    CASE 
        WHEN community_id IS NULL THEN '✅ Main Feed'
        ELSE '🏘️ Community'
    END as location,
    created_at
FROM posts
ORDER BY created_at DESC
LIMIT 20;

-- Check 3: If you have communities, show their posts
SELECT 
    '🏘️ Community Posts Breakdown' as info,
    c.name as community_name,
    c.slug,
    COUNT(p.id) as post_count
FROM communities c
LEFT JOIN posts p ON p.community_id = c.id
GROUP BY c.id, c.name, c.slug
ORDER BY post_count DESC;

-- Check 4: Find any posts that might be in wrong place
SELECT 
    '⚠️ Potential Issues' as info,
    id,
    LEFT(content, 50) as content_preview,
    community_id,
    author_id,
    created_at
FROM posts
WHERE 
    -- Posts created recently that might be misplaced
    created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- ✅ After reviewing, you can:
-- 1. Delete all community posts and start fresh
-- 2. Move posts to correct location
-- 3. Or just delete everything and recreate
