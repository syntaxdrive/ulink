-- Migration: Revamp Admin Stats and Activity
-- Description: Updates the admin dashboard stats and provides real-time activity metrics.

-- 1. Updated Admin Stats Function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
    total_users BIGINT,
    total_verified BIGINT,
    total_orgs BIGINT,
    total_posts BIGINT,
    total_communities BIGINT,
    total_jobs BIGINT,
    total_courses BIGINT,
    pending_reports BIGINT,
    active_sponsored_posts BIGINT,
    total_revenue DECIMAL
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.profiles) AS total_users,
        (SELECT COUNT(*) FROM public.profiles WHERE is_verified = TRUE) AS total_verified,
        (SELECT COUNT(*) FROM public.profiles WHERE role = 'org') AS total_orgs,
        (SELECT COUNT(*) FROM public.posts) AS total_posts,
        (SELECT COUNT(*) FROM public.communities) AS total_communities,
        (SELECT COUNT(*) FROM public.jobs) AS total_jobs,
        (SELECT COUNT(*) FROM public.courses) AS total_courses,
        (SELECT COUNT(*) FROM public.reports WHERE status = 'pending') AS pending_reports,
        (SELECT COUNT(*) FROM public.sponsored_posts WHERE status = 'active') AS active_sponsored_posts,
        (SELECT COALESCE(SUM(total_spent), 0) FROM public.sponsored_posts) AS total_revenue;
END;
$$;

-- 2. Enhanced Recent Activity Function
CREATE OR REPLACE FUNCTION public.get_recent_activity(
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    activity_type TEXT,
    user_id UUID,
    user_name TEXT,
    user_avatar TEXT,
    description TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    RETURN QUERY
    (
        SELECT 
            'post'::TEXT AS activity_type,
            p.author_id AS user_id,
            prof.name AS user_name,
            prof.avatar_url AS user_avatar,
            COALESCE(SUBSTRING(p.content FROM 1 FOR 50) || '...', 'Created a post') AS description,
            p.created_at
        FROM public.posts p
        JOIN public.profiles prof ON p.author_id = prof.id
        ORDER BY p.created_at DESC
        LIMIT p_limit / 4
    )
    UNION ALL
    (
        SELECT 
            'comment'::TEXT AS activity_type,
            c.author_id AS user_id,
            prof.name AS user_name,
            prof.avatar_url AS user_avatar,
            COALESCE(SUBSTRING(c.content FROM 1 FOR 50) || '...', 'Commented on a post') AS description,
            c.created_at
        FROM public.comments c
        JOIN public.profiles prof ON c.author_id = prof.id
        ORDER BY c.created_at DESC
        LIMIT p_limit / 4
    )
    UNION ALL
    (
        SELECT 
            'job'::TEXT AS activity_type,
            j.creator_id AS user_id,
            prof.name AS user_name,
            prof.avatar_url AS user_avatar,
            'Posted a job: ' || j.title AS description,
            j.created_at
        FROM public.jobs j
        JOIN public.profiles prof ON j.creator_id = prof.id
        ORDER BY j.created_at DESC
        LIMIT p_limit / 4
    )
    UNION ALL
    (
        SELECT 
            'signup'::TEXT AS activity_type,
            p.id AS user_id,
            p.name AS user_name,
            p.avatar_url AS user_avatar,
            'Joined UniLink Nigeria'::TEXT AS description,
            p.created_at
        FROM public.profiles p
        ORDER BY p.created_at DESC
        LIMIT p_limit / 4
    )
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$;
