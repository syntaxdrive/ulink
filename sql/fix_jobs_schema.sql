-- ==============================================================================
-- JOBS SCHEMA & PERMISSIONS FIX
-- ==============================================================================
-- This script guarantees the Jobs feature works for Organizations by:
-- 1. Ensuring the 'creator_id' column exists (critical for ownership/deletion)
-- 2. Adding the 'status' column for Open/Closed management
-- 3. Resetting and fixing all Job-related security policies

-- 1. SCHEMA UPDATES
-- ==============================================================================

-- Ensure creator_id exists (might be missing in original schema)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'creator_id') THEN
        ALTER TABLE public.jobs ADD COLUMN creator_id uuid REFERENCES public.profiles(id);
        
        -- Try to migrate existing jobs if any (best guess: map to admin or leave null)
        -- We can't easily guess owner for existing rows if not stored.
        -- But for new rows it will be enforced.
    END IF;
END $$;

-- Ensure status exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'status') THEN
        ALTER TABLE public.jobs ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'closed'));
    END IF;
END $$;

-- Add performant indexes
CREATE INDEX IF NOT EXISTS idx_jobs_creator_id ON public.jobs(creator_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- 2. SECURITY POLICIES (RLS)
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- DROP ALL EXISTING POLICIES (Clean Slate)
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
DROP POLICY IF EXISTS "Jobs are viewable by everyone." ON public.jobs;
DROP POLICY IF EXISTS "Orgs can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Organizations can create jobs." ON public.jobs;
DROP POLICY IF EXISTS "Employers can update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can delete own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.jobs;

-- CREATE NEW ROBUST POLICIES

-- 1. SELECT: Everyone can view details
CREATE POLICY "Jobs are viewable by everyone" 
ON public.jobs FOR SELECT 
USING (true);

-- 2. INSERT: Organizations can create jobs
CREATE POLICY "Organizations can create jobs" 
ON public.jobs FOR INSERT 
WITH CHECK (
    auth.uid() = creator_id
    -- Optional: Enforce 'org' role if your app requires strict role separation
    -- AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'org')
);

-- 3. UPDATE: Creators can update their own jobs
CREATE POLICY "Creators can update own jobs" 
ON public.jobs FOR UPDATE 
USING (auth.uid() = creator_id);

-- 4. DELETE: Creators can delete their own jobs
CREATE POLICY "Creators can delete own jobs" 
ON public.jobs FOR DELETE 
USING (auth.uid() = creator_id);

-- Grant permissions to authenticated users
GRANT ALL ON TABLE public.jobs TO authenticated;
GRANT ALL ON TABLE public.jobs TO service_role;
