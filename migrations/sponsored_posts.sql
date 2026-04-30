-- ============================================================
-- Migration: Sponsored Posts Feature
-- Purpose:   Adds support for sponsored campaigns with tracking,
--            prioritization, and admin management.
-- ============================================================

-- 1. Create Sponsored Posts Table
CREATE TABLE IF NOT EXISTS public.sponsored_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    cta_text TEXT DEFAULT 'Learn More',
    cta_url TEXT,
    target_audience TEXT DEFAULT 'all',
    start_date TIMESTAMPTZ DEFAULT now(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 5,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    max_impressions INTEGER,
    max_clicks INTEGER
);

-- 2. Create Sponsored Post Impressions Table (for detailed tracking)
CREATE TABLE IF NOT EXISTS public.sponsored_post_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsored_post_id UUID REFERENCES public.sponsored_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    clicked BOOLEAN DEFAULT false,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Functions for atomic counters
CREATE OR REPLACE FUNCTION increment_sponsored_post_impression(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE sponsored_posts
    SET impressions = impressions + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_sponsored_post_click(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE sponsored_posts
    SET clicks = clicks + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RLS Policies
ALTER TABLE public.sponsored_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_post_impressions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to sponsored_posts"
ON public.sponsored_posts
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- Everyone can read active sponsored posts
CREATE POLICY "Everyone can read active sponsored_posts"
ON public.sponsored_posts
FOR SELECT
TO authenticated
USING (
    is_active = true AND (end_date IS NULL OR end_date > now())
);

-- Tracking policies
CREATE POLICY "Users can insert their own impressions"
ON public.sponsored_post_impressions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all impressions"
ON public.sponsored_post_impressions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sponsored_posts_updated_at
BEFORE UPDATE ON sponsored_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
