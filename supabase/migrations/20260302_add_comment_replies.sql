-- Migration to add threaded comments and reply notifications
-- Adds parent_id to comments table and a trigger for reply notifications

-- 1. Add parent_id column
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- 2. Add index for performance
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);

-- 3. Trigger to notify parent comment author when someone replies
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
    -- Only run if this is a reply (has parent_id)
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get parent comment author and a snippet of the comment
    SELECT author_id, content INTO parent_author_id, parent_comment_snippet
    FROM public.comments
    WHERE id = NEW.parent_id;

    -- Don't notify if user replied to their own comment
    IF parent_author_id = NEW.author_id THEN
        RETURN NEW;
    END IF;

    -- Get replier's name
    SELECT name INTO replier_name
    FROM public.profiles
    WHERE id = NEW.author_id;

    -- Create notification
    PERFORM public.create_notification(
        parent_author_id,
        'comment', -- Reuse comment type or we could add 'reply' later if needed
        'New Reply',
        replier_name || ' replied to your comment: "' || substring(parent_comment_snippet from 1 for 30) || '..."',
        jsonb_build_object(
            'post_id', NEW.post_id,
            'comment_id', NEW.id,
            'parent_id', NEW.parent_id
        ),
        '/posts/' || NEW.post_id,
        NEW.author_id
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_comment_replied ON public.comments;
CREATE TRIGGER notify_on_comment_replied
    AFTER INSERT ON public.comments
    FOR EACH ROW
    WHEN (NEW.parent_id IS NOT NULL)
    EXECUTE FUNCTION public.trigger_notify_comment_replied();
