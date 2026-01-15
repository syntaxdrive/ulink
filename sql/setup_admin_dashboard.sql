-- 1. Add is_admin column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Create Policy to allow Admins to Update Profiles
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Check if the requesting user is an admin
  exists (
    select 1 from public.profiles
    where id = auth.uid() 
    and is_admin = true
  )
);

-- 3. Function to get Dashboard Analytics (Updated to return json)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users integer;
  total_verified integer;
  total_orgs integer;
BEGIN
  -- Count total profiles
  SELECT count(*) INTO total_users FROM public.profiles;
  
  -- Count verified
  SELECT count(*) INTO total_verified FROM public.profiles WHERE is_verified = true;

  -- Count organizations
  SELECT count(*) INTO total_orgs FROM public.profiles WHERE role = 'org';

  RETURN json_build_object(
    'total_users', total_users,
    'total_verified', total_verified,
    'total_orgs', total_orgs
  );
END;
$$;
