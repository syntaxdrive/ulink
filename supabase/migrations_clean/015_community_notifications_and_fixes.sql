-- Migration: Community System Fixes
-- Description: Adds status to community_members, notifications for join requests, and fixes member count

-- 1. Ensure 'status' column exists in community_members
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'community_members' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.community_members 
        ADD COLUMN status TEXT CHECK (status IN ('active', 'pending', 'rejected')) DEFAULT 'active' NOT NULL;
    END IF;
END $$;

-- 2. Add member_count to communities for efficient display
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS members_count INTEGER DEFAULT 0 NOT NULL;

-- 3. Update existing counts (if any)
UPDATE public.communities c
SET members_count = (
    SELECT count(*) 
    FROM public.community_members cm 
    WHERE cm.community_id = c.id AND cm.status = 'active'
);

-- 4. Function & Trigger to maintain members_count
CREATE OR REPLACE FUNCTION public.maintain_community_members_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.status = 'active') THEN
            UPDATE public.communities SET members_count = members_count + 1 WHERE id = NEW.community_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.status = 'pending' AND NEW.status = 'active') THEN
            UPDATE public.communities SET members_count = members_count + 1 WHERE id = NEW.community_id;
        ELSIF (OLD.status = 'active' AND NEW.status != 'active') THEN
            UPDATE public.communities SET members_count = members_count - 1 WHERE id = NEW.community_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.status = 'active') THEN
            UPDATE public.communities SET members_count = members_count - 1 WHERE id = OLD.community_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_maintain_community_members_count ON public.community_members;
CREATE TRIGGER tr_maintain_community_members_count
    AFTER INSERT OR UPDATE OR DELETE ON public.community_members
    FOR EACH ROW
    EXECUTE FUNCTION public.maintain_community_members_count();

-- 5. Expand notifications 'type' check
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'like',
    'comment',
    'follow',
    'connection_request',
    'connection_accepted',
    'message',
    'mention',
    'job_application',
    'community_invite',
    'community_join_request',
    'community_join_accepted',
    'course_update',
    'admin_announcement'
));

-- 6. Trigger for community join requests
CREATE OR REPLACE FUNCTION public.trigger_notify_community_join_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    owner_id UUID;
    applicant_name TEXT;
    community_name TEXT;
BEGIN
    IF NEW.status = 'pending' THEN
        -- Get community owner and name
        SELECT created_by, name INTO owner_id, community_name
        FROM public.communities
        WHERE id = NEW.community_id;
        
        -- Get applicant name
        SELECT name INTO applicant_name
        FROM public.profiles
        WHERE id = NEW.user_id;
        
        -- Create notification
        PERFORM public.create_notification(
            owner_id,
            'community_join_request',
            'Community Join Request',
            applicant_name || ' wants to join ' || community_name,
            jsonb_build_object('community_id', NEW.community_id, 'user_id', NEW.user_id),
            '/communities/' || (SELECT slug FROM public.communities WHERE id = NEW.community_id),
            NEW.user_id
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_community_join_request ON public.community_members;
CREATE TRIGGER notify_on_community_join_request
    AFTER INSERT ON public.community_members
    FOR EACH ROW
    WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION public.trigger_notify_community_join_request();

-- 7. Trigger for community join acceptance
CREATE OR REPLACE FUNCTION public.trigger_notify_community_join_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    community_name TEXT;
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'active' THEN
        -- Get community name
        SELECT name INTO community_name
        FROM public.communities
        WHERE id = NEW.community_id;
        
        -- Create notification
        PERFORM public.create_notification(
            NEW.user_id,
            'community_join_accepted',
            'Community Request Accepted',
            'Your request to join ' || community_name || ' has been approved!',
            jsonb_build_object('community_id', NEW.community_id),
            '/communities/' || (SELECT slug FROM public.communities WHERE id = NEW.community_id),
            (SELECT created_by FROM public.communities WHERE id = NEW.community_id)
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_community_join_accepted ON public.community_members;
CREATE TRIGGER notify_on_community_join_accepted
    AFTER UPDATE ON public.community_members
    FOR EACH ROW
    WHEN (OLD.status = 'pending' AND NEW.status = 'active')
    EXECUTE FUNCTION public.trigger_notify_community_join_accepted();
