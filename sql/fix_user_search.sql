-- Fix for user search - Allow searching ALL users, not just suggestions

-- Create a new function to search all users
CREATE OR REPLACE FUNCTION public.search_all_users(
    current_user_id uuid,
    search_query text
)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.profiles
  WHERE id != current_user_id
  AND (
    name ILIKE '%' || search_query || '%'
    OR email ILIKE '%' || search_query || '%'
    OR university ILIKE '%' || search_query || '%'
    OR headline ILIKE '%' || search_query || '%'
    OR username ILIKE '%' || search_query || '%'
  )
  ORDER BY 
    -- Prioritize exact matches
    CASE WHEN LOWER(name) = LOWER(search_query) THEN 0 ELSE 1 END,
    -- Then verified users
    CASE WHEN is_verified = true THEN 0 ELSE 1 END,
    -- Then same university
    CASE WHEN university = (SELECT university FROM profiles WHERE id = current_user_id) THEN 0 ELSE 1 END,
    -- Finally alphabetical
    name ASC
  LIMIT 100;
$$;

-- Update the existing get_suggested_connections to return more results
CREATE OR REPLACE FUNCTION public.get_suggested_connections(current_user_id uuid)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.profiles
  WHERE id != current_user_id
  AND role = 'student'
  AND id NOT IN (
    SELECT recipient_id FROM public.connections WHERE requester_id = current_user_id
    UNION
    SELECT requester_id FROM public.connections WHERE recipient_id = current_user_id
  )
  ORDER BY 
    CASE WHEN is_verified = true THEN 0 ELSE 1 END, -- Priority 1: Verified (Growth Engine)
    CASE WHEN university = (SELECT university FROM profiles WHERE id = current_user_id) THEN 0 ELSE 1 END, -- Priority 2: Relevance
    random() -- Priority 3: Freshness
  LIMIT 50; -- Increased from 20 to 50
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.search_all_users(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_suggested_connections(uuid) TO authenticated;
