ALTER TABLE study_rooms ADD COLUMN IF NOT EXISTS allow_drawing BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS study_room_voicenotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES study_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    x_pos FLOAT DEFAULT 50.0,
    y_pos FLOAT DEFAULT 50.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_room_voicenotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view voicenotes" ON study_room_voicenotes FOR SELECT USING (
    EXISTS (SELECT 1 FROM study_room_participants WHERE room_id = study_room_voicenotes.room_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM study_rooms WHERE id = study_room_voicenotes.room_id AND creator_id = auth.uid())
);

CREATE POLICY "Participants can insert voicenotes" ON study_room_voicenotes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM study_room_participants WHERE room_id = study_room_voicenotes.room_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM study_rooms WHERE id = study_room_voicenotes.room_id AND creator_id = auth.uid())
);

CREATE POLICY "Users can update voicenotes positions" ON study_room_voicenotes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM study_room_participants WHERE room_id = study_room_voicenotes.room_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM study_rooms WHERE id = study_room_voicenotes.room_id AND creator_id = auth.uid())
);

CREATE POLICY "Users can delete their own voicenotes or host can delete" ON study_room_voicenotes FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM study_rooms WHERE id = study_room_voicenotes.room_id AND creator_id = auth.uid())
);
