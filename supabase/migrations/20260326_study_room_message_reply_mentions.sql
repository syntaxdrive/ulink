ALTER TABLE public.study_room_messages
ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES public.study_room_messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS mentions JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS study_room_messages_reply_idx
ON public.study_room_messages(reply_to_message_id);
