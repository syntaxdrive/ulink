-- Add job status field to allow organizations to mark jobs as active or closed

-- Add status column
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('active', 'closed'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);

-- Add index for creator_id for "My Jobs" filtering
CREATE INDEX IF NOT EXISTS idx_jobs_creator_id ON public.jobs(creator_id);

-- Update existing jobs to have 'active' status
UPDATE public.jobs 
SET status = 'active' 
WHERE status IS NULL;

-- Verify
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND column_name = 'status';
