-- Create sponsored_posts table for featured ads
CREATE TABLE IF NOT EXISTS sponsored_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Admin who created the ad (not shown in feed)
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Organization this ad appears as (shows their profile)
    organization_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Ad content (similar to regular posts)
    content TEXT NOT NULL, -- Main text content
    media_url TEXT, -- Image or video URL
    media_type TEXT CHECK (media_type IN ('image', 'video', NULL)), -- Type of media
    
    -- Call to action
    cta_text TEXT DEFAULT 'Learn More', -- Button text
    cta_url TEXT, -- Where the button links to
    
    -- Targeting (optional - can be expanded later)
    target_audience TEXT DEFAULT 'all', -- 'all', 'students', 'organizations', etc.
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher priority = shown more often
    
    -- Analytics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    -- Budget/limits (optional)
    max_impressions INTEGER,
    max_clicks INTEGER,
    
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date)
);

-- Create index for active ads query
CREATE INDEX idx_sponsored_posts_active ON sponsored_posts(is_active, start_date, end_date)
    WHERE is_active = true;

CREATE INDEX idx_sponsored_posts_priority ON sponsored_posts(priority DESC);

-- Create table for tracking individual impressions (optional, for detailed analytics)
CREATE TABLE IF NOT EXISTS sponsored_post_impressions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsored_post_id UUID REFERENCES sponsored_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    clicked BOOLEAN DEFAULT false,
    clicked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_impressions_sponsored_post ON sponsored_post_impressions(sponsored_post_id);
CREATE INDEX idx_impressions_user ON sponsored_post_impressions(user_id);

-- RLS Policies for sponsored_posts
ALTER TABLE sponsored_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view active sponsored posts
CREATE POLICY "Anyone can view active sponsored posts"
    ON sponsored_posts
    FOR SELECT
    USING (
        is_active = true 
        AND start_date <= NOW() 
        AND (end_date IS NULL OR end_date > NOW())
        AND (max_impressions IS NULL OR impressions < max_impressions)
        AND (max_clicks IS NULL OR clicks < max_clicks)
    );

-- Only admins can insert/update/delete sponsored posts
CREATE POLICY "Admins can manage sponsored posts"
    ON sponsored_posts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS for impressions
ALTER TABLE sponsored_post_impressions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own impressions
CREATE POLICY "Users can create impressions"
    ON sponsored_post_impressions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own impressions
CREATE POLICY "Users can view own impressions"
    ON sponsored_post_impressions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all impressions
CREATE POLICY "Admins can view all impressions"
    ON sponsored_post_impressions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Function to increment impression count
CREATE OR REPLACE FUNCTION increment_sponsored_post_impression(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE sponsored_posts
    SET impressions = impressions + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_sponsored_post_click(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE sponsored_posts
    SET clicks = clicks + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_sponsored_post_impression TO authenticated;
GRANT EXECUTE ON FUNCTION increment_sponsored_post_click TO authenticated;

COMMENT ON TABLE sponsored_posts IS 'Featured ads that appear in user feeds';
COMMENT ON TABLE sponsored_post_impressions IS 'Tracks when users view and click sponsored posts';
