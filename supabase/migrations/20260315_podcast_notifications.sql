-- Migration: Podcast Notifications Triggers
-- 1. Podcast Follows Trigger
CREATE OR REPLACE FUNCTION public.trigger_notify_podcast_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    p_creator_id UUID;
    p_title TEXT;
    follower_name TEXT;
BEGIN
    SELECT creator_id, title INTO p_creator_id, p_title
    FROM public.podcasts
    WHERE id = NEW.podcast_id;

    SELECT name INTO follower_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF p_creator_id != NEW.user_id THEN
        PERFORM public.create_notification(
            p_creator_id,
            'podcast_follow',
            'New Podcast Follower',
            follower_name || ' followed your podcast: ' || p_title,
            jsonb_build_object('podcast_id', NEW.podcast_id, 'follower_id', NEW.user_id),
            '/app/podcasts/' || NEW.podcast_id,
            NEW.user_id
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_podcast_follow ON public.podcast_follows;
CREATE TRIGGER notify_on_podcast_follow
    AFTER INSERT ON public.podcast_follows
    FOR EACH ROW EXECUTE FUNCTION public.trigger_notify_podcast_follow();

-- 2. New Episode Trigger
CREATE OR REPLACE FUNCTION public.trigger_notify_podcast_episode()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    p_title TEXT;
    follower_record RECORD;
BEGIN
    SELECT title INTO p_title
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
            NEW.podcast_id -- Using podcast_id as safe reference
        );
    END LOOP;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_podcast_episode ON public.podcast_episodes;
CREATE TRIGGER notify_on_podcast_episode
    AFTER INSERT ON public.podcast_episodes
    FOR EACH ROW EXECUTE FUNCTION public.trigger_notify_podcast_episode();
