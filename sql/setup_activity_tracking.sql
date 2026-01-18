-- 1. Add last_seen_at column to profiles for activity tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Function to update last_seen_at (called by client on session start)
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to get activity statistics (DAU, WAU, MAU)
CREATE OR REPLACE FUNCTION public.get_activity_stats()
RETURNS JSON AS $$
DECLARE
  total_users INT;
  dau INT;
  wau INT;
  mau INT;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_users FROM public.profiles;

  -- Get Active Counts
  SELECT COUNT(*) INTO dau FROM public.profiles WHERE last_seen_at > (NOW() - INTERVAL '24 hours');
  SELECT COUNT(*) INTO wau FROM public.profiles WHERE last_seen_at > (NOW() - INTERVAL '7 days');
  SELECT COUNT(*) INTO mau FROM public.profiles WHERE last_seen_at > (NOW() - INTERVAL '30 days');

  -- Return JSON with counts and percentages
  RETURN json_build_object(
    'total_users', total_users,
    'dau', dau,
    'wau', wau,
    'mau', mau,
    'dau_pct', CASE WHEN total_users > 0 THEN ROUND((dau::numeric / total_users::numeric) * 100, 1) ELSE 0 END,
    'wau_pct', CASE WHEN total_users > 0 THEN ROUND((wau::numeric / total_users::numeric) * 100, 1) ELSE 0 END,
    'mau_pct', CASE WHEN total_users > 0 THEN ROUND((mau::numeric / total_users::numeric) * 100, 1) ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
