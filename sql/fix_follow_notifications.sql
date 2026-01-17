-- Fix for follow notification trigger
-- This updates the trigger to use sender_id instead of actor_id

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
