-- =====================================================
-- CALCULATE HISTORICAL POINTS FOR ALL EXISTING USERS
-- =====================================================
-- This script calculates points retroactively for all user activity
-- that happened before the points system was implemented

-- Calculate and update points for all student profiles
DO $$
DECLARE
    profile_record RECORD;
    post_count INTEGER;
    like_count INTEGER;
    comment_count INTEGER;
    connection_count INTEGER;
    profile_bonus INTEGER;
    total_points INTEGER;
BEGIN
    RAISE NOTICE 'Starting historical points calculation...';
    
    -- Loop through all student profiles
    FOR profile_record IN 
        SELECT id, name FROM profiles WHERE role = 'student'
    LOOP
        total_points := 0;
        
        -- Count posts created by user (+10 each)
        SELECT COUNT(*) INTO post_count
        FROM posts
        WHERE author_id = profile_record.id;
        total_points := total_points + (post_count * 10);
        
        -- Count likes received on user's posts (+2 each)
        SELECT COUNT(*) INTO like_count
        FROM likes l
        JOIN posts p ON l.post_id = p.id
        WHERE p.author_id = profile_record.id;
        total_points := total_points + (like_count * 2);
        
        -- Count comments made by user (+5 each)
        SELECT COUNT(*) INTO comment_count
        FROM comments
        WHERE author_id = profile_record.id;
        total_points := total_points + (comment_count * 5);
        
        -- Count accepted connections (+15 each)
        SELECT COUNT(*) INTO connection_count
        FROM connections
        WHERE (requester_id = profile_record.id OR recipient_id = profile_record.id)
        AND status = 'accepted';
        total_points := total_points + (connection_count * 15);
        
        -- Check profile completeness bonus
        profile_bonus := 0;
        
        -- Award bonus only if profile is reasonably complete
        -- Note: Only checking columns that exist in the current schema
        SELECT 
            CASE 
                -- Full bonus if profile has avatar and headline
                WHEN avatar_url IS NOT NULL 
                    AND headline IS NOT NULL AND LENGTH(headline) > 10
                THEN 50
                -- Small bonus for just avatar
                WHEN avatar_url IS NOT NULL
                THEN 20
                ELSE 0 
            END
        INTO profile_bonus
        FROM profiles
        WHERE id = profile_record.id;
        
        total_points := total_points + profile_bonus;
        
        -- Update user's points
        UPDATE profiles
        SET points = total_points
        WHERE id = profile_record.id;
        
        -- Log for users with significant points
        IF total_points > 0 THEN
            RAISE NOTICE 'User %: % points (Posts: %, Likes: %, Comments: %, Connections: %, Profile: %)', 
                profile_record.name, total_points, post_count, like_count, comment_count, connection_count, profile_bonus;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Historical points calculation complete!';
END $$;

-- Show summary statistics
SELECT 
    COUNT(*) as total_students,
    SUM(COALESCE(points, 0)) as total_points,
    AVG(COALESCE(points, 0))::INTEGER as avg_points,
    MAX(COALESCE(points, 0)) as max_points
FROM profiles 
WHERE role = 'student';

-- Show top 10 users
SELECT 
    name,
    university,
    points,
    ROW_NUMBER() OVER (ORDER BY points DESC) as rank
FROM profiles
WHERE role = 'student' AND COALESCE(points, 0) > 0
ORDER BY points DESC
LIMIT 10;
