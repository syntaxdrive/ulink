-- Migration 002: Network & Social Graph
-- Description: Connections (LinkedIn-style) and Follows (Twitter-style) systems
-- Dependencies: 001_foundation_profiles_auth.sql
-- Generated: 2026-02-17

--------------------------------------------------------------------------------
-- 1. CONNECTIONS TABLE (Professional Network)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(requester_id, recipient_id),
    CHECK (requester_id != recipient_id) -- No self-connections
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
CREATE POLICY "Users can view their own connections"
    ON public.connections FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
CREATE POLICY "Users can create connection requests"
    ON public.connections FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Recipients can update connection status" ON public.connections;
CREATE POLICY "Recipients can update connection status"
    ON public.connections FOR UPDATE
    USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can delete their own connection requests" ON public.connections;
CREATE POLICY "Users can delete their own connection requests"
    ON public.connections FOR DELETE
    USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Indexes
CREATE INDEX IF NOT EXISTS connections_requester_id_idx ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS connections_recipient_id_idx ON public.connections(recipient_id);
CREATE INDEX IF NOT EXISTS connections_status_idx ON public.connections(status);
CREATE INDEX IF NOT EXISTS connections_created_at_idx ON public.connections(created_at DESC);

--------------------------------------------------------------------------------
-- 2. FOLLOWS TABLE (Asymmetric Social Following)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id) -- No self-follows
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone"
    ON public.follows FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others"
    ON public.follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
    ON public.follows FOR DELETE
    USING (auth.uid() = follower_id);

-- Indexes
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS follows_created_at_idx ON public.follows(created_at DESC);

--------------------------------------------------------------------------------
-- 3. TRIGGER - Update Follow Counts
--------------------------------------------------------------------------------

-- Add follower/following count columns to profiles (if not exist)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS connections_count INTEGER DEFAULT 0;

-- Function to update follow counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment followers_count for the user being followed
        UPDATE public.profiles
        SET followers_count = followers_count + 1
        WHERE id = NEW.following_id;
        
        -- Increment following_count for the follower
        UPDATE public.profiles
        SET following_count = following_count + 1
        WHERE id = NEW.follower_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement followers_count
        UPDATE public.profiles
        SET followers_count = GREATEST(0, followers_count - 1)
        WHERE id = OLD.following_id;
        
        -- Decrement following_count
        UPDATE public.profiles
        SET following_count = GREATEST(0, following_count - 1)
        WHERE id = OLD.follower_id;
    END IF;
    
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
CREATE TRIGGER on_follow_change
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_follow_counts();

-- Function to notify user of new follower
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Create notification for the user being followed
        INSERT INTO public.notifications (user_id, type, content, reference_id, created_by)
        VALUES (
            NEW.following_id,
            'follow',
            (SELECT name FROM public.profiles WHERE id = NEW.follower_id LIMIT 1) || ' started following you',
            NEW.follower_id,
            NEW.follower_id
        );
    END IF;
    
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_new_follower ON public.follows;
CREATE TRIGGER on_new_follower
    AFTER INSERT ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_follower();

--------------------------------------------------------------------------------
-- 4. NETWORK DISCOVERY FUNCTIONS
--------------------------------------------------------------------------------

-- Get suggested connections (smart algorithm)
CREATE OR REPLACE FUNCTION public.get_suggested_connections(
    current_user_id UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    username TEXT,
    avatar_url TEXT,
    university TEXT,
    headline TEXT,
    role TEXT,
    mutual_connections INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH my_connections AS (
        -- Get IDs of users I'm connected to
        SELECT 
            CASE 
                WHEN requester_id = current_user_id THEN recipient_id
                ELSE requester_id
            END AS connected_id
        FROM public.connections
        WHERE (requester_id = current_user_id OR recipient_id = current_user_id)
            AND status = 'accepted'
    ),
    my_requests AS (
        -- Get IDs of pending requests (sent or received)
        SELECT recipient_id AS pending_id FROM public.connections WHERE requester_id = current_user_id
        UNION
        SELECT requester_id FROM public.connections WHERE recipient_id = current_user_id
    ),
    current_user_profile AS (
        SELECT university FROM public.profiles WHERE profiles.id = current_user_id
    )
    SELECT 
        p.id,
        p.name,
        p.username,
        p.avatar_url,
        p.university,
        p.headline,
        p.role,
        COALESCE(mutual.count, 0)::INTEGER AS mutual_connections
    FROM public.profiles p
    CROSS JOIN current_user_profile cup
    LEFT JOIN LATERAL (
        -- Count mutual connections
        SELECT COUNT(*)::INTEGER AS count
        FROM public.connections c1
        JOIN public.connections c2 
            ON ((c1.requester_id = p.id OR c1.recipient_id = p.id) 
                AND (c2.requester_id = current_user_id OR c2.recipient_id = current_user_id)
                AND c1.status = 'accepted' AND c2.status = 'accepted')
    ) mutual ON true
    WHERE p.id != current_user_id
        AND p.id NOT IN (SELECT connected_id FROM my_connections)
        AND p.id NOT IN (SELECT pending_id FROM my_requests)
    ORDER BY 
        -- Same university boost
        CASE WHEN p.university = cup.university THEN 1 ELSE 0 END DESC,
        -- Mutual connections boost
        mutual.count DESC,
        -- Recent activity boost
        p.last_seen DESC NULLS LAST,
        -- Creation date
        p.created_at DESC
    LIMIT limit_count;
END;
$$;

-- Search all users
CREATE OR REPLACE FUNCTION public.search_all_users(
    current_user_id UUID,
    search_query TEXT
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    username TEXT,
    avatar_url TEXT,
    university TEXT,
    headline TEXT,
    role TEXT,
    is_connected BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH my_connections AS (
        SELECT 
            CASE 
                WHEN requester_id = current_user_id THEN recipient_id
                ELSE requester_id
            END AS connected_id
        FROM public.connections
        WHERE (requester_id = current_user_id OR recipient_id = current_user_id)
            AND status = 'accepted'
    )
    SELECT 
        p.id,
        p.name,
        p.username,
        p.avatar_url,
        p.university,
        p.headline,
        p.role,
        EXISTS (SELECT 1 FROM my_connections WHERE connected_id = p.id) AS is_connected
    FROM public.profiles p
    WHERE p.id != current_user_id
        AND (
            p.name ILIKE '%' || search_query || '%' OR
            p.username ILIKE '%' || search_query || '%' OR
            p.university ILIKE '%' || search_query || '%' OR
            p.headline ILIKE '%' || search_query || '%'
        )
    ORDER BY 
        -- Exact matches first
        CASE WHEN LOWER(p.name) = LOWER(search_query) THEN 0 ELSE 1 END,
        CASE WHEN LOWER(p.username) = LOWER(search_query) THEN 0 ELSE 1 END,
        -- Then partial matches
        p.points DESC,
        p.created_at DESC
    LIMIT 50;
END;
$$;

-- Get suggested follows
CREATE OR REPLACE FUNCTION public.get_suggested_follows(
    user_id_param UUID,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    username TEXT,
    avatar_url TEXT,
    university TEXT,
    headline TEXT,
    is_verified BOOLEAN,
    followers_count INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH my_follows AS (
        SELECT following_id FROM public.follows WHERE follower_id = user_id_param
    ),
    current_user_profile AS (
        SELECT university FROM public.profiles WHERE profiles.id = user_id_param
    )
    SELECT 
        p.id,
        p.name,
        p.username,
        p.avatar_url,
        p.university,
        p.headline,
        p.is_verified,
        p.followers_count
    FROM public.profiles p
    CROSS JOIN current_user_profile cup
    WHERE p.id != user_id_param
        AND p.id NOT IN (SELECT following_id FROM my_follows)
    ORDER BY
        -- Verified users first
        p.is_verified DESC,
        -- Same university
        CASE WHEN p.university = cup.university THEN 1 ELSE 0 END DESC,
        -- Popular users
        p.followers_count DESC,
        -- Active users
        p.points DESC
    LIMIT limit_count;
END;
$$;

--------------------------------------------------------------------------------
-- 5. RATE LIMITING (Optional but Recommended)
--------------------------------------------------------------------------------

-- Function to check connection request rate limit
CREATE OR REPLACE FUNCTION public.check_connection_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    recent_requests INTEGER;
BEGIN
    -- Count requests from this user in last hour
    SELECT COUNT(*) INTO recent_requests
    FROM public.connections
    WHERE requester_id = NEW.requester_id
        AND created_at > NOW() - INTERVAL '1 hour';
    
    -- Limit: 20 requests per hour
    IF recent_requests >= 20 THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait before sending more connection requests.';
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_connection_rate_limit ON public.connections;
CREATE TRIGGER enforce_connection_rate_limit
    BEFORE INSERT ON public.connections
    FOR EACH ROW
    EXECUTE FUNCTION public.check_connection_rate_limit();

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'connections'
    ), 'connections table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'follows'
    ), 'follows table was not created';
    
    RAISE NOTICE 'Migration 002 completed successfully';
END $$;
