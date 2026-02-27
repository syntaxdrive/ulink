-- Fix: Add SECURITY DEFINER to points functions so they can bypass RLS
-- when users perform actions that award points to other users (e.g., liking a post, accepting a connection).

-- 1. Main award_points function
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
    INSERT INTO points_history (user_id, action_type, points_earned, reference_id)
    VALUES (p_user_id, p_action_type, p_points, p_reference_id);
    
    -- Update user's total points
    UPDATE profiles
    SET points = COALESCE(points, 0) + p_points
    WHERE id = p_user_id;
END;
$$;

-- 2. Trigger for new post creation
CREATE OR REPLACE FUNCTION trigger_points_new_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM award_points(NEW.author_id, 'post_created', 10, NEW.id);
    RETURN NEW;
END;
$$;

-- 3. Trigger for receiving a like
CREATE OR REPLACE FUNCTION trigger_points_post_liked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 4. Trigger for creating a comment
CREATE OR REPLACE FUNCTION trigger_points_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM award_points(NEW.author_id, 'comment_created', 5, NEW.id);
    RETURN NEW;
END;
$$;

-- 5. Trigger for making a connection
CREATE OR REPLACE FUNCTION trigger_points_connection_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only award points when connection is accepted
    IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
        PERFORM award_points(NEW.requester_id, 'connection_made', 15, NEW.id);
        PERFORM award_points(NEW.recipient_id, 'connection_made', 15, NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$;
