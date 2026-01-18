-- Add repost_of column to posts table to reference original post
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS repost_of UUID REFERENCES public.posts(id) ON DELETE SET NULL;

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_repost_of ON public.posts(repost_of);
