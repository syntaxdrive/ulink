-- Function to search ALL users in the database
CREATE OR REPLACE FUNCTION public.search_all_users(
    current_user_id UUID,
    search_query TEXT
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.profiles
    WHERE id != current_user_id
    AND (
        name ILIKE '%' || search_query || '%'
        OR username ILIKE '%' || search_query || '%'
        OR headline ILIKE '%' || search_query || '%'
        OR university ILIKE '%' || search_query || '%'
    )
    LIMIT 50;
END;
$$;

-- Function to get suggested connections (users not yet connected)
CREATE OR REPLACE FUNCTION public.get_suggested_connections(
    current_user_id UUID
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.profiles p
    WHERE p.id != current_user_id
    AND NOT EXISTS (
        SELECT 1 
        FROM public.connections c 
        WHERE (c.requester_id = current_user_id AND c.recipient_id = p.id)
        OR (c.recipient_id = current_user_id AND c.requester_id = p.id)
    )
    ORDER BY p.created_at DESC
    LIMIT 20;
END;
$$;
