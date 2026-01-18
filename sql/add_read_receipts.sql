-- Add read_at column to messages if not exists
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Create a function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(p_sender_id UUID, p_recipient_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.messages
    SET read_at = NOW()
    WHERE sender_id = p_sender_id 
      AND recipient_id = p_recipient_id 
      AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
