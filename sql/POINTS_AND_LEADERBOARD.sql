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
    WHERE p.role = 'student' -- Only students in leaderboard
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
        WHERE role = 'student'
    ),
    total_count AS (
        SELECT COUNT(*) as total FROM profiles WHERE role = 'student'
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
-- 7. BONUS POINTS FOR PROFILE COMPLETION
-- =====================================================
-- Award bonus points for completing profile sections
CREATE OR REPLACE FUNCTION award_profile_completion_bonus(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    profile_record RECORD;
    bonus_points INTEGER := 0;
    already_awarded BOOLEAN;
BEGIN
    -- Get profile
    SELECT * INTO profile_record FROM profiles WHERE id = p_user_id;
    
    -- Check if already awarded profile completion bonus
    SELECT EXISTS(
        SELECT 1 FROM points_history 
        WHERE user_id = p_user_id AND action_type = 'profile_completed'
    ) INTO already_awarded;
    
    IF NOT already_awarded THEN
        -- Award points for different profile sections
        IF profile_record.avatar_url IS NOT NULL THEN
            bonus_points := bonus_points + 20;
        END IF;
        
        IF profile_record.headline IS NOT NULL AND LENGTH(profile_record.headline) > 10 THEN
            bonus_points := bonus_points + 15;
        END IF;
        
        IF profile_record.about IS NOT NULL AND LENGTH(profile_record.about) > 50 THEN
            bonus_points := bonus_points + 25;
        END IF;
        
        IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) >= 3 THEN
            bonus_points := bonus_points + 20;
        END IF;
        
        IF profile_record.experience IS NOT NULL AND jsonb_array_length(profile_record.experience::jsonb) >= 1 THEN
            bonus_points := bonus_points + 30;
        END IF;
        
        -- Award the bonus if profile is sufficiently complete
        IF bonus_points >= 50 THEN
            PERFORM award_points(p_user_id, 'profile_completed', bonus_points, NULL);
        END IF;
    END IF;
    
    RETURN bonus_points;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. POINTS SUMMARY
-- =====================================================
-- Points awarded for different actions:
-- - Create a post: +10 points
-- - Receive a like on your post: +2 points
-- - Create a comment: +5 points
-- - Make a connection (both users): +15 points each
-- - Complete profile sections: +20-110 points (one-time bonus)
--   * Avatar: +20
--   * Headline: +15
--   * About (50+ chars): +25
--   * Skills (3+): +20
--   * Experience (1+): +30

-- =====================================================
-- GRANT PERMISSIONS (adjust as needed for your setup)
-- =====================================================
-- GRANT EXECUTE ON FUNCTION award_points TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_user_rank TO authenticated;
-- GRANT EXECUTE ON FUNCTION award_profile_completion_bonus TO authenticated;
