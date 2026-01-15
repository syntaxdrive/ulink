-- 1. Fix Trigger to allow Admins to update privileged fields
CREATE OR REPLACE FUNCTION public.protect_privileged_profile_columns()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  -- Check if the current user is an admin
  SELECT is_admin INTO is_admin_user FROM public.profiles WHERE id = auth.uid();
  
  -- If Admin, allow all changes
  IF is_admin_user = true THEN
      RETURN NEW;
  END IF;

  -- If not admin, revert privileged fields if changed
  IF (NEW.is_admin IS DISTINCT FROM OLD.is_admin) OR
     (NEW.is_verified IS DISTINCT FROM OLD.is_verified) OR
     (NEW.gold_verified IS DISTINCT FROM OLD.gold_verified) THEN
      NEW.is_admin := OLD.is_admin;
      NEW.is_verified := OLD.is_verified;
      NEW.gold_verified := OLD.gold_verified;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create RPC for Admin Verification (Bypassing RLS)
CREATE OR REPLACE FUNCTION admin_toggle_verify(target_id uuid, should_verify boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check Admin status of caller
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Access Denied: Admins Only';
  END IF;
  
  UPDATE profiles
  SET is_verified = should_verify
  WHERE id = target_id;
END;
$$;
