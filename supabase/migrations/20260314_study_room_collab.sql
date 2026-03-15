-- Migration: Study Room Collaboration Features
-- Adds: room_messages, room_documents, room_polls, room_poll_votes

-- ── Room Messages (in-room chat) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_room_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.study_room_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Room messages viewable by participants" ON public.study_room_messages;
CREATE POLICY "Room messages viewable by participants"
    ON public.study_room_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.study_room_messages;
CREATE POLICY "Authenticated users can send messages"
    ON public.study_room_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS study_room_messages_room_idx ON public.study_room_messages(room_id, created_at);

-- ── Room Documents (shared by host) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_room_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '' NOT NULL, -- markdown or plain text doc content
    doc_url TEXT, -- optional external URL (PDF link etc.)
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.study_room_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Room documents viewable by everyone" ON public.study_room_documents;
CREATE POLICY "Room documents viewable by everyone"
    ON public.study_room_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Host can manage documents" ON public.study_room_documents;
CREATE POLICY "Host can manage documents"
    ON public.study_room_documents FOR ALL
    USING (auth.uid() = shared_by)
    WITH CHECK (auth.uid() = shared_by);

CREATE INDEX IF NOT EXISTS study_room_documents_room_idx ON public.study_room_documents(room_id);

-- ── Room Polls ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_room_polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of {id, text}
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.study_room_polls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Polls viewable by everyone" ON public.study_room_polls;
CREATE POLICY "Polls viewable by everyone"
    ON public.study_room_polls FOR SELECT USING (true);

DROP POLICY IF EXISTS "Host can create polls" ON public.study_room_polls;
CREATE POLICY "Host can create polls"
    ON public.study_room_polls FOR INSERT
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Host can update polls" ON public.study_room_polls;
CREATE POLICY "Host can update polls"
    ON public.study_room_polls FOR UPDATE
    USING (auth.uid() = created_by);

-- ── Room Poll Votes ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_room_poll_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.study_room_polls(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    option_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(poll_id, user_id)
);

ALTER TABLE public.study_room_poll_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Poll votes viewable by everyone" ON public.study_room_poll_votes;
CREATE POLICY "Poll votes viewable by everyone"
    ON public.study_room_poll_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.study_room_poll_votes;
CREATE POLICY "Authenticated users can vote"
    ON public.study_room_poll_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can change vote" ON public.study_room_poll_votes;
CREATE POLICY "Users can change vote"
    ON public.study_room_poll_votes FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS study_room_poll_votes_poll_idx ON public.study_room_poll_votes(poll_id);

-- Enable realtime on new tables (safe: skips if already a member)
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'study_room_messages',
        'study_room_documents',
        'study_room_polls',
        'study_room_poll_votes'
    ] LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public'
              AND tablename = t
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
            RAISE NOTICE 'Added % to supabase_realtime publication', t;
        ELSE
            RAISE NOTICE '% already in supabase_realtime — skipped', t;
        END IF;
    END LOOP;
END $$;
