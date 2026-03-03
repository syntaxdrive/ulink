-- Migration: Final Ultra-Safe Leaderboard Fix
-- Description: Ensures all dependencies exist and creates a highly robust get_leaderboard RPC.

-- 1. Ensure gold_verified_users table exists
CREATE TABLE IF NOT EXISTS public.gold_verified_users (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    verified_by UUID REFERENCES public.profiles(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Clean up previous function signatures
DROP FUNCTION IF EXISTS public.get_leaderboard();
DROP FUNCTION IF EXISTS public.get_leaderboard(INTEGER, INTEGER);

-- 3. Create the robust leaderboard function
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
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY COALESCE(p.points, 0) DESC, p.created_at ASC) AS rank,
        p.id AS user_id,
        COALESCE(p.name, 'UniLink User') AS name,
        COALESCE(p.username, 'user_' || substring(p.id::text from 1 for 8)) AS username,
        p.avatar_url,
        COALESCE(p.university, 'UniLink Student') AS university,
        p.headline,
        COALESCE(p.points, 0) AS points,
        COALESCE(p.is_verified, false) AS is_verified,
        EXISTS (SELECT 1 FROM public.gold_verified_users gv WHERE gv.user_id = p.id) AS gold_verified
    FROM public.profiles p
    -- We show everyone to ensure the leaderboard is never empty during testing/initial launch
    ORDER BY COALESCE(p.points, 0) DESC, p.created_at ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 4. Manual Boost again just in case previous update didn't run
UPDATE public.profiles 
SET points = 10 
WHERE points IS NULL OR points <= 0;
