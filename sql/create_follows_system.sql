-- Create Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent self-follows and duplicate follows
    CONSTRAINT no_self_follow CHECK (follower_id != following_id),
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at DESC);

-- Add follower/following counts to profiles (denormalized for performance)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Follows
CREATE POLICY "Anyone can view follows" 
ON public.follows FOR SELECT 
USING (true);

CREATE POLICY "Users can follow others" 
ON public.follows FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
ON public.follows FOR DELETE 
USING (auth.uid() = follower_id);

-- Function to update follower counts
CREATE OR REPLACE FUNCTION public.update_follow_counts() 
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment follower count for the person being followed
        UPDATE public.profiles 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.following_id;
        
        -- Increment following count for the follower
        UPDATE public.profiles 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        -- Create notification for the person being followed
        INSERT INTO public.notifications (user_id, type, sender_id, content, created_at)
        VALUES (NEW.following_id, 'follow', NEW.follower_id, 'started following you', NOW());
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement follower count
        UPDATE public.profiles 
        SET followers_count = GREATEST(followers_count - 1, 0)
        WHERE id = OLD.following_id;
        
        -- Decrement following count
        UPDATE public.profiles 
        SET following_count = GREATEST(following_count - 1, 0)
        WHERE id = OLD.follower_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update counts automatically
DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
CREATE TRIGGER on_follow_change
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- Function to get mutual follows
CREATE OR REPLACE FUNCTION public.get_mutual_follows(user_id_param UUID)
RETURNS TABLE (
    mutual_user_id UUID,
    mutual_user_name TEXT,
    mutual_user_avatar TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        p.id,
        p.name,
        p.avatar_url
    FROM public.profiles p
    INNER JOIN public.follows f1 ON f1.following_id = p.id
    INNER JOIN public.follows f2 ON f2.follower_id = p.id
    WHERE f1.follower_id = user_id_param
      AND f2.following_id = user_id_param
      AND p.id != user_id_param
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get suggested users to follow (based on mutual connections)
CREATE OR REPLACE FUNCTION public.get_suggested_follows(user_id_param UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    suggested_user_id UUID,
    suggested_user_name TEXT,
    suggested_user_avatar TEXT,
    mutual_connections_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.avatar_url,
        COUNT(DISTINCT f2.follower_id) as mutual_count
    FROM public.profiles p
    -- Find users that people I follow are also following
    INNER JOIN public.follows f1 ON f1.following_id = p.id
    INNER JOIN public.follows f2 ON f2.following_id = f1.follower_id
    WHERE f2.follower_id = user_id_param
      AND p.id != user_id_param
      -- Exclude users I already follow
      AND NOT EXISTS (
          SELECT 1 FROM public.follows f3 
          WHERE f3.follower_id = user_id_param 
          AND f3.following_id = p.id
      )
    GROUP BY p.id, p.name, p.avatar_url
    ORDER BY mutual_count DESC, p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
