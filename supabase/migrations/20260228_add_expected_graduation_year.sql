-- Add expected_graduation_year to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expected_graduation_year INTEGER;
