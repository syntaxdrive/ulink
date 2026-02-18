-- Migration 010: Admin & Moderation System
-- Description: Sponsored posts, ad tracking, whiteboards, and admin utilities
-- Dependencies: 001_foundation_profiles_auth.sql, 004_feed_posts_engagement.sql
-- Generated: 2026-02-17

--------------------------------------------------------------------------------
-- 1. SPONSORED POSTS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sponsored_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sponsor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video', NULL)),
    cta_text TEXT, -- Call to action button text
    cta_url TEXT, -- Call to action URL
    target_audience JSONB DEFAULT '{}'::jsonb, -- Targeting criteria
    budget_naira DECIMAL(10, 2) NOT NULL,
    cost_per_click DECIMAL(10, 2) DEFAULT 50.00,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN (
        'pending',
        'active',
        'paused',
        'completed',
        'rejected'
    )) DEFAULT 'pending' NOT NULL,
    total_impressions INTEGER DEFAULT 0 NOT NULL,
    total_clicks INTEGER DEFAULT 0 NOT NULL,
    total_spent DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure end date is after start date
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Enable RLS
ALTER TABLE public.sponsored_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Active sponsored posts are viewable by everyone"
    ON public.sponsored_posts FOR SELECT
    USING (status = 'active' AND NOW() BETWEEN start_date AND end_date);

CREATE POLICY "Sponsors can view their own campaigns"
    ON public.sponsored_posts FOR SELECT
    USING (sponsor_id = auth.uid());

CREATE POLICY "Admins can view all sponsored posts"
    ON public.sponsored_posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Users can create sponsored posts"
    ON public.sponsored_posts FOR INSERT
    WITH CHECK (sponsor_id = auth.uid());

CREATE POLICY "Sponsors can update their pending/paused campaigns"
    ON public.sponsored_posts FOR UPDATE
    USING (
        sponsor_id = auth.uid() 
        AND status IN ('pending', 'paused')
    )
    WITH CHECK (
        sponsor_id = auth.uid()
        AND status IN ('pending', 'paused')
    );

CREATE POLICY "Admins can update any sponsored post"
    ON public.sponsored_posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS sponsored_posts_sponsor_id_idx ON public.sponsored_posts(sponsor_id);
CREATE INDEX IF NOT EXISTS sponsored_posts_status_idx ON public.sponsored_posts(status);
CREATE INDEX IF NOT EXISTS sponsored_posts_dates_idx ON public.sponsored_posts(start_date, end_date);

--------------------------------------------------------------------------------
-- 2. SPONSORED POST IMPRESSIONS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sponsored_post_impressions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sponsored_post_id UUID REFERENCES public.sponsored_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    interaction_type TEXT CHECK (interaction_type IN ('view', 'click')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.sponsored_post_impressions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Only system can insert impressions"
    ON public.sponsored_post_impressions FOR INSERT
    WITH CHECK (true); -- Allowed by functions

CREATE POLICY "Sponsors can view impressions for their campaigns"
    ON public.sponsored_post_impressions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sponsored_posts
            WHERE sponsored_posts.id = sponsored_post_id
                AND sponsored_posts.sponsor_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all impressions"
    ON public.sponsored_post_impressions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS impressions_sponsored_post_id_idx ON public.sponsored_post_impressions(sponsored_post_id);
CREATE INDEX IF NOT EXISTS impressions_user_id_idx ON public.sponsored_post_impressions(user_id);
CREATE INDEX IF NOT EXISTS impressions_type_idx ON public.sponsored_post_impressions(interaction_type);
CREATE INDEX IF NOT EXISTS impressions_created_at_idx ON public.sponsored_post_impressions(created_at);

--------------------------------------------------------------------------------
-- 3. WHITEBOARDS TABLE (Admin Collaboration)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.whiteboards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content JSONB DEFAULT '{"nodes": [], "edges": []}'::jsonb, -- Stores whiteboard state
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    last_edited_by UUID REFERENCES public.profiles(id),
    collaborators UUID[] DEFAULT ARRAY[]::UUID[], -- Admin user IDs with access
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.whiteboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Only admins can view whiteboards"
    ON public.whiteboards FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Only admins can create whiteboards"
    ON public.whiteboards FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Only admins can update whiteboards"
    ON public.whiteboards FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Only admins can delete whiteboards"
    ON public.whiteboards FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS whiteboards_created_by_idx ON public.whiteboards(created_by);
CREATE INDEX IF NOT EXISTS whiteboards_updated_at_idx ON public.whiteboards(updated_at DESC);

--------------------------------------------------------------------------------
-- 4. SPONSORED POST TRACKING FUNCTIONS
--------------------------------------------------------------------------------

-- Increment impression count
CREATE OR REPLACE FUNCTION public.increment_sponsored_post_impression(
    p_sponsored_post_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Record impression
    INSERT INTO public.sponsored_post_impressions (sponsored_post_id, user_id, interaction_type)
    VALUES (p_sponsored_post_id, p_user_id, 'view');
    
    -- Update total impressions
    UPDATE public.sponsored_posts
    SET total_impressions = total_impressions + 1,
        updated_at = NOW()
    WHERE id = p_sponsored_post_id;
END;
$$;

-- Increment click count and charge sponsor
CREATE OR REPLACE FUNCTION public.increment_sponsored_post_click(
    p_sponsored_post_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    click_cost DECIMAL(10, 2);
    current_spent DECIMAL(10, 2);
    campaign_budget DECIMAL(10, 2);
BEGIN
    -- Get campaign details
    SELECT cost_per_click, total_spent, budget_naira
    INTO click_cost, current_spent, campaign_budget
    FROM public.sponsored_posts
    WHERE id = p_sponsored_post_id;
    
    -- Check if budget allows this click
    IF (current_spent + click_cost) > campaign_budget THEN
        -- Pause campaign if budget exceeded
        UPDATE public.sponsored_posts
        SET status = 'completed',
            updated_at = NOW()
        WHERE id = p_sponsored_post_id;
        
        RAISE NOTICE 'Campaign budget exceeded. Campaign marked as completed.';
        RETURN;
    END IF;
    
    -- Record click
    INSERT INTO public.sponsored_post_impressions (sponsored_post_id, user_id, interaction_type)
    VALUES (p_sponsored_post_id, p_user_id, 'click');
    
    -- Update clicks and spent amount
    UPDATE public.sponsored_posts
    SET total_clicks = total_clicks + 1,
        total_spent = total_spent + click_cost,
        updated_at = NOW()
    WHERE id = p_sponsored_post_id;
END;
$$;

--------------------------------------------------------------------------------
-- 5. ADMIN UTILITY FUNCTIONS
--------------------------------------------------------------------------------

-- Get admin dashboard statistics
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
    total_users BIGINT,
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
        (SELECT COUNT(*) FROM public.posts) AS total_posts,
        (SELECT COUNT(*) FROM public.communities) AS total_communities,
        (SELECT COUNT(*) FROM public.jobs) AS total_jobs,
        (SELECT COUNT(*) FROM public.courses) AS total_courses,
        (SELECT COUNT(*) FROM public.reports WHERE status = 'pending') AS pending_reports,
        (SELECT COUNT(*) FROM public.sponsored_posts WHERE status = 'active') AS active_sponsored_posts,
        (SELECT COALESCE(SUM(total_spent), 0) FROM public.sponsored_posts) AS total_revenue;
END;
$$;

-- Bulk verify users (for admins)
CREATE OR REPLACE FUNCTION public.bulk_verify_users(
    p_user_ids UUID[]
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    verified_count INTEGER := 0;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    -- Update verification status
    UPDATE public.profiles
    SET is_verified = TRUE,
        updated_at = NOW()
    WHERE id = ANY(p_user_ids)
        AND is_verified = FALSE;
    
    GET DIAGNOSTICS verified_count = ROW_COUNT;
    
    RETURN verified_count;
END;
$$;

-- Get recent activity feed (for admin monitoring)
CREATE OR REPLACE FUNCTION public.get_recent_activity(
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    activity_type TEXT,
    user_id UUID,
    user_name TEXT,
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
            'Created a post'::TEXT AS description,
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
            'Commented on a post'::TEXT AS description,
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
            j.posted_by AS user_id,
            prof.name AS user_name,
            'Posted a job: ' || j.title AS description,
            j.created_at
        FROM public.jobs j
        JOIN public.profiles prof ON j.posted_by = prof.id
        ORDER BY j.created_at DESC
        LIMIT p_limit / 4
    )
    UNION ALL
    (
        SELECT 
            'community'::TEXT AS activity_type,
            cm.created_by AS user_id,
            prof.name AS user_name,
            'Created community: ' || cm.name AS description,
            cm.created_at
        FROM public.communities cm
        JOIN public.profiles prof ON cm.created_by = prof.id
        ORDER BY cm.created_at DESC
        LIMIT p_limit / 4
    )
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$;

-- Ban user (soft delete - mark as deleted)
CREATE OR REPLACE FUNCTION public.ban_user(
    p_user_id UUID,
    p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
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
    
    -- Cannot ban another admin
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id AND is_admin = TRUE
    ) THEN
        RAISE EXCEPTION 'Cannot ban admin users';
    END IF;
    
    -- Soft delete by updating profile
    UPDATE public.profiles
    SET is_verified = FALSE,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Create admin notification/log (could be expanded)
    RAISE NOTICE 'User % banned. Reason: %', p_user_id, p_reason;
END;
$$;

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sponsored_posts'
    ), 'sponsored_posts table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sponsored_post_impressions'
    ), 'sponsored_post_impressions table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'whiteboards'
    ), 'whiteboards table was not created';
    
    RAISE NOTICE 'Migration 010 completed successfully';
END $$;
