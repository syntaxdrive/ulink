-- Migration: Create Challenge Polls Table
-- Description: Creates the 'polls' and 'poll_votes' (separate from feed polls) to support Campus Challenges.

--------------------------------------------------------------------------------
-- 1. CHALLENGE POLLS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {id, text, emoji}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    ends_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Active polls are viewable by everyone" ON public.polls;
CREATE POLICY "Active polls are viewable by everyone"
    ON public.polls FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Only admins can create polls" ON public.polls;
CREATE POLICY "Only admins can create polls"
    ON public.polls FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

DROP POLICY IF EXISTS "Only admins can update/delete polls" ON public.polls;
CREATE POLICY "Only admins can update/delete polls"
    ON public.polls FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

--------------------------------------------------------------------------------
-- 2. CHALLENGE POLL VOTES TABLE
--------------------------------------------------------------------------------

-- Note: We use a separate table 'challenge_poll_votes' to avoid conflict 
-- with feed polls ('poll_votes') and to track university data.
CREATE TABLE IF NOT EXISTS public.challenge_poll_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    option_id TEXT NOT NULL,
    university TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(poll_id, user_id) -- One vote per user per challenge
);

-- Enable RLS
ALTER TABLE public.challenge_poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Poll votes are viewable by everyone" ON public.challenge_poll_votes;
CREATE POLICY "Poll votes are viewable by everyone"
    ON public.challenge_poll_votes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.challenge_poll_votes;
CREATE POLICY "Authenticated users can vote"
    ON public.challenge_poll_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS challenge_poll_votes_poll_id_idx ON public.challenge_poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS challenge_poll_votes_university_idx ON public.challenge_poll_votes(university);

--------------------------------------------------------------------------------
-- 3. POLL RESULTS FUNCTION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_poll_results(p_poll_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    WITH stats AS (
        SELECT 
            COUNT(*)::INTEGER AS total,
            COALESCE(
                jsonb_object_agg(option_id, count),
                '{}'::jsonb
            ) AS by_option
        FROM (
            SELECT option_id, COUNT(*)::INTEGER AS count
            FROM public.challenge_poll_votes
            WHERE poll_id = p_poll_id
            GROUP BY option_id
        ) s
    ),
    uni_stats AS (
        SELECT 
            university,
            COUNT(*)::INTEGER AS votes,
            RANK() OVER (ORDER BY COUNT(*) DESC) as rank
        FROM public.challenge_poll_votes
        WHERE poll_id = p_poll_id AND university IS NOT NULL
        GROUP BY university
        LIMIT 10
    )
    SELECT 
        jsonb_build_object(
            'total', COALESCE((SELECT total FROM stats), 0),
            'by_option', COALESCE((SELECT by_option FROM stats), '{}'::jsonb),
            'top_universities', COALESCE((SELECT jsonb_agg(u) FROM uni_stats u), '[]'::jsonb)
        )
    INTO result;

    RETURN result;
END;
$$;
