-- Fix podcast episode notification trigger
CREATE OR REPLACE FUNCTION public.trigger_notify_podcast_episode()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    p_title TEXT;
    p_creator_id UUID;
    follower_record RECORD;
BEGIN
    SELECT title, creator_id INTO p_title, p_creator_id
    FROM public.podcasts
    WHERE id = NEW.podcast_id;

    FOR follower_record IN 
        SELECT user_id FROM public.podcast_follows WHERE podcast_id = NEW.podcast_id
    LOOP
        PERFORM public.create_notification(
            follower_record.user_id,
            'podcast_episode',
            'New Episode Out',
            'A new episode has been uploaded to ' || p_title || ': ' || NEW.title,
            jsonb_build_object('podcast_id', NEW.podcast_id, 'episode_id', NEW.id),
            '/app/podcasts/' || NEW.podcast_id,
            p_creator_id -- FIX: Use the podcast creator as the related user (FK constraint safe)
        );
    END LOOP;

    RETURN NEW;
END;
$$;
