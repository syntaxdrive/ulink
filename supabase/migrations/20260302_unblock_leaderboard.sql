-- Migration: Unblock Leaderboard & Manual Point Boost
-- Description: Removes all filters from leaderboard and gives everyone a starting boost to ensure visibility.

-- 1. Make the leaderboard extremely permissive (shows everyone)
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
        ROW_NUMBER() OVER (ORDER BY COALESCE(p.points, 0) DESC, p.created_at ASC) AS rank,
        p.id AS user_id,
        COALESCE(p.name, 'New User') AS name,
        p.username,
        p.avatar_url,
        p.university,
        p.headline,
        COALESCE(p.points, 0) AS points,
        COALESCE(p.is_verified, false) AS is_verified,
        -- Check both a hardcoded flag or a joined table for verification
        (COALESCE(p.is_verified, false) OR EXISTS (SELECT 1 FROM public.gold_verified_users WHERE user_id = p.id)) AS gold_verified
    FROM public.profiles p
    -- REMOVED WHERE CLAUSE to ensure everyone shows up during testing
    ORDER BY COALESCE(p.points, 0) DESC, p.created_at ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 2. Give everyone a 10-point boost to ensure the leaderboard is populated
UPDATE public.profiles 
SET points = COALESCE(points, 0) + 10 
WHERE points IS NULL OR points <= 0;

-- 3. Verify there are profiles
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    RAISE NOTICE 'Found % profiles in the database.', profile_count;
END $$;
