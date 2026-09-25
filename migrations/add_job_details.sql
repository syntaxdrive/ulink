-- Add new columns to jobs table for better job listings
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS salary_range TEXT,
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Update existing jobs with default location if needed
UPDATE jobs SET location = 'Remote' WHERE location IS NULL;
