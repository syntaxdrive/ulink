-- Relax network suggestions to ensure users are visible
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
    -- Relaxed Filter: Only exclude if there is an ACCEPTED or PENDING connection.
    -- This allows users to potentially see people they disconnected from or rejected long ago (if we want that), 
    -- but mainly it fixes "ghost" blocks.
    AND NOT EXISTS (
        SELECT 1 
        FROM public.connections c 
        WHERE 
            ((c.requester_id = current_user_id AND c.recipient_id = p.id)
            OR 
            (c.recipient_id = current_user_id AND c.requester_id = p.id))
            AND c.status IN ('pending', 'accepted')
    )
    ORDER BY 
        (CASE WHEN curr_uni IS NOT NULL AND p.university = curr_uni THEN 1 ELSE 0 END) DESC, -- Prioritize same university
        p.is_verified DESC, -- Then boost verified users
        p.created_at DESC -- Then newest
    LIMIT 100;
END;
$$;
