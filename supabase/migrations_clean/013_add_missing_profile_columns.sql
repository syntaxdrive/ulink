-- Migration 013: Add missing profile columns
-- Adds youtube_url, tiktok_url, whatsapp_url, certificates, projects (alias)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_url TEXT,
  ADD COLUMN IF NOT EXISTS certificates JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb;

-- Verify
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('youtube_url','tiktok_url','whatsapp_url','certificates','projects');
