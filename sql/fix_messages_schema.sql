-- Fix Messages Schema
-- Adds missing columns that are being used by the frontend but might not exist in the DB

-- 1. Add image_url if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'image_url') THEN
        ALTER TABLE messages ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 2. Add read_at if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'read_at') THEN
        ALTER TABLE messages ADD COLUMN read_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Ensure Update Policy allows updating 'read_at' (Mark as Read)
-- Drop existing update policy if it restricts too much
DROP POLICY IF EXISTS "Users can update their own received messages (mark as read)" ON messages;

CREATE POLICY "Users can update their own received messages (mark as read)" ON messages
FOR UPDATE
USING ( auth.uid() = recipient_id )
WITH CHECK ( auth.uid() = recipient_id );
