-- Migration: Allow creators to have multiple independent podcast shows
ALTER TABLE public.podcasts DROP CONSTRAINT IF EXISTS podcast_creator_id_unique;
ALTER TABLE public.podcasts DROP CONSTRAINT IF EXISTS podcasts_creator_id_key;
ALTER TABLE public.podcasts DROP CONSTRAINT IF EXISTS podcasts_creator_id_unique;

-- Ensure performance index on creator_id exists
CREATE INDEX IF NOT EXISTS idx_podcasts_creator_id ON public.podcasts(creator_id);
