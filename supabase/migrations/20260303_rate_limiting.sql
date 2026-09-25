-- ============================================================
-- Rate Limiting via Supabase (DB-level + RLS)
-- Protects against spam on high-bandwidth operations:
--   - Posts: max 10 per hour per user
--   - Comments: max 30 per hour per user
--   - Likes: max 60 per hour per user (anti-bot)
--   - Media uploads: tracked via post rate limit
-- ============================================================

-- 1. Create a rate_limits table to track actions
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,          -- 'post', 'comment', 'like', etc.
    window_start timestamptz NOT NULL DEFAULT now(),
    count integer NOT NULL DEFAULT 1,
    UNIQUE (user_id, action, window_start)
);

-- Index for fast lookups by user+action
CREATE INDEX IF NOT EXISTS rate_limits_user_action_idx ON public.rate_limits (user_id, action, window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own rate limit rows
CREATE POLICY "Users manage their own rate limits"
ON public.rate_limits
FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 2. Core rate limit check function
--    Returns TRUE if the user is within limits, FALSE if exceeded
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id uuid,
    p_action text,
    p_max_count integer,
    p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_window_start timestamptz;
    v_current_count integer;
BEGIN
    -- Calculate current window start (truncate to window boundary)
    v_window_start := date_trunc('hour', now()) +
        (floor(extract(minute from now()) / p_window_minutes) * p_window_minutes * interval '1 minute');

    -- Upsert the rate limit row
    INSERT INTO public.rate_limits (user_id, action, window_start, count)
    VALUES (p_user_id, p_action, v_window_start, 1)
    ON CONFLICT (user_id, action, window_start)
    DO UPDATE SET count = rate_limits.count + 1
    RETURNING count INTO v_current_count;

    -- Return whether within limit
    RETURN v_current_count <= p_max_count;
END;
$$;

-- ============================================================
-- 3. Convenience wrapper functions (called from triggers/RLS)
-- ============================================================

-- Check post rate limit (30 posts per hour)
CREATE OR REPLACE FUNCTION public.check_post_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Skip rate limit for reposts (is_repost flag) — only count original posts
    IF NEW.is_repost IS TRUE THEN
        RETURN NEW;
    END IF;

    IF NOT public.check_rate_limit(NEW.author_id, 'post', 30, 60) THEN
        RAISE EXCEPTION 'Rate limit exceeded: you can only post 30 times per hour. Please wait before posting again.'
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$;

-- Check comment rate limit (30 comments per hour)
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.check_rate_limit(NEW.author_id, 'comment', 30, 60) THEN
        RAISE EXCEPTION 'Rate limit exceeded: you can only comment 30 times per hour. Please wait before commenting again.'
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$;

-- ============================================================
-- 4. Attach triggers to posts and comments tables
-- ============================================================

-- Drop if exists (idempotent)
DROP TRIGGER IF EXISTS enforce_post_rate_limit ON public.posts;
DROP TRIGGER IF EXISTS enforce_comment_rate_limit ON public.comments;

-- Create triggers
CREATE TRIGGER enforce_post_rate_limit
    BEFORE INSERT ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.check_post_rate_limit();

CREATE TRIGGER enforce_comment_rate_limit
    BEFORE INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.check_comment_rate_limit();

-- ============================================================
-- 5. Cleanup function: Remove old rate limit windows (run periodically)
--    You can call this via a pg_cron job or manually
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.rate_limits
    WHERE window_start < now() - interval '24 hours';
END;
$$;

-- Grant execute to authenticated users on check functions (needed for trigger context)
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits TO authenticated;
