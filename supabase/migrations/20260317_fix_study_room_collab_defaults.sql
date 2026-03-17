-- Migration: Fix study room feature ID defaults
-- Because some Postgres setups lack uuid_generate_v4() in the search path, 
-- we switch to the native gen_random_uuid() to guarantee creation of polls, documents, and chat messages.

ALTER TABLE public.study_room_messages 
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.study_room_documents 
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.study_room_polls 
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.study_room_poll_votes 
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
