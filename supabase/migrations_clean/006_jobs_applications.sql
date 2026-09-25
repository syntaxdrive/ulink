-- Migration 006: Jobs & Applications
-- Description: Job postings and application tracking system
-- Dependencies: 001_foundation_profiles_auth.sql
-- Generated: 2026-02-17

--------------------------------------------------------------------------------
-- 1. JOBS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    type TEXT CHECK (type IN ('Internship', 'Entry Level', 'Full Time')) NOT NULL,
    description TEXT,
    application_link TEXT,
    location TEXT,
    salary_range TEXT,
    deadline DATE,
    logo_url TEXT,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('active', 'closed')) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
CREATE POLICY "Jobs are viewable by everyone"
    ON public.jobs FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Organizations can create jobs" ON public.jobs;
CREATE POLICY "Organizations can create jobs"
    ON public.jobs FOR INSERT
    WITH CHECK (
        auth.uid() = creator_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.role = 'org'
        )
    );

DROP POLICY IF EXISTS "Creators can update their own jobs" ON public.jobs;
CREATE POLICY "Creators can update their own jobs"
    ON public.jobs FOR UPDATE
    USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can delete their own jobs" ON public.jobs;
CREATE POLICY "Creators can delete their own jobs"
    ON public.jobs FOR DELETE
    USING (auth.uid() = creator_id);

-- Indexes
CREATE INDEX IF NOT EXISTS jobs_creator_id_idx ON public.jobs(creator_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON public.jobs(status);
CREATE INDEX IF NOT EXISTS jobs_type_idx ON public.jobs(type);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_deadline_idx ON public.jobs(deadline);

--------------------------------------------------------------------------------
-- 2. JOB APPLICATIONS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('applied', 'interviewing', 'offer', 'rejected')) DEFAULT 'applied' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, job_id) -- One application per user per job
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;
CREATE POLICY "Users can view their own applications"
    ON public.job_applications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Job creators can view applications for their jobs" ON public.job_applications;
CREATE POLICY "Job creators can view applications for their jobs"
    ON public.job_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = job_applications.job_id
                AND jobs.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create their own applications" ON public.job_applications;
CREATE POLICY "Users can create their own applications"
    ON public.job_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own applications" ON public.job_applications;
CREATE POLICY "Users can update their own applications"
    ON public.job_applications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Job creators can update application status" ON public.job_applications;
CREATE POLICY "Job creators can update application status"
    ON public.job_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = job_applications.job_id
                AND jobs.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own applications" ON public.job_applications;
CREATE POLICY "Users can delete their own applications"
    ON public.job_applications FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS job_applications_user_id_idx ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS job_applications_job_id_idx ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS job_applications_status_idx ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS job_applications_created_at_idx ON public.job_applications(created_at DESC);

--------------------------------------------------------------------------------
-- 3. NOTIFICATION TRIGGER FOR JOB APPLICATIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.notify_job_application_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    job_title TEXT;
    org_name TEXT;
BEGIN
    -- Get job details
    SELECT jobs.title, profiles.name INTO job_title, org_name
    FROM public.jobs
    JOIN public.profiles ON profiles.id = jobs.creator_id
    WHERE jobs.id = NEW.job_id;
    
    IF TG_OP = 'INSERT' THEN
        -- Notify organization about new application
        INSERT INTO public.notifications (user_id, type, content, reference_id)
        SELECT 
            jobs.creator_id,
            'system',
            'New application for ' || job_title,
            NEW.id
        FROM public.jobs
        WHERE jobs.id = NEW.job_id;
        
    ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
        -- Notify applicant about status change
        INSERT INTO public.notifications (user_id, type, content, reference_id)
        VALUES (
            NEW.user_id,
            'system',
            'Your application status updated: ' || NEW.status,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Will activate trigger after notifications table exists (migration 009)
-- DROP TRIGGER IF EXISTS on_application_status_change ON public.job_applications;
-- CREATE TRIGGER on_application_status_change
--     AFTER INSERT OR UPDATE ON public.job_applications
--     FOR EACH ROW
--     EXECUTE FUNCTION public.notify_job_application_update();

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'jobs'
    ), 'jobs table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'job_applications'
    ), 'job_applications table was not created';
    
    RAISE NOTICE 'Migration 006 completed successfully';
END $$;
