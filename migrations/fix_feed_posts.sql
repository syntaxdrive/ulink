-- Fix Feed Posts - Clean Up Misplaced Posts
-- This will ensure posts are in the correct feeds

-- Option 1: Move all community posts to main feed (if you want everything in main feed)
/*
UPDATE posts 
SET community_id = NULL 
WHERE community_id IS NOT NULL;

SELECT 'Moved all posts to main feed' as result;
*/

-- Option 2: Delete all community posts (if you want to start fresh)
/*
DELETE FROM posts WHERE community_id IS NOT NULL;

SELECT 'Deleted all community posts' as result;
*/

-- Option 3: Just show what would be affected (SAFE - run this first)
SELECT 
    '🔍 Posts that would be moved/deleted' as info,
    COUNT(*) as count,
    community_id
FROM posts
WHERE community_id IS NOT NULL
GROUP BY community_id;

-- After deciding, uncomment ONE of the options above and run again
