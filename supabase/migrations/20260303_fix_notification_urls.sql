-- Migration to fix notification action URLs
-- 1. Update existing notifications
UPDATE public.notifications
SET action_url = CASE 
    WHEN action_url LIKE '/posts/%' THEN '/app/post/' || substring(action_url from 8)
    WHEN action_url LIKE '/profile/%' THEN '/app/profile/' || substring(action_url from 10)
    WHEN action_url LIKE '/jobs/%' THEN '/app/jobs/' || substring(action_url from 7)
    WHEN action_url LIKE '/communities/%' THEN '/app/communities/' || substring(action_url from 14)
    WHEN action_url = '/network' THEN '/app/network'
    WHEN action_url = '/messages' THEN '/app/messages'
    WHEN action_url = '/notifications' THEN '/app/notifications'
    WHEN action_url NOT LIKE '/app/%' AND action_url LIKE '/%' THEN '/app' || action_url
    ELSE action_url
END
WHERE action_url IS NOT NULL 
  AND action_url NOT LIKE '/app/%'
  AND action_url NOT LIKE 'http%';

-- 2. Update Triggers to use correct /app prefixes for future notifications

-- Job Applications
CREATE OR REPLACE FUNCTION public.trigger_notify_job_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    job_creator_id UUID;
    applicant_name TEXT;
    job_title TEXT;
BEGIN
    SELECT j.posted_by, j.title INTO job_creator_id, job_title
    FROM public.jobs j
    WHERE j.id = NEW.job_id;
    
    SELECT name INTO applicant_name
    FROM public.profiles
    WHERE id = NEW.applicant_id;
    
    PERFORM public.create_notification(
        job_creator_id,
        'job_application',
        'New Job Application',
        applicant_name || ' applied for your job posting: ' || job_title,
        jsonb_build_object('job_id', NEW.job_id, 'application_id', NEW.id),
        '/app/jobs/' || NEW.job_id || '/applications',
        NEW.applicant_id
    );
    
    RETURN NEW;
END;
$$;

-- Follows
CREATE OR REPLACE FUNCTION public.trigger_notify_new_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    follower_name TEXT;
BEGIN
    SELECT name INTO follower_name
    FROM public.profiles
    WHERE id = NEW.follower_id;
    
    PERFORM public.create_notification(
        NEW.following_id,
        'follow',
        'New Follower',
        follower_name || ' started following you',
        jsonb_build_object('follower_id', NEW.follower_id),
        '/app/profile/' || NEW.follower_id,
        NEW.follower_id
    );
    
    RETURN NEW;
END;
$$;

-- Connection Requests
CREATE OR REPLACE FUNCTION public.trigger_notify_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_name TEXT;
BEGIN
    IF NEW.status = 'pending' THEN
        SELECT name INTO requester_name
        FROM public.profiles
        WHERE id = NEW.requester_id;
        
        PERFORM public.create_notification(
            NEW.recipient_id,
            'connection_request',
            'Connection Request',
            requester_name || ' wants to connect with you',
            jsonb_build_object('connection_id', NEW.id, 'requester_id', NEW.requester_id),
            '/app/network',
            NEW.requester_id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Connection Accepted
CREATE OR REPLACE FUNCTION public.trigger_notify_connection_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    recipient_name TEXT;
BEGIN
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        SELECT name INTO recipient_name
        FROM public.profiles
        WHERE id = NEW.recipient_id;
        
        PERFORM public.create_notification(
            NEW.requester_id,
            'connection_accepted',
            'Connection Accepted',
            recipient_name || ' accepted your connection request',
            jsonb_build_object('connection_id', NEW.id, 'user_id', NEW.recipient_id),
            '/app/profile/' || NEW.recipient_id,
            NEW.recipient_id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Post Liked
CREATE OR REPLACE FUNCTION public.trigger_notify_post_liked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_author_id UUID;
    liker_name TEXT;
BEGIN
    SELECT author_id INTO post_author_id
    FROM public.posts
    WHERE id = NEW.post_id;
    
    IF post_author_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    SELECT name INTO liker_name
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    PERFORM public.create_notification(
        post_author_id,
        'like',
        'New Like',
        liker_name || ' liked your post',
        jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id),
        '/app/post/' || NEW.post_id,
        NEW.user_id
    );
    
    RETURN NEW;
END;
$$;

-- Post Commented
CREATE OR REPLACE FUNCTION public.trigger_notify_post_commented()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_author_id UUID;
    commenter_name TEXT;
BEGIN
    -- Only run for top-level comments (parent_id is NULL)
    -- Replies are handled by trigger_notify_comment_replied
    IF NEW.parent_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    SELECT author_id INTO post_author_id
    FROM public.posts
    WHERE id = NEW.post_id;
    
    IF post_author_id = NEW.author_id THEN
        RETURN NEW;
    END IF;
    
    SELECT name INTO commenter_name
    FROM public.profiles
    WHERE id = NEW.author_id;
    
    PERFORM public.create_notification(
        post_author_id,
        'comment',
        'New Comment',
        commenter_name || ' commented on your post',
        jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id),
        '/app/post/' || NEW.post_id,
        NEW.author_id
    );
    
    RETURN NEW;
END;
$$;

-- Comment Replies
CREATE OR REPLACE FUNCTION public.trigger_notify_comment_replied()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    parent_author_id UUID;
    replier_name TEXT;
    parent_comment_snippet TEXT;
BEGIN
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT author_id, content INTO parent_author_id, parent_comment_snippet
    FROM public.comments
    WHERE id = NEW.parent_id;

    IF parent_author_id = NEW.author_id THEN
        RETURN NEW;
    END IF;

    SELECT name INTO replier_name
    FROM public.profiles
    WHERE id = NEW.author_id;

    PERFORM public.create_notification(
        parent_author_id,
        'comment',
        'New Reply',
        replier_name || ' replied to your comment: "' || substring(parent_comment_snippet from 1 for 30) || '..."',
        jsonb_build_object(
            'post_id', NEW.post_id,
            'comment_id', NEW.id,
            'parent_id', NEW.parent_id
        ),
        '/app/post/' || NEW.post_id,
        NEW.author_id
    );

    RETURN NEW;
END;
$$;

-- Community Join Request
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
        SELECT created_by, name INTO owner_id, community_name
        FROM public.communities
        WHERE id = NEW.community_id;
        
        SELECT name INTO applicant_name
        FROM public.profiles
        WHERE id = NEW.user_id;
        
        PERFORM public.create_notification(
            owner_id,
            'community_join_request',
            'Community Join Request',
            applicant_name || ' wants to join ' || community_name,
            jsonb_build_object('community_id', NEW.community_id, 'user_id', NEW.user_id),
            '/app/communities/' || (SELECT slug FROM public.communities WHERE id = NEW.community_id),
            NEW.user_id
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Community Join Accepted
CREATE OR REPLACE FUNCTION public.trigger_notify_community_join_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    community_name TEXT;
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'active' THEN
        SELECT name INTO community_name
        FROM public.communities
        WHERE id = NEW.community_id;
        
        PERFORM public.create_notification(
            NEW.user_id,
            'community_join_accepted',
            'Community Request Accepted',
            'Your request to join ' || community_name || ' has been approved!',
            jsonb_build_object('community_id', NEW.community_id),
            '/app/communities/' || (SELECT slug FROM public.communities WHERE id = NEW.community_id),
            (SELECT created_by FROM public.communities WHERE id = NEW.community_id)
        );
    END IF;
    RETURN NEW;
END;
$$;
