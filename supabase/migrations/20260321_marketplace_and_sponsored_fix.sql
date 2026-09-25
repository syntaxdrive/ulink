-- ============================================================================
-- MARKETPLACE LISTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'Other',
    condition TEXT NOT NULL DEFAULT 'Good',
    images TEXT[] DEFAULT '{}',
    is_sold BOOLEAN DEFAULT false,
    contact_info TEXT,
    university TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON public.marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_university ON public.marketplace_listings(university);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON public.marketplace_listings(is_sold, created_at DESC)
    WHERE is_sold = false;

-- RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view listings
CREATE POLICY "Anyone can view marketplace listings"
    ON public.marketplace_listings FOR SELECT
    USING (true);

-- Authenticated users can create listings
CREATE POLICY "Users can create marketplace listings"
    ON public.marketplace_listings FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own listings (e.g. mark as sold)
CREATE POLICY "Sellers can update own listings"
    ON public.marketplace_listings FOR UPDATE
    USING (auth.uid() = seller_id);

-- Sellers can delete their own listings
CREATE POLICY "Sellers can delete own listings"
    ON public.marketplace_listings FOR DELETE
    USING (auth.uid() = seller_id);

-- Realtime (already added via global realtime script)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_listings;
ALTER TABLE public.marketplace_listings REPLICA IDENTITY FULL;

-- ============================================================================
-- FIX: Sponsored posts admin RLS policy (uses is_admin, not role='admin')
-- ============================================================================

-- Drop the broken policy and recreate with correct field
DROP POLICY IF EXISTS "Admins can manage sponsored posts" ON public.sponsored_posts;
CREATE POLICY "Admins can manage sponsored posts"
    ON public.sponsored_posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Also fix impressions admin policy
DROP POLICY IF EXISTS "Admins can view all impressions" ON public.sponsored_post_impressions;
CREATE POLICY "Admins can view all impressions"
    ON public.sponsored_post_impressions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

COMMENT ON TABLE public.marketplace_listings IS 'Campus marketplace for buying/selling textbooks, electronics, etc.';
