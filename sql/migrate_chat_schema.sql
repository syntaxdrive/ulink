-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT CHECK (type IN ('private', 'group')) DEFAULT 'private',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    PRIMARY KEY (conversation_id, user_id)
);

-- 3. Update messages table to support conversations
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL;

-- 4. Migration Logic: Convert existing 1-on-1 chats to conversations
DO $$ 
DECLARE 
    r RECORD;
    conv_id UUID;
BEGIN
    -- Loop through unique pairs of interacting users
    FOR r IN 
        SELECT DISTINCT 
            LEAST(sender_id, recipient_id) as user_a, 
            GREATEST(sender_id, recipient_id) as user_b 
        FROM messages 
        WHERE conversation_id IS NULL AND sender_id IS NOT NULL AND recipient_id IS NOT NULL
    LOOP
        -- Create a new conversation
        INSERT INTO conversations (type) VALUES ('private') RETURNING id INTO conv_id;

        -- Add participants
        INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conv_id, r.user_a);
        INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conv_id, r.user_b);

        -- Update messages
        UPDATE messages 
        SET conversation_id = conv_id 
        WHERE (sender_id = r.user_a AND recipient_id = r.user_b) 
           OR (sender_id = r.user_b AND recipient_id = r.user_a);
    END LOOP;
END $$;

-- 5. Automate Unread Counts & Metadata via Trigger
-- Function to handle new message insertion
CREATE OR REPLACE FUNCTION handle_new_message() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update conversation metadata
    UPDATE conversations 
    SET last_message = LEFT(NEW.content, 100), -- Preview
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;

    -- Increment unread counts for everyone EXCEPT the sender
    UPDATE conversation_participants
    SET unread_count = unread_count + 1,
        updated_at = NOW()
    WHERE conversation_id = NEW.conversation_id 
      AND user_id != NEW.sender_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION handle_new_message();

-- 6. Function to Reset Unread Count (Called by Client)
CREATE OR REPLACE FUNCTION mark_conversation_as_read(target_conversation_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE conversation_participants
    SET unread_count = 0
    WHERE conversation_id = target_conversation_id
      AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies (Crucial for Privacy)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Conversations: Visible if you are a participant
DROP POLICY IF EXISTS "Users can view conversations they are in" ON conversations;
CREATE POLICY "Users can view conversations they are in" ON conversations
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = conversations.id 
        AND user_id = auth.uid()
    )
);

-- Participants: Visible if you are in the conversation
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
    )
);
