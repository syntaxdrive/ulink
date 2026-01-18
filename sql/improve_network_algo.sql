-- Improve suggestions algorithm to prioritize same university
CREATE OR REPLACE FUNCTION public.get_suggested_connections(
    current_user_id UUID
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    curr_uni TEXT;
BEGIN
    -- Get current user's university
    SELECT university INTO curr_uni FROM public.profiles WHERE id = current_user_id;

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
        (CASE WHEN curr_uni IS NOT NULL AND p.university = curr_uni THEN 1 ELSE 0 END) DESC, -- Prioritize same university
        p.created_at DESC
    LIMIT 50; -- Increased limit for better filtering chances
END;
$$;
