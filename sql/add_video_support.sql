-- Add video_url column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- update RLS or policies if needed (usually public read is fine for posts)
-- Ensure storage bucket 'post-images' allows video mime types if it restricts them
-- (Assuming standard public bucket setup)
