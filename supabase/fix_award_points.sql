-- Fix for trigger points using action_type instead of activity_type
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_action_type TEXT,
    p_points INTEGER,
    p_reference_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert into points history
    INSERT INTO points_history (user_id, activity_type, points_earned, reference_id)
    VALUES (p_user_id, p_action_type, p_points, p_reference_id);
    
    -- Update user's total points
    UPDATE profiles
    SET points = COALESCE(points, 0) + p_points
    WHERE id = p_user_id;
END;
$$;
