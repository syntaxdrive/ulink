-- Smart Notification Algorithm
-- Objective: Prevent notification spam when users post frequently.
-- Strategy: frequency Capping.
-- 1. When a post is created, find all 'accepted' connections.
-- 2. For each connection, check if we have sent them a 'new_post' notification from this author in the last 12 HOURS.
-- 3. If YES -> Skip (Silent Post).
-- 4. If NO -> Send Notification.

CREATE OR REPLACE FUNCTION handle_new_post_notification()
RETURNS TRIGGER AS $$
DECLARE
    recipient RECORD;
    should_notify BOOLEAN;
BEGIN
    -- Loop through all accepted connections where the author is the requester or recipient
    FOR recipient IN
        SELECT 
            CASE 
                WHEN requester_id = NEW.author_id THEN recipient_id
                ELSE requester_id 
            END as user_id
        FROM connections
        WHERE 
            status = 'accepted' 
            AND (requester_id = NEW.author_id OR recipient_id = NEW.author_id)
    LOOP
        -- SMART ALGORITHM: Check frequency cap (12 hours)
        SELECT NOT EXISTS (
            SELECT 1 FROM notifications
            WHERE 
                user_id = recipient.user_id -- The receiver
                AND sender_id = NEW.author_id -- The poster
                AND type = 'new_post'
                AND created_at > NOW() - INTERVAL '12 hours'
        ) INTO should_notify;

        -- If passed the frequency check, insert notification
        IF should_notify THEN
            INSERT INTO notifications (
                user_id,
                sender_id,
                type,
                title,
                message,
                metadata
            ) VALUES (
                recipient.user_id,
                NEW.author_id,
                'new_post',
                'New Post',
                LEFT(NEW.content, 50) || '...', -- Preview content
                jsonb_build_object('post_id', NEW.id, 'link', '/post/' || NEW.id)
            );
        END IF;

    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to use this new function
DROP TRIGGER IF EXISTS on_post_created ON posts;
CREATE TRIGGER on_post_created
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_post_notification();
