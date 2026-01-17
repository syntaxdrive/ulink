-- ============================================
-- Community Storage Bucket Setup (Simplified)
-- ============================================
-- This script sets up the storage bucket for community images
-- Run this in Supabase SQL Editor

-- 1. Create the community-images bucket if it doesn't exist
-- Note: This uses INSERT with ON CONFLICT to avoid permission issues
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

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view community images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload community images" ON storage.objects;
DROP POLICY IF EXISTS "Community admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Community admins can delete images" ON storage.objects;

-- 3. Create new policies for community-images bucket
-- These policies are created in a way that works with Supabase's permission system

-- Allow anyone to view/download community images (public read)
CREATE POLICY "community_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-images');

-- Allow authenticated users to upload community images
CREATE POLICY "community_images_authenticated_upload"
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

-- Allow authenticated users to update their uploads
CREATE POLICY "community_images_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'community-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "community_images_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community-images');

-- ============================================
-- Verification
-- ============================================

-- Check if bucket exists
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'community-images';

-- Check policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%community%';
