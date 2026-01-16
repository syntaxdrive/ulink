-- Fix for "column sender_id does not exist" error in notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES profiles(id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
