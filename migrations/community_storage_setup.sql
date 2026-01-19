-- Community Images Storage Setup
-- Run this in Supabase SQL Editor AFTER creating the 'community-images' bucket

-- Step 1: First create the bucket in Supabase Dashboard:
-- 1. Go to Storage → Create bucket
-- 2. Name: community-images
-- 3. Public: YES
-- 4. Click Create

-- Step 2: Then run this SQL to set up policies:

-- Allow public read access to community images
CREATE POLICY "Public can view community images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'community-images' );

-- Allow authenticated users to upload community images
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'community-images' );

-- Allow users to update community images
CREATE POLICY "Authenticated users can update community images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'community-images' );

-- Allow users to delete community images
CREATE POLICY "Authenticated users can delete community images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'community-images' );

-- Step 3: Add foreign key constraint to posts table (optional but recommended)
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_community_id_fkey;

ALTER TABLE posts
ADD CONSTRAINT posts_community_id_fkey 
FOREIGN KEY (community_id) 
REFERENCES communities(id) 
ON DELETE CASCADE;

-- Success message
SELECT 'Community storage setup complete!' as message;
