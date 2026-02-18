-- Migration 004: Feed & Content System
-- Description: Posts, likes, comments, polls, and reposts
-- Dependencies: 001_foundation_profiles_auth.sql
-- Generated: 2026-02-17

--------------------------------------------------------------------------------
-- 1. POSTS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    image_url TEXT, -- Legacy: first image (kept for compatibility)
    image_urls TEXT[] DEFAULT array[]::text[], -- Multiple images
    video_url TEXT, -- Video support
    community_id UUID, -- Foreign key will be added in migration 005 after communities table is created
    
    -- Repost fields
    is_repost BOOLEAN DEFAULT FALSE,
    original_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    repost_comment TEXT, -- Quote repost comment
    
    -- Poll fields
    poll_options TEXT[],
    poll_counts INTEGER[],
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- At least one content type must be present (unless it's a repost)
    CHECK (
        is_repost = true OR
        content IS NOT NULL OR 
        image_url IS NOT NULL OR 
        image_urls IS NOT NULL OR
        video_url IS NOT NULL OR
        poll_options IS NOT NULL
    )
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Posts are viewable by everyone"
    ON public.posts FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = author_id);

-- Indexes
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_community_id_idx ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_original_post_id_idx ON public.posts(original_post_id);
CREATE INDEX IF NOT EXISTS posts_is_repost_idx ON public.posts(is_repost);

--------------------------------------------------------------------------------
-- 2. LIKES TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(post_id, user_id) -- One like per user per post
);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Likes are viewable by everyone"
    ON public.likes FOR SELECT
    USING (true);

CREATE POLICY "Users can like posts"
    ON public.likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS likes_post_id_idx ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS likes_created_at_idx ON public.likes(created_at DESC);

--------------------------------------------------------------------------------
-- 3. COMMENTS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Comments are viewable by everyone"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can comment"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = author_id);

-- Indexes
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at DESC);

--------------------------------------------------------------------------------
-- 4. POLL VOTES TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    option_index INTEGER NOT NULL CHECK (option_index >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(post_id, user_id) -- One vote per user per poll
);

-- Enable RLS
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Poll votes are viewable by everyone"
    ON public.poll_votes FOR SELECT
    USING (true);

CREATE POLICY "Users can vote on polls"
    ON public.poll_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their vote"
    ON public.poll_votes FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS poll_votes_post_id_idx ON public.poll_votes(post_id);
CREATE INDEX IF NOT EXISTS poll_votes_user_id_idx ON public.poll_votes(user_id);

--------------------------------------------------------------------------------
-- 5. POLL TRIGGER - Update poll counts
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_poll_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_id_var UUID;
    option_idx INTEGER;
BEGIN
    -- Determine which post_id to update
    IF TG_OP = 'DELETE' THEN
        post_id_var := OLD.post_id;
        option_idx := OLD.option_index;
    ELSE
        post_id_var := NEW.post_id;
        option_idx := NEW.option_index;
    END IF;
    
    -- Recalculate poll counts
    WITH vote_counts AS (
        SELECT 
            option_index,
            COUNT(*)::INTEGER AS count
        FROM public.poll_votes
        WHERE poll_votes.post_id = post_id_var
        GROUP BY option_index
        ORDER BY option_index
    ),
    poll_options_count AS (
        SELECT array_length(poll_options, 1) AS num_options
        FROM public.posts
        WHERE id = post_id_var
    )
    UPDATE public.posts
    SET poll_counts = (
        SELECT array_agg(COALESCE(vc.count, 0) ORDER BY idx)
        FROM generate_series(0, (SELECT num_options - 1 FROM poll_options_count)) idx
        LEFT JOIN vote_counts vc ON vc.option_index = idx
    )
    WHERE id = post_id_var;
    
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_poll_vote ON public.poll_votes;
CREATE TRIGGER on_poll_vote
    AFTER INSERT OR DELETE ON public.poll_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_poll_counts();

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'posts'
    ), 'posts table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'likes'
    ), 'likes table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'comments'
    ), 'comments table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'poll_votes'
    ), 'poll_votes table was not created';
    
    RAISE NOTICE 'Migration 004 completed successfully';
END $$;
