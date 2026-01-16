-- Function to get conversations sorted by last message time
CREATE OR REPLACE FUNCTION get_sorted_conversations(current_user_id UUID)
RETURNS SETOF profiles AS $$
BEGIN
    RETURN QUERY
    WITH connection_partners AS (
        SELECT 
            CASE WHEN requester_id = current_user_id THEN recipient_id ELSE requester_id END as partner_id
        FROM connections
        WHERE status = 'accepted' AND (requester_id = current_user_id OR recipient_id = current_user_id)
    ),
    last_msgs AS (
        SELECT 
            cp.partner_id,
            MAX(m.created_at) as last_at
        FROM connection_partners cp
        LEFT JOIN messages m ON 
            (m.sender_id = current_user_id AND m.recipient_id = cp.partner_id) OR
            (m.sender_id = cp.partner_id AND m.recipient_id = current_user_id)
        GROUP BY cp.partner_id
    )
    SELECT p.*
    FROM last_msgs lm
    JOIN profiles p ON p.id = lm.partner_id
    ORDER BY lm.last_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
