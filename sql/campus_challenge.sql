-- ============================================================
-- CAMPUS CHALLENGE — Platform-wide polls with university stats
-- Run this in Supabase SQL Editor
-- ============================================================

-- Polls table (admins create these)
CREATE TABLE IF NOT EXISTS public.polls (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question text NOT NULL CHECK (char_length(question) <= 300),
    description text CHECK (char_length(description) <= 500),
    options jsonb NOT NULL,  -- [{ "id": "a", "text": "Option A", "emoji": "🔥" }, ...]
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    ends_at timestamptz,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Votes table (one vote per user per poll)
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    option_id text NOT NULL,
    university text,   -- denormalized from profile at vote time for fast group-by
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (poll_id, user_id)
);

-- RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls: anyone authenticated can read
CREATE POLICY "anyone_read_polls" ON public.polls
    FOR SELECT TO authenticated USING (true);

-- Polls: only admins can insert/update/delete
CREATE POLICY "admins_manage_polls" ON public.polls
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Votes: users can read votes for stats (aggregate only)
CREATE POLICY "anyone_read_votes" ON public.poll_votes
    FOR SELECT TO authenticated USING (true);

-- Votes: users can only insert their own vote
CREATE POLICY "users_insert_own_vote" ON public.poll_votes
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;

-- ─── RPC: get_poll_results ─────────────────────────────────────────────────
-- Returns per-option counts + university breakdown for a given poll
CREATE OR REPLACE FUNCTION public.get_poll_results(p_poll_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total', COUNT(*),
        'by_option', (
            SELECT jsonb_object_agg(option_id, cnt)
            FROM (
                SELECT option_id, COUNT(*) as cnt
                FROM public.poll_votes
                WHERE poll_id = p_poll_id
                GROUP BY option_id
            ) x
        ),
        'by_university', (
            SELECT jsonb_agg(row_to_json(u))
            FROM (
                SELECT
                    COALESCE(university, 'Unknown') as university,
                    COUNT(*) as votes,
                    jsonb_object_agg(option_id, cnt) as breakdown
                FROM (
                    SELECT university, option_id, COUNT(*) as cnt
                    FROM public.poll_votes
                    WHERE poll_id = p_poll_id
                    GROUP BY university, option_id
                ) inner_q
                GROUP BY university
                ORDER BY votes DESC
                LIMIT 20
            ) u
        ),
        'top_universities', (
            SELECT jsonb_agg(row_to_json(t))
            FROM (
                SELECT
                    COALESCE(university, 'Unknown') as university,
                    COUNT(*) as votes,
                    RANK() OVER (ORDER BY COUNT(*) DESC) as rank
                FROM public.poll_votes
                WHERE poll_id = p_poll_id AND university IS NOT NULL AND university != ''
                GROUP BY university
                ORDER BY votes DESC
                LIMIT 10
            ) t
        )
    )
    INTO result
    FROM public.poll_votes
    WHERE poll_id = p_poll_id;

    RETURN COALESCE(result, '{"total":0,"by_option":{},"by_university":[],"top_universities":[]}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_poll_results(uuid) TO authenticated;
