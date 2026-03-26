CREATE TABLE IF NOT EXISTS public.study_room_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE NOT NULL,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (room_id, requester_id)
);

ALTER TABLE public.study_room_join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create join requests" ON public.study_room_join_requests;
CREATE POLICY "Users can create join requests"
    ON public.study_room_join_requests FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can view own or host can view join requests" ON public.study_room_join_requests;
CREATE POLICY "Users can view own or host can view join requests"
    ON public.study_room_join_requests FOR SELECT
    USING (
        auth.uid() = requester_id OR
        EXISTS (
            SELECT 1 FROM public.study_rooms r
            WHERE r.id = study_room_join_requests.room_id
              AND r.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Host can update join requests" ON public.study_room_join_requests;
CREATE POLICY "Host can update join requests"
    ON public.study_room_join_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.study_rooms r
            WHERE r.id = study_room_join_requests.room_id
              AND r.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Requester can cancel pending requests" ON public.study_room_join_requests;
CREATE POLICY "Requester can cancel pending requests"
    ON public.study_room_join_requests FOR DELETE
    USING (auth.uid() = requester_id);

CREATE INDEX IF NOT EXISTS study_room_join_requests_room_idx
    ON public.study_room_join_requests(room_id, status, created_at);
CREATE INDEX IF NOT EXISTS study_room_join_requests_requester_idx
    ON public.study_room_join_requests(requester_id, status);
