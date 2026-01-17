-- ⚠️ WARNING: THIS WILL DELETE DATA ⚠️
-- Use this script to manually delete communities

-- Option 1: Delete ALL communities (Reset)
-- DELETE FROM public.communities;

-- Option 2: Delete a specific community by slug
-- DELETE FROM public.communities WHERE slug = 'example-community-slug';

-- Option 3: Delete communities created by a specific user (You)
-- DELETE FROM public.communities WHERE created_by = 'user_uuid_here';

-- To just test without creating a file, you can run:
-- DELETE FROM public.communities WHERE slug = 'test-community';

-- Note: All related posts, members, and images (db references) will be deleted automatically due to ON DELETE CASCADE.
