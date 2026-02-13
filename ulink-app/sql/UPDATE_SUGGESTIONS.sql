-- SQL Update to Prioritize University Connections
-- This function updates existing functions to show same-university users first.

-- Function to get suggested connections (users not yet connected)
CREATE OR REPLACE FUNCTION public.get_suggested_connections(current_user_id UUID)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    my_uni TEXT;
BEGIN
    -- Get current user's university
    SELECT university INTO my_uni FROM public.profiles WHERE id = current_user_id;

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
    ORDER BY 
        -- Prioritize same university
        CASE WHEN (my_uni IS NOT NULL AND p.university = my_uni) THEN 0 ELSE 1 END,
        -- Then verified users
        CASE WHEN p.is_verified THEN 0 ELSE 1 END,
        -- Then recent
        p.created_at DESC
    LIMIT 20;
END;
$$;

-- Function to search ALL users
CREATE OR REPLACE FUNCTION public.search_all_users(
    current_user_id UUID,
    search_query TEXT
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    my_uni TEXT;
BEGIN
    SELECT university INTO my_uni FROM public.profiles WHERE id = current_user_id;

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
    ORDER BY
        CASE WHEN (my_uni IS NOT NULL AND university = my_uni) THEN 0 ELSE 1 END,
        CASE WHEN is_verified THEN 0 ELSE 1 END,
        name ASC
    LIMIT 50;
END;
$$;
