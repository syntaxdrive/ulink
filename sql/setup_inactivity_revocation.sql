-- 1. SAFEGUARD: Give existing verified users a 7-day grace period by setting last_seen to NOW
-- This prevents them from losing their badge instantly upon running this script.
UPDATE public.profiles
SET last_seen_at = NOW()
WHERE is_verified = true AND last_seen_at IS NULL;

-- 2. Enhanced 'update_last_seen' to RESTORE verification if active
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS VOID AS $$
BEGIN
  -- Allow system to update privileged columns
  PERFORM set_config('app.bypass_protection', 'true', true);

  -- 1. Update Last Seen
  UPDATE public.profiles
  SET last_seen_at = NOW()
  WHERE id = auth.uid();

  -- 2. Re-Verify if eligible (1000+ followers) and active
  UPDATE public.profiles
  SET is_verified = true
  WHERE id = auth.uid()
  AND followers_count >= 1000
  AND is_verified = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Cleanup Function to REVOKE verification if inactive > 7 days
CREATE OR REPLACE FUNCTION public.cleanup_inactive_docs()
RETURNS VOID AS $$
DECLARE
    count_revoked INT;
BEGIN
  -- Allow system to update privileged columns
  PERFORM set_config('app.bypass_protection', 'true', true);

  WITH revoked AS (
      UPDATE public.profiles
      SET is_verified = false
      WHERE is_verified = true
      AND gold_verified = false -- Don't revoke Gold/Founders
      AND is_admin = false      -- Don't revoke Admins
      AND (last_seen_at < NOW() - INTERVAL '7 days') 
      RETURNING id
  )
  SELECT count(*) INTO count_revoked FROM revoked;
  
  -- Log or just return (can be extended to log to audit table)
  RAISE NOTICE 'Revoked verification from % inactive users', count_revoked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attempt to Schedule via pg_cron (Only works if extension is enabled on server)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Schedule to run every hour
    PERFORM cron.schedule('cleanup-inactive', '0 * * * *', 'SELECT public.cleanup_inactive_docs()');
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors (e.g. permission denied)
  NULL;
END $$;
