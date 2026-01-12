-- 1. Create Follows Table
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 2. Add followers_count to profiles if not exists (to cache the count)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 3. Add EXPERIENCE column relative to user request
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb;

-- 4. Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Public read follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Authenticated users can follow" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Authenticated users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- 6. Trigger Function to Handle Verification and Notification
CREATE OR REPLACE FUNCTION handle_new_follower()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    is_already_verified BOOLEAN;
BEGIN
    -- Increment follower count
    UPDATE profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id
    RETURNING followers_count, is_verified INTO current_count, is_already_verified;

    -- Update following count for the follower
    UPDATE profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;

    -- Check for Verification Threshold (1000)
    IF current_count >= 1000 AND NOT is_already_verified THEN
        -- Verify User
        UPDATE profiles SET is_verified = true WHERE id = NEW.following_id;

        -- Send System Notification
        INSERT INTO notifications (user_id, type, title, content, data)
        VALUES (
            NEW.following_id, 
            'system', 
            'You''re Verified! 🎉', 
            'Congratulations! You have reached 1000 followers and earned a blue verification badge.',
            jsonb_build_object('action', 'verified')
        );
    ELSE
        -- Send Normal Follow Notification
        INSERT INTO notifications (user_id, type, title, content, data)
        VALUES (
            NEW.following_id,
            'follow',
            'New Follower',
            'started following you.',
            jsonb_build_object('follower_id', NEW.follower_id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger Logic for Unfollow (Decrement)
CREATE OR REPLACE FUNCTION handle_unfollow()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Attach Triggers
DROP TRIGGER IF EXISTS on_follow_added ON follows;
CREATE TRIGGER on_follow_added
AFTER INSERT ON follows
FOR EACH ROW EXECUTE FUNCTION handle_new_follower();

DROP TRIGGER IF EXISTS on_follow_removed ON follows;
CREATE TRIGGER on_follow_removed
AFTER DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION handle_unfollow();
