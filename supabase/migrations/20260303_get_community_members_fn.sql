-- Function: get_community_members
-- Purpose: Allows admins/owners of a community to fetch all active members,
--          including their profile details. Runs SECURITY DEFINER to bypass
--          RLS on both community_members and profiles tables.

-- Drop existing version first (needed when return type changes)
DROP FUNCTION IF EXISTS get_community_members(UUID);

CREATE OR REPLACE FUNCTION get_community_members(p_community_id UUID)
RETURNS TABLE (
    member_id    UUID,
    user_id      UUID,
    member_role  TEXT,
    name         TEXT,
    username     TEXT,
    avatar_url   TEXT,
    university   TEXT,
    is_verified  BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow admins/owners of this community to call this function
    IF NOT EXISTS (
        SELECT 1
        FROM community_members cm
        WHERE cm.community_id = p_community_id
          AND cm.user_id      = auth.uid()
          AND cm.role         IN ('admin', 'owner')
          AND cm.status       = 'active'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins and owners can view the member list';
    END IF;

    RETURN QUERY
    SELECT
        cm.id          AS member_id,
        cm.user_id,
        cm.role        AS member_role,
        p.name,
        p.username,
        p.avatar_url,
        p.university,
        p.is_verified
    FROM community_members cm
    JOIN profiles p ON p.id = cm.user_id
    WHERE cm.community_id = p_community_id
      AND cm.status       = 'active'
    ORDER BY
        CASE cm.role
            WHEN 'owner'  THEN 0
            WHEN 'admin'  THEN 1
            ELSE               2
        END;
END;
$$;

-- Grant execute to authenticated users (the function itself enforces admin-only access)
GRANT EXECUTE ON FUNCTION get_community_members(UUID) TO authenticated;
