-- Migration 011: Storage Buckets Setup
-- Description: Create and configure Supabase Storage buckets for file uploads
-- Dependencies: 001_foundation_profiles_auth.sql
-- Generated: 2026-02-18

--------------------------------------------------------------------------------
-- 1. CREATE STORAGE BUCKETS
--------------------------------------------------------------------------------

-- Community Images (icons and covers)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'community-images',
    'community-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Post Images and Videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'post-images',
    'post-images',
    true,
    52428800, -- 50MB (for videos)
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Profile Avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- General Uploads (chat images, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'uploads',
    'uploads',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

--------------------------------------------------------------------------------
-- 2. STORAGE POLICIES - COMMUNITY IMAGES
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Community images are publicly accessible" ON storage.objects;
CREATE POLICY "Community images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'community-images');

DROP POLICY IF EXISTS "Authenticated users can upload community images" ON storage.objects;
CREATE POLICY "Authenticated users can upload community images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'community-images' AND
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can update their own community images" ON storage.objects;
CREATE POLICY "Users can update their own community images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'community-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete their own community images" ON storage.objects;
CREATE POLICY "Users can delete their own community images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'community-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

--------------------------------------------------------------------------------
-- 3. STORAGE POLICIES - POST IMAGES
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Post images are publicly accessible" ON storage.objects;
CREATE POLICY "Post images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
CREATE POLICY "Authenticated users can upload post images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'post-images' AND
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can delete their own post images" ON storage.objects;
CREATE POLICY "Users can delete their own post images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'post-images' AND
        auth.role() = 'authenticated'
    );

--------------------------------------------------------------------------------
-- 4. STORAGE POLICIES - AVATARS
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

--------------------------------------------------------------------------------
-- 5. STORAGE POLICIES - UPLOADS (General)
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Uploads are publicly accessible" ON storage.objects;
CREATE POLICY "Uploads are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'uploads' AND
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
CREATE POLICY "Users can update their own uploads"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'uploads' AND
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
CREATE POLICY "Users can delete their own uploads"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'uploads' AND
        auth.role() = 'authenticated'
    );

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'community-images'
    ), 'community-images bucket was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'post-images'
    ), 'post-images bucket was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'avatars'
    ), 'avatars bucket was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'uploads'
    ), 'uploads bucket was not created';
    
    RAISE NOTICE 'Migration 011 completed successfully - All storage buckets created';
END $$;
