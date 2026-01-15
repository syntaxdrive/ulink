-- Rate Limit Function
CREATE OR REPLACE FUNCTION public.check_connection_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  request_count INT;
  weekly_limit INT := 50; -- Adjust limit here
BEGIN
  -- Only check for new pending requests (insertions)
  -- We exclude 'accepted' or 'blocked' if they are being inserted directly (rare, but good to know)
  -- Usually we only care about 'pending' requests initiated by the user.
  
  IF NEW.status = 'pending' THEN
      -- Count requests sent by this user in the last 7 days
      SELECT count(*) INTO request_count
      FROM public.connections
      WHERE requester_id = auth.uid()
        AND created_at > (now() - interval '7 days')
        AND status = 'pending'; -- Only count pending ones? Or all? 
        -- Counting all attempts is safer to prevent spamming create/delete.
        -- Let's count ALL connections created by this user in last 7 days.
      
      -- Re-query without status filter for stricter limit
      SELECT count(*) INTO request_count
      FROM public.connections
      WHERE requester_id = auth.uid()
        AND created_at > (now() - interval '7 days');

      IF request_count >= weekly_limit THEN
          RAISE EXCEPTION 'Weekly connection limit reached (% requests/week). Please try again later.', weekly_limit;
      END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS enforce_connection_rate_limit ON public.connections;
CREATE TRIGGER enforce_connection_rate_limit
  BEFORE INSERT ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.check_connection_rate_limit();
