-- Allow room host OR document owner to update/delete study room documents
DROP POLICY IF EXISTS "Host can manage documents" ON public.study_room_documents;

CREATE POLICY "Host or owner can manage documents"
    ON public.study_room_documents FOR ALL
    USING (
        auth.uid() = shared_by OR
        EXISTS (
            SELECT 1 FROM public.study_rooms r
            WHERE r.id = study_room_documents.room_id
              AND r.creator_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = shared_by OR
        EXISTS (
            SELECT 1 FROM public.study_rooms r
            WHERE r.id = study_room_documents.room_id
              AND r.creator_id = auth.uid()
        )
    );
