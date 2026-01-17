-- Reinstall Follow System (Safe Update)

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id),
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- 3. RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- 4. Trigger Function (Updated with correct notification column sender_id)
CREATE OR REPLACE FUNCTION public.update_follow_counts() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increase Counts
        UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        
        -- Send Notification (Safe Insert)
        BEGIN
            INSERT INTO public.notifications (user_id, type, sender_id, link, content, created_at)
            VALUES (
                NEW.following_id, 
                'follow', 
                NEW.follower_id, 
                '/app/profile/' || NEW.follower_id,
                'started following you', 
                NOW()
            );
        EXCEPTION WHEN OTHERS THEN
            -- Ignore notification failure if schema mismatch, keep follow working
        END;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease Counts
        UPDATE public.profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
        UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger
DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
CREATE TRIGGER on_follow_change
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();


-- 5. Updated Suggestion Function (Robust)
DROP FUNCTION IF EXISTS public.get_suggested_follows(uuid, integer);
CREATE OR REPLACE FUNCTION public.get_suggested_follows(user_id_param UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    id UUID,
    name TEXT,
    avatar_url TEXT,
    headline TEXT,
    mutual_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, 
        p.name, 
        p.avatar_url, 
        p.headline,
        COUNT(DISTINCT f2.follower_id) as mutual_count
    FROM public.profiles p
    -- Join follows to find friends of friends
    LEFT JOIN public.follows f1 ON f1.following_id = p.id
    LEFT JOIN public.follows f2 ON f2.following_id = f1.follower_id AND f2.follower_id = user_id_param
    WHERE p.id != user_id_param
      -- Ensure not already following
      AND NOT EXISTS (
          SELECT 1 FROM public.follows f3 
          WHERE f3.follower_id = user_id_param 
          AND f3.following_id = p.id
      )
    GROUP BY p.id, p.name, p.avatar_url, p.headline
    ORDER BY mutual_count DESC, p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
