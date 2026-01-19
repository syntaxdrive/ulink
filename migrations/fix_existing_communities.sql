-- Quick Fix: Add Yourself as Owner to Your Communities
-- Run this in Supabase SQL Editor

-- Step 1: First, find your user ID
-- Replace 'your@email.com' with your actual email
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get your user ID (update the email!)
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'your@email.com'  -- ← CHANGE THIS TO YOUR EMAIL
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User not found! Please check your email address.';
    ELSE
        RAISE NOTICE 'Your User ID: %', v_user_id;
        
        -- Add you as owner to all communities you created
        INSERT INTO community_members (community_id, user_id, role)
        SELECT id, created_by, 'owner'
        FROM communities
        WHERE created_by = v_user_id
        ON CONFLICT (community_id, user_id) 
        DO UPDATE SET role = 'owner';  -- Update role if already a member
        
        RAISE NOTICE 'Successfully added you as owner to your communities!';
    END IF;
END $$;

-- Step 2: Verify it worked
-- Replace 'your@email.com' with your actual email
SELECT 
    c.name as community_name,
    c.slug,
    cm.role,
    c.created_at as community_created_at
FROM community_members cm
JOIN communities c ON cm.community_id = c.id
JOIN auth.users u ON cm.user_id = u.id
WHERE u.email = 'your@email.com'  -- ← CHANGE THIS TO YOUR EMAIL
ORDER BY c.created_at DESC;

-- You should see all your communities with role = 'owner'!
