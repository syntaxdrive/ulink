-- Update the jobs table to allow "Scholarship" as a type
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_type_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_type_check CHECK (type IN ('Internship', 'Entry Level', 'Full Time', 'Scholarship'));
