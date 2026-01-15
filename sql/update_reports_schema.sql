-- Upgrade Reports Table to support Posts and Jobs
-- Originally it only supported 'reported_id' (User). 
-- We need 'target_id' (Generic UUID) and 'type' (Content Type).

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS target_id UUID,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'user';

-- Optional: Add metadata column for extra info (like post content snippet)
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Drop the old constraint if we want target_id to be flexible (not necessarily a profile)
-- 'reported_id' can stay for backward compat or strictly for user reports.

-- Update policies to ensure admins can see these new columns (RLS usually covers rows, but good to be safe)
-- Existing RLS is fine.
