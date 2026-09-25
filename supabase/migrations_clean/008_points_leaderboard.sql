-- Migration 008: Points & Leaderboard System
-- Description: Gamification system with points tracking and leaderboard
-- Dependencies: 001_foundation_profiles_auth.sql, 004_feed_posts_engagement.sql, 002_network_connections_follows.sql
-- Generated: 2026-02-17

--------------------------------------------------------------------------------
-- 1. POINTS HISTORY TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.points_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT CHECK (activity_type IN (
        'post_created',
        'post_liked',
        'comment_created',
        'connection_made',
        'profile_completed'
    )) NOT NULL,
    points_earned INTEGER NOT NULL,
    reference_id UUID, -- ID of related entity (post_id, comment_id, etc)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Points history is viewable by everyone (leaderboard)" ON public.points_history;
CREATE POLICY "Points history is viewable by everyone (leaderboard)"
    ON public.points_history FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Only triggers can insert points" ON public.points_history;
CREATE POLICY "Only triggers can insert points"
    ON public.points_history FOR INSERT
    WITH CHECK (false); -- Only triggers/functions can insert

-- Indexes
CREATE INDEX IF NOT EXISTS points_history_user_id_idx ON public.points_history(user_id);
CREATE INDEX IF NOT EXISTS points_history_created_at_idx ON public.points_history(created_at DESC);
CREATE INDEX IF NOT EXISTS points_history_activity_type_idx ON public.points_history(activity_type);

--------------------------------------------------------------------------------
-- 2. GOLD VERIFIED USERS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.gold_verified_users (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    verified_by UUID REFERENCES public.profiles(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.gold_verified_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Gold verified status is viewable by everyone" ON public.gold_verified_users;
CREATE POLICY "Gold verified status is viewable by everyone"
    ON public.gold_verified_users FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Only admins can grant gold verification" ON public.gold_verified_users;
CREATE POLICY "Only admins can grant gold verification"
    ON public.gold_verified_users FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

DROP POLICY IF EXISTS "Only admins can revoke gold verification" ON public.gold_verified_users;
CREATE POLICY "Only admins can revoke gold verification"
    ON public.gold_verified_users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

-- Index
CREATE INDEX IF NOT EXISTS gold_verified_users_user_id_idx ON public.gold_verified_users(user_id);

--------------------------------------------------------------------------------
-- 3. POINTS AWARD FUNCTION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.award_points(
    p_user_id UUID,
    p_activity_type TEXT,
    p_points INTEGER,
    p_reference_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert into points history
    INSERT INTO public.points_history (user_id, activity_type, points_earned, reference_id)
    VALUES (p_user_id, p_activity_type, p_points, p_reference_id);
    
    -- Update user's total points
    UPDATE public.profiles
    SET points = points + p_points,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$;

--------------------------------------------------------------------------------
-- 4. POINTS TRIGGERS
--------------------------------------------------------------------------------

-- Trigger: Award points for creating a post (+10 points)
CREATE OR REPLACE FUNCTION public.trigger_points_new_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM public.award_points(
        NEW.author_id,
        'post_created',
        10,
        NEW.id
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS points_on_new_post ON public.posts;
CREATE TRIGGER points_on_new_post
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_points_new_post();

-- Trigger: Award points when post is liked (+2 points to post author)
CREATE OR REPLACE FUNCTION public.trigger_points_post_liked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_author_id UUID;
BEGIN
    -- Get post author
    SELECT author_id INTO post_author_id
    FROM public.posts
    WHERE id = NEW.post_id;
    
    -- Award points to post author
    IF post_author_id IS NOT NULL THEN
        PERFORM public.award_points(
            post_author_id,
            'post_liked',
            2,
            NEW.post_id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS points_on_post_liked ON public.likes;
CREATE TRIGGER points_on_post_liked
    AFTER INSERT ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_points_post_liked();

-- Trigger: Award points for commenting (+5 points)
CREATE OR REPLACE FUNCTION public.trigger_points_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM public.award_points(
        NEW.author_id,
        'comment_created',
        5,
        NEW.id
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS points_on_new_comment ON public.comments;
CREATE TRIGGER points_on_new_comment
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_points_new_comment();

-- Trigger: Award points when connection is accepted (+15 points to BOTH users)
CREATE OR REPLACE FUNCTION public.trigger_points_connection_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only award when connection changes from pending to accepted
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        -- Award to requester
        PERFORM public.award_points(
            NEW.requester_id,
            'connection_made',
            15,
            NEW.id
        );
        
        -- Award to recipient
        PERFORM public.award_points(
            NEW.recipient_id,
            'connection_made',
            15,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS points_on_connection_accepted ON public.connections;
CREATE TRIGGER points_on_connection_accepted
    AFTER UPDATE ON public.connections
    FOR EACH ROW
    WHEN (NEW.status = 'accepted' AND OLD.status = 'pending')
    EXECUTE FUNCTION public.trigger_points_connection_accepted();

--------------------------------------------------------------------------------
-- 5. LEADERBOARD FUNCTIONS
--------------------------------------------------------------------------------

-- Get leaderboard (top users by points)
CREATE OR REPLACE FUNCTION public.get_leaderboard(
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    name TEXT,
    username TEXT,
    avatar_url TEXT,
    university TEXT,
    headline TEXT,
    points INTEGER,
    is_verified BOOLEAN,
    gold_verified BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY p.points DESC, p.created_at ASC) AS rank,
        p.id AS user_id,
        p.name,
        p.username,
        p.avatar_url,
        p.university,
        p.headline,
        p.points,
        p.is_verified,
        EXISTS (SELECT 1 FROM public.gold_verified_users WHERE user_id = p.id) AS gold_verified
    FROM public.profiles p
    WHERE p.points > 0
    ORDER BY p.points DESC, p.created_at ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Get user's rank
CREATE OR REPLACE FUNCTION public.get_user_rank(
    p_user_id UUID
)
RETURNS TABLE (
    rank BIGINT,
    total_users BIGINT,
    points INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH ranked_users AS (
        SELECT 
            id,
            points,
            ROW_NUMBER() OVER (ORDER BY points DESC, created_at ASC) AS rank
        FROM public.profiles
        WHERE points > 0
    ),
    total_count AS (
        SELECT COUNT(*) AS total FROM public.profiles WHERE points > 0
    )
    SELECT 
        ru.rank,
        tc.total AS total_users,
        ru.points
    FROM ranked_users ru
    CROSS JOIN total_count tc
    WHERE ru.id = p_user_id;
END;
$$;

-- Award profile completion bonus (one-time +110 points)
CREATE OR REPLACE FUNCTION public.award_profile_completion_bonus(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    already_awarded BOOLEAN;
    profile_complete BOOLEAN;
BEGIN
    -- Check if bonus already awarded
    SELECT EXISTS (
        SELECT 1 FROM public.points_history
        WHERE user_id = p_user_id
            AND activity_type = 'profile_completed'
    ) INTO already_awarded;
    
    IF already_awarded THEN
        RAISE EXCEPTION 'Profile completion bonus already awarded';
    END IF;
    
    -- Check if profile is complete (avatar, headline, about, skills, experience)
    SELECT 
        avatar_url IS NOT NULL AND
        headline IS NOT NULL AND headline != '' AND
        about IS NOT NULL AND about != '' AND
        skills IS NOT NULL AND array_length(skills, 1) > 0 AND
        experience IS NOT NULL AND jsonb_array_length(experience) > 0
    INTO profile_complete
    FROM public.profiles
    WHERE id = p_user_id;
    
    IF NOT profile_complete THEN
        RAISE EXCEPTION 'Profile is not complete yet';
    END IF;
    
    -- Award bonus
    PERFORM public.award_points(
        p_user_id,
        'profile_completed',
        110,
        NULL
    );
END;
$$;

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'points_history'
    ), 'points_history table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'gold_verified_users'
    ), 'gold_verified_users table was not created';
    
    RAISE NOTICE 'Migration 008 completed successfully';
END $$;
