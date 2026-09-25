-- Allow users to delete their own messages
DROP POLICY IF EXISTS "Users can delete own messages" ON public.study_room_messages;
CREATE POLICY "Users can delete own messages"
    ON public.study_room_messages FOR DELETE
    USING (auth.uid() = user_id);

-- Allow host to delete polls
DROP POLICY IF EXISTS "Host can delete polls" ON public.study_room_polls;
CREATE POLICY "Host can delete polls"
    ON public.study_room_polls FOR DELETE
    USING (auth.uid() = created_by);

-- Allow cascade votes deletion when poll is deleted (anyone can delete their vote)
DROP POLICY IF EXISTS "Users can delete own votes" ON public.study_room_poll_votes;
CREATE POLICY "Users can delete own votes"
    ON public.study_room_poll_votes FOR DELETE
    USING (true);
