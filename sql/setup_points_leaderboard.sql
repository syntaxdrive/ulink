-- =====================================================
-- UNILINK POINTS & LEADERBOARD — FULL SETUP
-- Run this in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE)
-- =====================================================

-- 1. ADD COLUMNS
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);

-- 2. POINTS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.points_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    points_earned INTEGER NOT NULL,
    reference_id UUID,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_history_user    ON public.points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created ON public.points_history(created_at DESC);

-- RLS
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own points history" ON public.points_history;
CREATE POLICY "Users can view their own points history"
    ON public.points_history FOR SELECT
    USING (auth.uid() = user_id);

-- 3. CORE AWARD FUNCTION
DROP FUNCTION IF EXISTS public.award_points(UUID, TEXT, INTEGER, UUID);
CREATE OR REPLACE FUNCTION public.award_points(
    p_user_id    UUID,
    p_action_type TEXT,
    p_points     INTEGER,
    p_reference_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.points_history (user_id, action_type, points_earned, reference_id)
    VALUES (p_user_id, p_action_type, p_points, p_reference_id);

    UPDATE public.profiles
    SET points = COALESCE(points, 0) + p_points
    WHERE id = p_user_id;
END;
$$;

-- 4. TRIGGERS

-- +10 for new post
CREATE OR REPLACE FUNCTION public.trigger_points_new_post()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    PERFORM public.award_points(NEW.author_id, 'post_created', 10, NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS points_on_new_post ON public.posts;
CREATE TRIGGER points_on_new_post
    AFTER INSERT ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.trigger_points_new_post();

-- +2 when a post gets liked
CREATE OR REPLACE FUNCTION public.trigger_points_post_liked()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    post_author UUID;
BEGIN
    SELECT author_id INTO post_author FROM public.posts WHERE id = NEW.post_id;
    IF post_author IS NOT NULL THEN
        PERFORM public.award_points(post_author, 'post_liked', 2, NEW.post_id);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS points_on_post_liked ON public.likes;
CREATE TRIGGER points_on_post_liked
    AFTER INSERT ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.trigger_points_post_liked();

-- +5 for a new comment
CREATE OR REPLACE FUNCTION public.trigger_points_new_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    PERFORM public.award_points(NEW.author_id, 'comment_created', 5, NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS points_on_new_comment ON public.comments;
CREATE TRIGGER points_on_new_comment
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.trigger_points_new_comment();

-- +15 to both sides when a connection is accepted
CREATE OR REPLACE FUNCTION public.trigger_points_connection_accepted()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status <> 'accepted') THEN
        PERFORM public.award_points(NEW.requester_id, 'connection_made', 15, NEW.id);
        PERFORM public.award_points(NEW.recipient_id,  'connection_made', 15, NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS points_on_connection_accepted ON public.connections;
CREATE TRIGGER points_on_connection_accepted
    AFTER UPDATE ON public.connections
    FOR EACH ROW EXECUTE FUNCTION public.trigger_points_connection_accepted();

-- 5. GET LEADERBOARD (excludes test users)
DROP FUNCTION IF EXISTS public.get_leaderboard(INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION public.get_leaderboard(
    p_limit  INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    rank         BIGINT,
    user_id      UUID,
    name         TEXT,
    username     TEXT,
    avatar_url   TEXT,
    university   TEXT,
    headline     TEXT,
    points       INTEGER,
    is_verified  BOOLEAN,
    gold_verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY COALESCE(p.points,0) DESC, p.created_at ASC)::BIGINT AS rank,
        p.id           AS user_id,
        p.name,
        p.username,
        p.avatar_url,
        p.university,
        p.headline,
        COALESCE(p.points, 0) AS points,
        p.is_verified,
        p.gold_verified
    FROM public.profiles p
    WHERE p.role = 'student'
      AND COALESCE(p.is_test_user, false) = false
    ORDER BY COALESCE(p.points, 0) DESC, p.created_at ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 6. GET USER RANK (excludes test users from count)
DROP FUNCTION IF EXISTS public.get_user_rank(UUID);
CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id UUID)
RETURNS TABLE (
    rank        BIGINT,
    total_users BIGINT,
    points      INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH ranked AS (
        SELECT
            id,
            COALESCE(pts.points, 0) AS user_points,
            ROW_NUMBER() OVER (ORDER BY COALESCE(pts.points,0) DESC, pts.created_at ASC) AS user_rank
        FROM public.profiles pts
        WHERE role = 'student'
          AND COALESCE(is_test_user, false) = false
    ),
    total AS (
        SELECT COUNT(*)::BIGINT AS cnt
        FROM public.profiles
        WHERE role = 'student'
          AND COALESCE(is_test_user, false) = false
    )
    SELECT r.user_rank, t.cnt, r.user_points::INTEGER
    FROM ranked r
    CROSS JOIN total t
    WHERE r.id = p_user_id;
END;
$$;

-- 7. PROFILE COMPLETION BONUS (one-time, up to +110 pts)
DROP FUNCTION IF EXISTS public.award_profile_completion_bonus(UUID);
CREATE OR REPLACE FUNCTION public.award_profile_completion_bonus(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec           RECORD;
    bonus         INTEGER := 0;
    already_done  BOOLEAN;
BEGIN
    SELECT * INTO rec FROM public.profiles WHERE id = p_user_id;

    SELECT EXISTS(
        SELECT 1 FROM public.points_history
        WHERE user_id = p_user_id AND action_type = 'profile_completed'
    ) INTO already_done;

    IF already_done THEN
        RETURN 0;
    END IF;

    IF rec.avatar_url IS NOT NULL THEN
        bonus := bonus + 20;
    END IF;

    IF rec.headline IS NOT NULL AND LENGTH(rec.headline) > 10 THEN
        bonus := bonus + 15;
    END IF;

    IF rec.about IS NOT NULL AND LENGTH(rec.about) > 50 THEN
        bonus := bonus + 25;
    END IF;

    IF rec.skills IS NOT NULL AND array_length(rec.skills, 1) >= 3 THEN
        bonus := bonus + 20;
    END IF;

    -- Only check experience if the column exists (some schemas may not have it)
    BEGIN
        IF rec.experience IS NOT NULL AND jsonb_array_length(to_jsonb(rec.experience)) >= 1 THEN
            bonus := bonus + 30;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- column doesn't exist or wrong type — skip gracefully
    END;

    IF bonus >= 50 THEN
        PERFORM public.award_points(p_user_id, 'profile_completed', bonus, NULL);
    END IF;

    RETURN bonus;
END;
$$;

-- 8. GRANT EXECUTE
GRANT EXECUTE ON FUNCTION public.award_points(UUID, TEXT, INTEGER, UUID)           TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER, INTEGER)                 TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_rank(UUID)                               TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_profile_completion_bonus(UUID)              TO authenticated;

-- 9. BACKFILL HISTORICAL POINTS (idempotent — resets and recalculates)
DO $$
DECLARE
    rec           RECORD;
    post_pts      INTEGER;
    like_pts      INTEGER;
    comment_pts   INTEGER;
    conn_pts      INTEGER;
    profile_bonus INTEGER;
    total         INTEGER;
BEGIN
    RAISE NOTICE 'Backfilling historical points...';

    FOR rec IN
        SELECT id, name, avatar_url, headline, about, skills
        FROM public.profiles
        WHERE role = 'student'
    LOOP
        total := 0;

        SELECT COUNT(*) * 10 INTO post_pts
        FROM public.posts WHERE author_id = rec.id;
        total := total + post_pts;

        SELECT COUNT(*) * 2 INTO like_pts
        FROM public.likes l JOIN public.posts p ON l.post_id = p.id
        WHERE p.author_id = rec.id;
        total := total + like_pts;

        SELECT COUNT(*) * 5 INTO comment_pts
        FROM public.comments WHERE author_id = rec.id;
        total := total + comment_pts;

        SELECT COUNT(*) * 15 INTO conn_pts
        FROM public.connections
        WHERE (requester_id = rec.id OR recipient_id = rec.id)
          AND status = 'accepted';
        total := total + conn_pts;

        -- Profile bonus
        profile_bonus := 0;
        IF rec.avatar_url IS NOT NULL THEN profile_bonus := profile_bonus + 20; END IF;
        IF rec.headline IS NOT NULL AND LENGTH(rec.headline) > 10 THEN profile_bonus := profile_bonus + 15; END IF;
        IF rec.about IS NOT NULL AND LENGTH(rec.about) > 50 THEN profile_bonus := profile_bonus + 25; END IF;
        IF rec.skills IS NOT NULL AND array_length(rec.skills, 1) >= 3 THEN profile_bonus := profile_bonus + 20; END IF;
        total := total + profile_bonus;

        UPDATE public.profiles SET points = total WHERE id = rec.id;

        IF total > 0 THEN
            RAISE NOTICE 'User %: % pts', rec.name, total;
        END IF;
    END LOOP;

    RAISE NOTICE 'Done.';
END $$;

-- 10. Verify top 10
SELECT name, points, university
FROM public.profiles
WHERE role = 'student'
ORDER BY points DESC
LIMIT 10;
