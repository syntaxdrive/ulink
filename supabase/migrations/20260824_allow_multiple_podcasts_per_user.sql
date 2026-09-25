-- Migration: Allow up to 3 podcast shows per student creator

-- 1. Drop old 1-show unique constraints
ALTER TABLE public.podcasts DROP CONSTRAINT IF EXISTS podcasts_creator_id_unique;
ALTER TABLE public.podcasts DROP CONSTRAINT IF EXISTS podcast_creator_id_unique;
ALTER TABLE public.podcasts DROP CONSTRAINT IF EXISTS podcasts_creator_id_key;

-- 2. Create trigger function to enforce maximum 3 podcasts per creator
CREATE OR REPLACE FUNCTION public.check_podcast_limit_per_user()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO current_count
    FROM public.podcasts
    WHERE creator_id = NEW.creator_id;

    IF current_count >= 3 THEN
        RAISE EXCEPTION 'Podcast limit reached: You can create a maximum of 3 podcast shows.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_podcast_limit ON public.podcasts;
CREATE TRIGGER trg_check_podcast_limit
    BEFORE INSERT ON public.podcasts
    FOR EACH ROW
    EXECUTE FUNCTION public.check_podcast_limit_per_user();

-- Ensure performance index on creator_id exists
CREATE INDEX IF NOT EXISTS idx_podcasts_creator_id ON public.podcasts(creator_id);
