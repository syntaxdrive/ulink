-- =====================================================
-- UNILINK POINTS AND LEADERBOARD SYSTEM
-- =====================================================
-- This script sets up a comprehensive points and leaderboard system
-- for rewarding user engagement and activity

-- =====================================================
-- 1. ADD POINTS COLUMN TO PROFILES TABLE
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);

-- =====================================================
-- 2. CREATE POINTS HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'post_created', 'post_liked', 'comment_created', 'profile_completed', etc.
    points_earned INTEGER NOT NULL,
    reference_id UUID, -- ID of the post, comment, etc. that triggered the points
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_points_history_user ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created ON points_history(created_at DESC);

-- =====================================================
-- 3. POINTS AWARD FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_action_type TEXT,
    p_points INTEGER,
    p_reference_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Insert into points history
    INSERT INTO points_history (user_id, action_type, points_earned, reference_id)
    VALUES (p_user_id, p_action_type, p_points, p_reference_id);
    
    -- Update user's total points
    UPDATE profiles
    SET points = COALESCE(points, 0) + p_points
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. AUTOMATIC POINTS TRIGGERS
-- =====================================================

-- Trigger for new post creation (+10 points)
CREATE OR REPLACE FUNCTION trigger_points_new_post()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM award_points(NEW.author_id, 'post_created', 10, NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS points_on_new_post ON posts;
CREATE TRIGGER points_on_new_post
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_points_new_post();

-- Trigger for receiving a like (+2 points to post author)
CREATE OR REPLACE FUNCTION trigger_points_post_liked()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
BEGIN
    -- Get the post author
    SELECT author_id INTO post_author_id
    FROM posts
    WHERE id = NEW.post_id;
    
    -- Award points to post author
    IF post_author_id IS NOT NULL THEN
        PERFORM award_points(post_author_id, 'post_liked', 2, NEW.post_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS points_on_post_liked ON likes;
CREATE TRIGGER points_on_post_liked
    AFTER INSERT ON likes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_points_post_liked();

-- Trigger for creating a comment (+5 points)
CREATE OR REPLACE FUNCTION trigger_points_new_comment()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM award_points(NEW.author_id, 'comment_created', 5, NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS points_on_new_comment ON comments;
CREATE TRIGGER points_on_new_comment
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_points_new_comment();

-- Trigger for making a connection (+15 points to both users)
CREATE OR REPLACE FUNCTION trigger_points_connection_accepted()
RETURNS TRIGGER AS $$
BEGIN
    -- Only award points when connection is accepted
    IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
        PERFORM award_points(NEW.requester_id, 'connection_made', 15, NEW.id);
        PERFORM award_points(NEW.recipient_id, 'connection_made', 15, NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS points_on_connection_accepted ON connections;
CREATE TRIGGER points_on_connection_accepted
    AFTER UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION trigger_points_connection_accepted();

-- =====================================================
-- 5. GET LEADERBOARD FUNCTION (Top 100)
-- =====================================================
CREATE OR REPLACE FUNCTION get_leaderboard(
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    name TEXT,
    username TEXT,
    avatar_url TEXT,
    university TEXT,
    headline TEXT,
    points INTEGER,
    is_verified BOOLEAN,
    gold_verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY p.points DESC, p.created_at ASC) as rank,
        p.id as user_id,
        p.name,
        p.username,
        p.avatar_url,
        p.university,
        p.headline,
        COALESCE(p.points, 0) as points,
        p.is_verified,
        p.gold_verified
    FROM profiles p
    WHERE (p.role = 'student' OR p.role IS NULL) -- Allow students and legacy users in leaderboard
    ORDER BY p.points DESC, p.created_at ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. GET USER RANK FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS TABLE (
    rank BIGINT,
    total_users BIGINT,
    points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_users AS (
        SELECT 
            id,
            COALESCE(points, 0) as user_points,
            ROW_NUMBER() OVER (ORDER BY COALESCE(points, 0) DESC, created_at ASC) as user_rank
        FROM profiles
        WHERE (role = 'student' OR role IS NULL)
    ),
    total_count AS (
        SELECT COUNT(*) as total FROM profiles WHERE (role = 'student' OR role IS NULL)
    )
    SELECT 
        ru.user_rank as rank,
        tc.total as total_users,
        ru.user_points as points
    FROM ranked_users ru
    CROSS JOIN total_count tc
    WHERE ru.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. CALCULATE HISTORICAL POINTS FOR EXISTING USERS
-- =====================================================
-- This function calculates points for all existing activity
CREATE OR REPLACE FUNCTION calculate_historical_points()
RETURNS void AS $$
DECLARE
    profile_record RECORD;
    post_count INTEGER;
    like_count INTEGER;
    comment_count INTEGER;
    connection_count INTEGER;
    profile_completeness_bonus INTEGER;
    total_points INTEGER;
BEGIN
    -- Loop through all student profiles
    FOR profile_record IN 
        SELECT id FROM profiles WHERE (role = 'student' OR role IS NULL)
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
        
        -- Check profile completeness bonus (+110 total)
        profile_completeness_bonus := 0;
        SELECT 
            CASE 
                WHEN avatar_url IS NOT NULL 
                    AND headline IS NOT NULL 
                    AND about IS NOT NULL 
                    AND skills IS NOT NULL AND array_length(skills, 1) > 0
                    AND experience IS NOT NULL AND jsonb_array_length(experience) > 0
                THEN 110 
                ELSE 0 
            END
        INTO profile_completeness_bonus
        FROM profiles
        WHERE id = profile_record.id;
        total_points := total_points + profile_completeness_bonus;
        
        -- Update user's points
        UPDATE profiles
        SET points = total_points
        WHERE id = profile_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. RUN HISTORICAL POINTS CALCULATION
-- =====================================================
-- Calculate points for all existing users based on their current activity
SELECT calculate_historical_points();
