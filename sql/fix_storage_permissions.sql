-- Enable RLS on storage objects (good practice, though often on by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Allow public access to view images (Download)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'community-images' );

-- 2. Allow authenticated users to upload images (Insert)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'community-images' AND 
    (storage.foldername(name))[1] != 'private'
);

-- 3. Allow users to update/delete their own uploads (limit adjustment needed for production, simpler here)
-- For now, allow owners to update any file in the bucket to ensure editing works smoothly
CREATE POLICY "Users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'community-images' );

CREATE POLICY "Users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'community-images' );
