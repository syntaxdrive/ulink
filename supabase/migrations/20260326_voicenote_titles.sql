ALTER TABLE study_room_voicenotes
ADD COLUMN IF NOT EXISTS title TEXT;

-- Restrict updates (position/title) to note owner or room host.
DROP POLICY IF EXISTS "Users can update voicenotes positions" ON study_room_voicenotes;

CREATE POLICY "Users can update their own voicenotes or host can update" ON study_room_voicenotes FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM study_rooms
        WHERE id = study_room_voicenotes.room_id
          AND creator_id = auth.uid()
    )
);
