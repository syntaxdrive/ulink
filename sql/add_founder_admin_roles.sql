-- Add new columns to profiles table for proper verification system
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_founder boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS role_type text DEFAULT 'student' CHECK (role_type IN ('student', 'org', 'admin', 'founder'));

-- Update the existing role column comment
COMMENT ON COLUMN public.profiles.role IS 'Legacy role field (student/org)';
COMMENT ON COLUMN public.profiles.role_type IS 'New role system: student, org, admin, founder';
COMMENT ON COLUMN public.profiles.is_verified IS 'Blue tick verification';
COMMENT ON COLUMN public.profiles.is_founder IS 'Gold tick for founders/co-founders';
