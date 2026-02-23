-- =====================================================
-- ADD shared_to_feed TO POSTS
-- Run this in Supabase SQL Editor
-- =====================================================
-- Community posts are only visible inside their community by default.
-- When a post author clicks "Share to Feed", shared_to_feed is set to true
-- and the post appears in the main feed with a "Shared from [Community]" banner.

ALTER TABLE public.posts
    ADD COLUMN IF NOT EXISTS shared_to_feed boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_posts_shared_to_feed ON public.posts(shared_to_feed)
    WHERE shared_to_feed = true;

-- Allow post authors to update shared_to_feed on their own posts
-- (RLS policy — adjust if your existing policy already covers UPDATE)
DROP POLICY IF EXISTS "Authors can share their posts to feed" ON public.posts;
CREATE POLICY "Authors can share their posts to feed"
    ON public.posts FOR UPDATE
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);
