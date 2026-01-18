-- ==============================================================================
-- AUTO VERIFICATION SYSTEM (1000 Followers = Blue Tick)
-- ==============================================================================
-- This script:
-- 1. Adds necessary columns to profiles if missing.
-- 2. Sets up a secure system to auto-verify users with 1000+ followers.
-- 3. Protects sensitive columns (verified status, counts) from manual tampering.

-- 1. SCHEMA ROBUSTNESS
-- ==============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gold_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. ENHANCED PROTECTION TRIGGER (Prevents hacking verification/counts)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.protect_privileged_profile_columns()
RETURNS TRIGGER AS $$
DECLARE
  is_bypass TEXT;
BEGIN
  -- Check for bypass flag (set by system functions like update_follow_counts)
  BEGIN
    is_bypass := current_setting('app.bypass_protection', true);
  EXCEPTION WHEN OTHERS THEN
    is_bypass := 'false';
  END;

  IF is_bypass = 'true' THEN
    RETURN NEW; -- Allow system to update anything
  END IF;

  -- 1. Prevent User from changing Verification/Admin/Gold status
  IF (NEW.is_admin IS DISTINCT FROM OLD.is_admin) OR
     (NEW.is_verified IS DISTINCT FROM OLD.is_verified) OR
     (NEW.gold_verified IS DISTINCT FROM OLD.gold_verified) THEN
      -- Revert to old value
      NEW.is_admin := OLD.is_admin;
      NEW.is_verified := OLD.is_verified;
      NEW.gold_verified := OLD.gold_verified;
  END IF;

  -- 2. Prevent User from spoofing Counts
  IF (NEW.followers_count IS DISTINCT FROM OLD.followers_count) OR
     (NEW.following_count IS DISTINCT FROM OLD.following_count) THEN
      NEW.followers_count := OLD.followers_count;
      NEW.following_count := OLD.following_count;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure protection trigger is active
DROP TRIGGER IF EXISTS protect_profile_privileges ON public.profiles;
CREATE TRIGGER protect_profile_privileges
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_privileged_profile_columns();


-- 3. UPDATED FOLLOW LOGIC (Handles Counts + 1000 Follower Check)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_follow_counts() RETURNS TRIGGER AS $$
BEGIN
    -- Set bypass flag so we can update counts and verification
    PERFORM set_config('app.bypass_protection', 'true', true);

    IF TG_OP = 'INSERT' THEN
        -- Increase Counts safely (handling nulls)
        UPDATE public.profiles 
        SET followers_count = COALESCE(followers_count, 0) + 1 
        WHERE id = NEW.following_id;

        UPDATE public.profiles 
        SET following_count = COALESCE(following_count, 0) + 1 
        WHERE id = NEW.follower_id;
        
        -- CHECK FOR AUTO-VERIFICATION (1000 threshold)
        -- Only verify if not already verified (preserves "already verified" people)
        UPDATE public.profiles
        SET is_verified = true
        WHERE id = NEW.following_id
        AND COALESCE(followers_count, 0) >= 1000 
        AND is_verified IS NOT TRUE;

        -- Send Notification
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
            NULL; -- Ignore notification errors
        END;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease Counts
        UPDATE public.profiles 
        SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) 
        WHERE id = OLD.following_id;

        UPDATE public.profiles 
        SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) 
        WHERE id = OLD.follower_id;
        
        -- We do NOT remove verification if they drop below 1000.
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. BIND TRIGGER
-- ==============================================================================
DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
CREATE TRIGGER on_follow_change
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- 5. INITIAL SYNC (Fixes existing counts)
-- ==============================================================================
UPDATE public.profiles p
SET 
    followers_count = (SELECT count(*) FROM public.follows f WHERE f.following_id = p.id),
    following_count = (SELECT count(*) FROM public.follows f WHERE f.follower_id = p.id);

