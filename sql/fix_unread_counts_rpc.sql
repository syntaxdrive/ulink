-- Re-create the unread counts function to strictly ensure it works with the new schema
-- and uses Security Definer to bypass any RLS quirks for this specific "count" operation.

CREATE OR REPLACE FUNCTION public.fetch_unread_counts(current_user_id uuid)
RETURNS TABLE(sender_id uuid, unread_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.sender_id, 
    COUNT(*)::bigint
  FROM 
    public.messages m
  WHERE 
    m.recipient_id = current_user_id
    AND m.read_at IS NULL
  GROUP BY 
    m.sender_id;
END;
$$;
