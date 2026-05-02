-- Fully-Provisioned Migration for public.community_members
BEGIN;
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(community_id, user_id)
);

DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('18770987-b10f-4754-87ef-9618070c6b1c', '74ce135a-1464-473e-94d7-28cfb2071e32', '27d1ad60-6d73-439d-b4b2-4a1827371c24', 'member', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('198d8e79-ac33-454d-9401-73c8e1c28a94', '1806568e-46bb-423a-b1a2-85528d9a9437', '8798340d-7df4-4160-942a-5d222ea427b6', 'owner', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('267f9c3c-f618-4c4f-98ce-b6cd2a3693ba', 'dbec786b-5de4-4576-a678-0b0541ef15e4', '8798340d-7df4-4160-942a-5d222ea427b6', 'member', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('3bc63bdc-0963-45b9-b8da-b2020d7d3176', 'dbec786b-5de4-4576-a678-0b0541ef15e4', '2248fc95-8840-4f5c-9824-327bfbc65c70', 'member', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('3fbb85db-7af2-4b37-9e2f-e513f3d2ef73', '74ce135a-1464-473e-94d7-28cfb2071e32', '453fa778-b1c7-4bab-b408-7e92fc28e009', 'member', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('67964a35-2b2f-4d56-bfbe-328371a59c2a', '74ce135a-1464-473e-94d7-28cfb2071e32', 'ee09fe2f-eef3-4042-9d0d-c7be02aa2bd5', 'member', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('75ab0ed8-6aa5-47d2-b64c-c2a12d2370d8', '74ce135a-1464-473e-94d7-28cfb2071e32', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'member', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('7c05d823-4d48-48af-aa54-ba81af89ba02', '74ce135a-1464-473e-94d7-28cfb2071e32', '8798340d-7df4-4160-942a-5d222ea427b6', 'owner', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('8aabe3ab-7711-4587-bc49-d51bbe459971', '74ce135a-1464-473e-94d7-28cfb2071e32', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'member', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('8fc49c27-04df-4f8a-ab5a-c8fe1c667a44', 'dbec786b-5de4-4576-a678-0b0541ef15e4', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'member', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('94f99e2b-884e-4233-82fb-4cf7dc20203a', 'c3614a5a-8e67-47a2-868b-d54360025fab', '839042fd-c42a-47cf-84c8-b0ea72e446bc', 'owner', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('ae4d395b-5cd6-42c0-ac62-7d5ce5e02aa9', 'c3614a5a-8e67-47a2-868b-d54360025fab', 'e16707da-3f96-4cf3-a1ca-5696ac25d4ab', 'member', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('cda30e41-b849-40ad-91bb-2a69863d548d', 'dbec786b-5de4-4576-a678-0b0541ef15e4', 'd8484a31-77d6-49c3-b433-98614c8a71a0', 'owner', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.community_members (id, community_id, user_id, role, created_at) VALUES ('ffa90c1b-ae47-4d12-94b1-168244dc842b', 'c3614a5a-8e67-47a2-868b-d54360025fab', '8798340d-7df4-4160-942a-5d222ea427b6', 'member', now()) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
COMMIT;