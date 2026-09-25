-- ============================================================================
-- Migration: Comment Replies and Comment Likes
-- Adds parent_id, reply_to_username, and likes_count to public.comments
-- Creates public.comment_likes table with RLS
-- ============================================================================

-- 1. Extend public.comments table
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS reply_to_username TEXT,
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0 NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- 2. Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON public.comment_likes(user_id);

-- 3. Row Level Security for comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view comment likes" ON public.comment_likes;
CREATE POLICY "Public can view comment likes"
    ON public.comment_likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can add comment likes" ON public.comment_likes;
CREATE POLICY "Users can add comment likes"
    ON public.comment_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove comment likes" ON public.comment_likes;
CREATE POLICY "Users can remove comment likes"
    ON public.comment_likes FOR DELETE
    USING (auth.uid() = user_id);
