-- Fully-Provisioned Migration for public.study_rooms
BEGIN;
CREATE TABLE IF NOT EXISTS public.study_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('15c74cfd-695d-4004-9516-43b4df842b4d', '8798340d-7df4-4160-942a-5d222ea427b6', 'Organic chemistry', NULL, 'false', '2026-03-28 18:39:06.921006+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('23aaa1d2-8c4b-4784-87e7-d42443b290bb', '8798340d-7df4-4160-942a-5d222ea427b6', 'late night ges', NULL, 'false', '2026-03-14 21:50:40.286166+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('27c8c4a6-1f2e-4cb1-8357-4cb77e176188', '8798340d-7df4-4160-942a-5d222ea427b6', 'tdb for ges', NULL, 'false', '2026-03-14 21:47:00.054913+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('31baa2f1-8748-462b-9887-32a513348f1d', '8798340d-7df4-4160-942a-5d222ea427b6', 'test room', NULL, 'false', '2026-03-26 21:12:43.748025+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('59307a2b-b9f2-43a5-8e62-6140ee733a0c', '8798340d-7df4-4160-942a-5d222ea427b6', 'fin', NULL, 'false', '2026-03-14 23:07:31.316857+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('8240d51c-7c22-4c8e-b963-f04ef8df845d', '8798340d-7df4-4160-942a-5d222ea427b6', 'eco203', NULL, 'false', '2026-03-15 18:34:53.928311+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', 'Eco303 study room', NULL, 'false', '2026-03-17 09:03:40.485121+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('934b9eea-f8fd-4523-b8f4-6874cbc983be', '8798340d-7df4-4160-942a-5d222ea427b6', 'fina;s', NULL, 'true', '2026-03-22 15:54:25.437445+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('ab1ac5e5-93f2-4357-9b1b-610084346aab', '8798340d-7df4-4160-942a-5d222ea427b6', 'Eco301', NULL, 'false', '2026-03-30 17:56:42.583822+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('ad230888-a824-4752-911e-eecd0b5859ec', '8798340d-7df4-4160-942a-5d222ea427b6', 'GES105 2025/2026', NULL, 'false', '2026-04-07 15:02:58.477987+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('c2727dc5-1c83-4916-92d8-722e0bbe8581', '8798340d-7df4-4160-942a-5d222ea427b6', 'Eco303 study room', NULL, 'false', '2026-03-17 09:03:06.279135+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_rooms (id, creator_id, name, description, is_private, created_at) VALUES ('f7f1338b-92a6-4d48-a663-c1ce7393f66a', '8798340d-7df4-4160-942a-5d222ea427b6', 'ECO371', NULL, 'false', '2026-04-07 15:14:40.626179+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
COMMIT;