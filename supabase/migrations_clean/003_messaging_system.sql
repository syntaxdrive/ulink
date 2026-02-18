-- Migration 003: Messaging System
-- Description: Direct messaging with voice notes and read receipts
-- Dependencies: 001_foundation_profiles_auth.sql
-- Generated: 2026-02-17

--------------------------------------------------------------------------------
-- 1. MESSAGES TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID, -- Optional: for grouping conversations
    content TEXT,
    image_url TEXT,
    audio_url TEXT, -- Voice message support
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- At least one content type must be present
    CHECK (
        content IS NOT NULL OR 
        image_url IS NOT NULL OR 
        audio_url IS NOT NULL
    )
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Recipients can mark messages as read" ON public.messages;
CREATE POLICY "Recipients can mark messages as read"
    ON public.messages FOR UPDATE
    USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Senders can delete their own messages" ON public.messages;
CREATE POLICY "Senders can delete their own messages"
    ON public.messages FOR DELETE
    USING (auth.uid() = sender_id);

-- Indexes
CREATE INDEX IF NOT EXISTS messages_sender_recipient_idx 
    ON public.messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS messages_recipient_sender_idx 
    ON public.messages(recipient_id, sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx 
    ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx 
    ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_read_at_idx 
    ON public.messages(read_at);

--------------------------------------------------------------------------------
-- 2. MESSAGING FUNCTIONS
--------------------------------------------------------------------------------

-- Get sorted conversations (most recent first)
CREATE OR REPLACE FUNCTION public.get_sorted_conversations(
    current_user_id UUID
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    username TEXT,
    avatar_url TEXT,
    university TEXT,
    is_verified BOOLEAN,
    last_message TEXT,
    last_message_time TIMESTAMPTZ,
    unread_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH conversation_partners AS (
        -- Get all users we've messaged with
        SELECT DISTINCT
            CASE 
                WHEN m.sender_id = current_user_id THEN m.recipient_id
                ELSE m.sender_id
            END AS partner_id
        FROM public.messages m
        WHERE m.sender_id = current_user_id OR m.recipient_id = current_user_id
    ),
    connected_users AS (
        -- Include all connected users (both directions)
        SELECT DISTINCT
            CASE 
                WHEN requester_id = current_user_id THEN recipient_id
                ELSE requester_id
            END AS partner_id
        FROM public.connections
        WHERE (requester_id = current_user_id OR recipient_id = current_user_id)
            AND status = 'accepted'
    ),
    all_partners AS (
        -- Combine message partners and connected users
        SELECT partner_id FROM conversation_partners
        UNION
        SELECT partner_id FROM connected_users
    ),
    latest_messages AS (
        SELECT DISTINCT ON (
            CASE 
                WHEN sender_id = current_user_id THEN recipient_id
                ELSE sender_id
            END
        )
            CASE 
                WHEN sender_id = current_user_id THEN recipient_id
                ELSE sender_id
            END AS partner_id,
            content,
            created_at
        FROM public.messages
        WHERE sender_id = current_user_id OR recipient_id = current_user_id
        ORDER BY 
            CASE 
                WHEN sender_id = current_user_id THEN recipient_id
                ELSE sender_id
            END,
            created_at DESC
    ),
    unread_counts AS (
        SELECT 
            sender_id AS partner_id,
            COUNT(*) AS unread_count
        FROM public.messages
        WHERE recipient_id = current_user_id
            AND read_at IS NULL
        GROUP BY sender_id
    )
    SELECT 
        p.id,
        p.name,
        p.username,
        p.avatar_url,
        p.university,
        p.is_verified,
        lm.content AS last_message,
        lm.created_at AS last_message_time,
        COALESCE(uc.unread_count, 0) AS unread_count
    FROM all_partners ap
    JOIN public.profiles p ON p.id = ap.partner_id
    LEFT JOIN latest_messages lm ON lm.partner_id = ap.partner_id
    LEFT JOIN unread_counts uc ON uc.partner_id = ap.partner_id
    ORDER BY lm.created_at DESC NULLS LAST, p.name ASC;
END;
$$;

-- Get unread counts per conversation
CREATE OR REPLACE FUNCTION public.fetch_unread_counts(
    current_user_id UUID
)
RETURNS TABLE (
    sender_id UUID,
    unread_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.sender_id,
        COUNT(*) AS unread_count
    FROM public.messages m
    WHERE m.recipient_id = current_user_id
        AND m.read_at IS NULL
    GROUP BY m.sender_id;
END;
$$;

-- Mark all messages in a conversation as read
CREATE OR REPLACE FUNCTION public.mark_conversation_as_read(
    target_conversation_partner UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.messages
    SET read_at = NOW()
    WHERE recipient_id = auth.uid()
        AND sender_id = target_conversation_partner
        AND read_at IS NULL;
END;
$$;

--------------------------------------------------------------------------------
-- 3. NOTIFICATION TRIGGER (Optional - for message notifications)
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert notification for recipient
    INSERT INTO public.notifications (user_id, type, content, reference_id)
    VALUES (
        NEW.recipient_id,
        'message',
        'You have a new message',
        NEW.id
    );
    
    RETURN NEW;
END;
$$;

-- Will create trigger after notifications table exists (in later migration)
-- For now, commented out:
-- DROP TRIGGER IF EXISTS on_message_created ON public.messages;
-- CREATE TRIGGER on_message_created
--     AFTER INSERT ON public.messages
--     FOR EACH ROW
--     EXECUTE FUNCTION public.handle_new_message();

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'messages'
    ), 'messages table was not created';
    
    RAISE NOTICE 'Migration 003 completed successfully';
END $$;
