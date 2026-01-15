-- 1. Drop existing constraint
ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_status_check;

-- 2. Add new constraint with 'rejected'
ALTER TABLE connections ADD CONSTRAINT connections_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- 3. Add DELETE policy (useful for cancelling requests or un-friending)
DROP POLICY IF EXISTS "Users can delete own connections" ON connections;
CREATE POLICY "Users can delete own connections" ON connections
FOR DELETE USING (
    auth.uid() = requester_id OR auth.uid() = recipient_id
);

-- 4. Notification Logic for Rejection
-- We need to ensure we can insert a notification when rejecting
-- The trigger setup_smart_notifications.sql likely handles 'accepted' but maybe not 'rejected'
-- Let's check or create a specific function for this.

CREATE OR REPLACE FUNCTION handle_connection_update() 
RETURNS TRIGGER AS $$
BEGIN
    -- Handle ACCEPT
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        INSERT INTO notifications (user_id, type, content, data)
        VALUES (
            NEW.requester_id,
            'connection_accepted',
            'accepted your connection request.',
            json_build_object('connection_id', NEW.id, 'actor_id', NEW.recipient_id)
        );
    -- Handle REJECT
    ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
        INSERT INTO notifications (user_id, type, content, data)
        VALUES (
            NEW.requester_id,
            'connection_rejected',
            'declined your connection request.',
            json_build_object('connection_id', NEW.id, 'actor_id', NEW.recipient_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_connection_update ON connections;
CREATE TRIGGER on_connection_update
AFTER UPDATE ON connections
FOR EACH ROW
EXECUTE FUNCTION handle_connection_update();
