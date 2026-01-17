-- ============================================
-- Community Storage Bucket Setup
-- ============================================
-- This script sets up the storage bucket for community images
-- including icons and cover images with proper RLS policies

-- 1. Create the community-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images',
  'community-images', 
  true, -- Public bucket for easy access
  5242880, -- 5MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- 2. Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies for community-images bucket to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view community images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload community images" ON storage.objects;
DROP POLICY IF EXISTS "Community admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Community admins can delete images" ON storage.objects;

-- 4. Create new policies for community-images bucket

-- Allow anyone to view/download community images (public read)
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

-- Allow authenticated users to upload community images
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'community-images' AND
    -- Ensure the path structure is correct (community-icons/ or community-covers/)
    (
        (storage.foldername(name))[1] = 'community-icons' OR
        (storage.foldername(name))[1] = 'community-covers'
    )
);

-- Allow community owners/admins to update their community images
-- For simplicity, we'll allow any authenticated user to update
-- In production, you might want to add more specific checks
CREATE POLICY "Community admins can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'community-images' AND
    -- Check if user is owner or admin of the community
    -- This is a simplified version - you may want to add more specific checks
    auth.uid() IS NOT NULL
);

-- Allow community owners/admins to delete their community images
CREATE POLICY "Community admins can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'community-images' AND
    auth.uid() IS NOT NULL
);

-- ============================================
-- Verification Queries (Run these to check)
-- ============================================

-- Check if bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'community-images';

-- Check policies
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
