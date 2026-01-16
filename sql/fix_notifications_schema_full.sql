-- Comprehensive fix for notifications table schema
-- Ensure all required columns exist for the triggers to work

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'system',
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS message TEXT, -- Ensure message column exists (sometimes called content)
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
