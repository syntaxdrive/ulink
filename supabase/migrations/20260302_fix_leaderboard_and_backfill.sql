-- Migration: Fix Leaderboard and Backfill Historical Points
-- Description: Recalculates points for all activity and allows 0-point users on leaderboard

-- 1. Update get_leaderboard to show all students (up to 100) even if 0 points
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
        COALESCE(p.points, 0) AS points,
        p.is_verified,
        EXISTS (SELECT 1 FROM public.gold_verified_users WHERE user_id = p.id) AS gold_verified
    FROM public.profiles p
    WHERE p.role = 'student' OR p.role IS NULL
    ORDER BY p.points DESC, p.created_at ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 2. Backfill points for existing activity
DO $$
DECLARE
    profile_record RECORD;
    p_posts INTEGER;
    p_likes INTEGER;
    p_comments INTEGER;
    p_connections INTEGER;
    p_referrals INTEGER;
    total_pts INTEGER;
BEGIN
    FOR profile_record IN SELECT id FROM public.profiles LOOP
        -- Posts: 10 pts
        SELECT COUNT(*) INTO p_posts FROM public.posts WHERE author_id = profile_record.id;
        
        -- Likes received: 2 pts
        SELECT COUNT(*) INTO p_likes FROM public.likes l 
        JOIN public.posts p ON l.post_id = p.id 
        WHERE p.author_id = profile_record.id;
        
        -- Comments: 5 pts
        SELECT COUNT(*) INTO p_comments FROM public.comments WHERE author_id = profile_record.id;
        
        -- Connections: 15 pts
        SELECT COUNT(*) INTO p_connections FROM public.connections 
        WHERE (requester_id = profile_record.id OR recipient_id = profile_record.id) 
        AND status = 'accepted';

        -- Referrals: 50 pts (as referrer)
        SELECT COUNT(*) INTO p_referrals FROM public.profiles WHERE referred_by = profile_record.id;

        total_pts := (p_posts * 10) + (p_likes * 2) + (p_comments * 5) + (p_connections * 15) + (p_referrals * 50);
        
        -- Also check if they were referred themselves (+20)
        IF EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_record.id AND referred_by IS NOT NULL) THEN
            total_pts := total_pts + 20;
        END IF;

        UPDATE public.profiles SET points = total_pts WHERE id = profile_record.id;
    END LOOP;
END $$;
