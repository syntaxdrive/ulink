-- ============================================================
-- Virtual Study Rooms
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS study_rooms (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name                    TEXT NOT NULL,
    subject                 TEXT,
    description             TEXT,
    timer_minutes           INT NOT NULL DEFAULT 25 CHECK (timer_minutes IN (25, 50)),
    -- Shared Pomodoro timer state (managed by room creator)
    timer_started_at        TIMESTAMPTZ,          -- NULL = not started / reset
    timer_paused_at         TIMESTAMPTZ,          -- NULL = running, non-NULL = paused at this time
    timer_elapsed_seconds   INT NOT NULL DEFAULT 0,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_rooms_active   ON study_rooms(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_rooms_creator  ON study_rooms(creator_id);

ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_rooms_select" ON study_rooms
    FOR SELECT USING (true);

CREATE POLICY "study_rooms_insert" ON study_rooms
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Creator can update timer state / deactivate
CREATE POLICY "study_rooms_update" ON study_rooms
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "study_rooms_delete" ON study_rooms
    FOR DELETE USING (auth.uid() = creator_id);


-- Participants table — who is currently in each room
CREATE TABLE IF NOT EXISTS study_room_participants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id     UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'Studying',   -- 'Studying' | 'On break' | 'Done'
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_study_participants_room ON study_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_study_participants_user ON study_room_participants(user_id);

ALTER TABLE study_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_participants_select" ON study_room_participants
    FOR SELECT USING (true);

CREATE POLICY "study_participants_insert" ON study_room_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_participants_update" ON study_room_participants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "study_participants_delete" ON study_room_participants
    FOR DELETE USING (auth.uid() = user_id);


-- Enable Realtime for live presence updates
ALTER PUBLICATION supabase_realtime ADD TABLE study_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE study_room_participants;
