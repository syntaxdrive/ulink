-- Add Organization Profile Fields
-- Run this migration to add new fields for organization profiles

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.website_url IS 'Organization website URL';
COMMENT ON COLUMN public.profiles.facebook_url IS 'Organization Facebook page URL';
COMMENT ON COLUMN public.profiles.industry IS 'Organization industry/sector (e.g., Technology, Finance, Healthcare)';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('website_url', 'facebook_url', 'industry')
ORDER BY column_name;
