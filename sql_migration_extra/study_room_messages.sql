-- Fully-Provisioned Migration for public.study_room_messages
BEGIN;
CREATE TABLE IF NOT EXISTS public.study_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.study_room_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    image_url TEXT,
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('0464b9aa-daf1-4d98-8768-8f07993c3383', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', 'youre welcome', '2026-03-26 21:23:17.786266+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('11484380-7ecb-460c-a7d1-40c922ed96dd', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', '[voicenote:b41ee454-8451-4203-ac9d-164ae63edcf8]', '2026-03-26 22:33:35.110139+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('1db793f3-ccdc-43b6-9a0b-9f8b5e35d596', '23aaa1d2-8c4b-4784-87e7-d42443b290bb', '8798340d-7df4-4160-942a-5d222ea427b6', '@AI what doc is available', '2026-03-14 22:56:53.588382+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('1fc01d85-be96-4aab-aef6-a387112d10e9', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', 'ok', '2026-03-17 17:53:45.805325+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('209cc3bd-5a3f-46cb-9b83-d0b9e6e44c54', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', 'Testing', '2026-03-20 08:52:49.535649+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('2fbd52b9-e057-4535-9cfc-6be3d1c4f5e0', '8240d51c-7c22-4c8e-b963-f04ef8df845d', '8798340d-7df4-4160-942a-5d222ea427b6', 'hi', '2026-03-15 20:02:13.876847+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('3383f1aa-1661-4bd7-b9b8-7dfb4f6ea8e5', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', '@AI Quiz me', '2026-03-17 10:50:34.865384+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('3e2522d1-0bc5-4b19-8f0f-73d443413ca4', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', 'hi', '2026-03-17 17:54:28.823619+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('3f53534f-7ceb-4205-b83b-408cfc8e50e8', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', 'okay guys', '2026-03-17 17:36:18.939281+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('4646a038-7278-4a52-9948-95513803fd9e', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', 'hi', '2026-03-17 17:58:33.061956+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('57f4910c-ac7d-4bad-a6ea-0e25e9913f21', '8240d51c-7c22-4c8e-b963-f04ef8df845d', '8798340d-7df4-4160-942a-5d222ea427b6', 'A', '2026-03-15 20:05:31.695633+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('5e63d9c1-a622-466a-b0a7-f606ea743caf', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', '@AI Explain this topic', '2026-03-17 17:36:05.262714+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('61db3200-e06c-40c1-8fdf-f638e87fd633', '8240d51c-7c22-4c8e-b963-f04ef8df845d', '8798340d-7df4-4160-942a-5d222ea427b6', '@ai hello', '2026-03-16 12:28:20.104257+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('63cc9952-f358-486d-99f4-b916314ea665', '59307a2b-b9f2-43a5-8e62-6140ee733a0c', '8798340d-7df4-4160-942a-5d222ea427b6', '@ai whats up', '2026-03-14 23:18:47.570095+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('643cb9f4-c2c5-4557-b853-d8443cd4b517', '8240d51c-7c22-4c8e-b963-f04ef8df845d', '8798340d-7df4-4160-942a-5d222ea427b6', 'Hi', '2026-03-15 21:15:11.399997+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('7182bbc0-0c07-4e21-85fd-0a4cbda64bfc', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', '@AI Summarize', '2026-03-26 22:41:51.075389+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('7b5411d9-f2b6-4105-b75a-6643ed1e4172', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', 'b1ecd046-8040-4299-a98f-040422e15b78', 'Hi', '2026-03-23 12:06:39.216081+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('7e181526-16ae-4871-803f-a9b20213aa40', '59307a2b-b9f2-43a5-8e62-6140ee733a0c', '8798340d-7df4-4160-942a-5d222ea427b6', '@AI Explain this topic', '2026-03-15 18:34:06.276004+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('a487be5a-0846-4a53-9415-aff6765b175c', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', '@AI Explain this topic', '2026-03-17 20:15:22.703005+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('a880ccff-1219-4383-bc54-d79aaea2e9f5', 'ab1ac5e5-93f2-4357-9b1b-610084346aab', 'd364bb68-e2e4-4752-9ed6-88b53ead0c54', '@ai hey', '2026-04-02 19:12:33.456719+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('aa70ae0b-f732-4c29-861b-4507ac1fe681', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', 'Hi', '2026-03-17 20:15:04.209851+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('b2eaa214-3d04-4d80-aed4-fb991f804d7d', '8240d51c-7c22-4c8e-b963-f04ef8df845d', '8798340d-7df4-4160-942a-5d222ea427b6', 'Hi', '2026-03-15 21:06:18.72139+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('b612259d-28a5-44e9-9717-98a999d51ded', '8240d51c-7c22-4c8e-b963-f04ef8df845d', '8798340d-7df4-4160-942a-5d222ea427b6', '@ai whats in the board tab', '2026-03-15 18:41:53.745115+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('bb0d57b5-14f0-4436-9267-74268a7283b7', '8240d51c-7c22-4c8e-b963-f04ef8df845d', '8798340d-7df4-4160-942a-5d222ea427b6', 'whats in the boards tab', '2026-03-15 18:41:41.467889+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('bd88cfc6-bf51-4dbc-af53-56c509267069', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', 'b1ecd046-8040-4299-a98f-040422e15b78', 'Hiiii', '2026-03-23 12:06:46.841902+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('ca3efb03-dc79-40a2-8e81-2d1815f7257e', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', '@ai hello', '2026-03-17 09:03:49.984417+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('cd8fd281-718a-434b-bca0-a9337f5ba72d', '23aaa1d2-8c4b-4784-87e7-d42443b290bb', '8798340d-7df4-4160-942a-5d222ea427b6', 'omoo', '2026-03-14 21:56:42.993454+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('d3bea706-b449-4e48-846c-bdb4d0e7cb6a', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', 'this one', '2026-03-26 22:30:54.885899+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('dd2b6893-4725-4267-806e-f57601c810c1', '934b9eea-f8fd-4523-b8f4-6874cbc983be', '8798340d-7df4-4160-942a-5d222ea427b6', '@ai hi', '2026-03-25 10:43:00.063775+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('e73541e1-efd2-4295-a431-e42379c34e24', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', 'this', '2026-03-26 22:31:13.874527+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('ed082376-8238-426e-8ec1-86661e464fa9', '8240d51c-7c22-4c8e-b963-f04ef8df845d', '8798340d-7df4-4160-942a-5d222ea427b6', 'hi', '2026-03-15 19:45:29.030174+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('f9c7d28b-d183-4f6c-9129-c1e4a28cea6a', '8d6c521d-bc8a-4ccc-938b-c67f09cb8ce0', '8798340d-7df4-4160-942a-5d222ea427b6', '[voicenote:33e9ccd5-08f5-4876-b43c-09d9110ce3a8]', '2026-03-26 22:30:38.327489+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.study_room_messages (id, room_id, user_id, content, created_at) VALUES ('ffd7828e-1f63-4e9c-95ac-a662f5563876', '8240d51c-7c22-4c8e-b963-f04ef8df845d', '8798340d-7df4-4160-942a-5d222ea427b6', '@AI Quiz me', '2026-03-15 20:05:14.922846+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
COMMIT;