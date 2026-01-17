-- ============================================
-- Community Feature Verification & Testing
-- ============================================
-- This script helps verify that the community feature is properly set up

-- 1. Check if communities table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'communities'
ORDER BY ordinal_position;

-- 2. Check if community_members table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'community_members'
ORDER BY ordinal_position;

-- 3. Verify RLS is enabled on both tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('communities', 'community_members');

-- 4. Check all RLS policies for communities
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'communities';

-- 5. Check all RLS policies for community_members
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'community_members';

-- 6. Verify the trigger for auto-adding creator as owner exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'communities'
AND trigger_schema = 'public';

-- 7. Check if posts table has community_id column
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'posts'
AND column_name = 'community_id';

-- 8. Verify storage bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'community-images';

-- 9. Check storage policies for community-images bucket
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%community%';

-- 10. List all existing communities (sample data check)
SELECT 
    id,
    name,
    slug,
    privacy,
    created_by,
    created_at,
    (SELECT COUNT(*) FROM community_members WHERE community_id = communities.id) as member_count
FROM communities
ORDER BY created_at DESC
LIMIT 10;

-- 11. Check for any orphaned community members (members without communities)
SELECT 
    cm.id,
    cm.user_id,
    cm.community_id,
    cm.role
FROM community_members cm
LEFT JOIN communities c ON cm.community_id = c.id
WHERE c.id IS NULL;

-- 12. Verify indexes exist for performance
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('communities', 'community_members', 'posts')
AND indexname LIKE '%community%';

-- ============================================
-- Sample Test Data (Optional - Uncomment to create test community)
-- ============================================

/*
-- Create a test community (replace USER_ID with actual user ID)
INSERT INTO communities (name, slug, description, privacy, created_by)
VALUES (
    'Test Community',
    'test-community',
    'This is a test community for verification purposes',
    'public',
    'USER_ID_HERE'
)
RETURNING *;

-- Verify the trigger added the creator as owner
SELECT * FROM community_members 
WHERE community_id = (SELECT id FROM communities WHERE slug = 'test-community')
ORDER BY joined_at DESC;
*/

-- ============================================
-- Common Issues & Fixes
-- ============================================

/*
-- If RLS is not enabled, run:
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- If storage bucket doesn't exist, run the setup_community_storage.sql script

-- If trigger doesn't exist, run the create_communities_schema.sql script
*/
