-- Community Creator Auto-Membership Trigger
-- This ensures community creators are automatically added as owners

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS add_creator_as_owner ON communities;
DROP FUNCTION IF EXISTS add_creator_as_owner_func();

-- Create function to add creator as owner
CREATE OR REPLACE FUNCTION add_creator_as_owner_func()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert creator as owner in community_members
    INSERT INTO community_members (community_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner')
    ON CONFLICT (community_id, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after community insert
CREATE TRIGGER add_creator_as_owner
    AFTER INSERT ON communities
    FOR EACH ROW
    EXECUTE FUNCTION add_creator_as_owner_func();

-- Success message
SELECT 'Community creator auto-membership trigger created successfully!' as message;

-- Test: Check if trigger works
-- After running this, create a new community and verify you're automatically the owner
