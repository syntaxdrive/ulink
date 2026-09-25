-- Fully-Provisioned Migration for public.notifications
BEGIN;
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT,
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('00d0dc96-239e-4d8e-8a30-17b6ed05e8f0', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-01 12:49:30.628244+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('00e5ec1e-67a3-44d5-9084-519adc6821b3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 20:51:47.103309+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('00edf748-1531-496d-bd61-fe887c6887cf', '17832d0b-944d-4117-8703-422429b4f399', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-13 20:01:13.168448+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('01098a05-7499-45ae-8f58-c805ea52918c', 'd48e3524-c04c-46ac-8cac-4eb33d09696a', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:15:31.226437+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('01159ab8-29ad-4c12-a4f0-b064425424a1', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-04 09:51:15.784757+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('013c809b-43d9-48e7-9a31-9d8b61feec63', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-03-10 22:15:58.039821+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('017a37dd-a487-4828-b92a-a11e812b4bf3', '03c766f0-01cb-4569-aace-bb480dded7fd', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-30 18:15:27.643202+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('01f11ef0-af3b-435f-a463-f1aeb4f8ae4a', '453fa778-b1c7-4bab-b408-7e92fc28e009', NULL, 'community_join_accepted', NULL, NULL, NULL, '2026-03-03 18:55:09.682692+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('026c9286-9390-4b76-beef-0bf9b6805d18', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', NULL, 'connection_request', NULL, NULL, NULL, '2026-02-25 14:34:15.832561+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('02ae2426-bd78-4340-a937-8f38268bcc12', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-11 14:10:29.280036+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0306e0ab-a966-4d84-aa1e-267a20e25ba0', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-30 18:15:29.949806+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0373bd85-caf5-426c-a5ab-5adfd136dbb6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'admin_announcement', NULL, NULL, NULL, '2026-03-10 18:36:30.163485+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('03a28efc-75ca-4cf3-8f36-c8455379010d', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'like', NULL, NULL, NULL, '2026-03-03 15:39:38.745332+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('03c5342f-9467-4b54-8020-04561bcc86f6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('04859f45-143e-464b-97e4-97e3fa4c4586', '39f77901-3d9d-4be3-b780-a696cf90261f', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-30 18:15:28.501437+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('04b337ce-f75d-418f-aebd-fcb6a06f9779', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-03-10 17:36:54.137974+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0521fa2a-beff-4ac2-9d4f-4582831918b9', '88e8804b-e217-4884-983d-70c7e78f5061', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:15:04.544199+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0547787c-14d9-4745-ba7c-3289bf5bfb5b', '5b2275df-fb04-490b-ac8d-a5cba8607275', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-07 15:46:59.404489+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('05b05074-b3bb-47f0-b251-09b6cf236ec4', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('05c16c3f-d0e2-44ec-99b4-c2912e0df8e1', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-16 14:33:17.376393+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('05d6df35-4dfc-43b1-8b9f-8255dcce3a0b', '7fd09493-6d34-4673-8df5-7d744571cc7f', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 17:33:31.770226+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0678d706-0849-4373-aa99-e3b2840f3c31', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('06bb3653-f84c-477c-8057-0924230ba1a1', 'd364bb68-e2e4-4752-9ed6-88b53ead0c54', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-02 18:52:03.429971+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('06bfdad1-35f6-4680-9f88-1568e404cba5', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 23:10:33.09394+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('077c674b-54a9-401c-afca-ec966e3bb623', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-15 17:23:55.300639+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('081bd869-03f6-47f8-8972-2e065caba2de', 'a55be48a-38f3-4334-9eff-c6594c27be6a', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-07 15:26:08.636012+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0a799be1-d64b-4e02-9e65-7cbf571cdfbb', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0ad505d5-484b-41ec-bb98-2102037a5b4a', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'like', NULL, NULL, NULL, '2026-03-23 18:39:14.571541+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0af82fe0-baa4-44d1-8b03-b5d22b58c2f6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0be8429f-ecec-4b3f-83e6-d1cbae61ecd4', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0c93156e-2483-457d-b5ae-fba291801041', '7dc18219-7f89-45ef-880f-59d95a9c3cac', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-03 07:51:47.357782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0d3cb0b8-3d8c-4591-aa69-08bd292c3c40', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-14 22:18:09.32522+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0d50d3d5-4bca-4bfa-8dfe-dcec3d725ba0', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0d54ff86-75b3-4222-af45-978febf92157', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0d67790c-a6d7-41c1-9e51-ac61fe4e047c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0e103d9b-afe4-480e-bb79-bdc9faee4d35', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-03-22 13:18:15.717923+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('0eb6f0fa-0d8f-4841-9c45-c58b5ab508a8', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('10abd0f1-0222-4fe6-b8cc-e6c3ad967025', 'ef9a5041-bff0-4588-9868-fd34ec58c6aa', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:23.072046+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('10c1fa44-523f-4771-a341-93f98d58d632', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('10dffcf7-8932-4b20-a8d3-dfb31302ac32', '5b2275df-fb04-490b-ac8d-a5cba8607275', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-07 15:22:39.652094+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('11bf8b10-f894-44b1-a3fe-79fdc6315115', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 18:33:01.445475+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('11ce7c6e-628d-459e-a15b-cbc991025449', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('12459899-d927-4803-a873-fbb2fa625a9b', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-24 13:30:10.427057+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('12694a5b-5e6c-4572-9532-d824827c8403', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:43:22.841503+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('128407d2-87d5-485a-86ee-86ab2083501d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('14208425-ef2f-4be4-b175-b9ec5c87c07b', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 10:19:30.643355+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('142e0316-3504-48ca-85ed-28ebeaeb72ee', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1563df78-f186-4a01-9f9d-33d73fdbe901', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 20:52:05.615511+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('15a17fc4-5f8c-414c-8e1c-4e4f91458e3d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-03 07:52:23.686934+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('15a45a22-4601-488f-9ad3-11b587f5bc69', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1600cef5-2952-4113-85c2-d5ca0d360a98', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('160b76ee-e713-4bbb-bb0d-e2949b8042a6', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 14:23:49.140802+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('16485f33-7a2e-4a3a-a1ff-ec140381f5e9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('16d13f68-3a08-456a-9d27-8c989372aa58', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-15 14:34:11.578224+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('16dcc085-0141-4db0-ae07-a3efdad67d41', 'a9279bce-742e-4ca5-a993-a820b18830d7', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-07 15:21:36.898525+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('171a9dae-0a4a-4318-941b-2a5a80385833', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1782da27-5429-498f-8fad-bff7e735ac43', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('17837eb3-ea3d-4fba-9918-132cbffce596', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('17be0f12-7250-47b4-a6fe-670ff2ee4638', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1873b49d-2571-46a9-a317-7504ee72163e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 10:17:31.399954+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('18a2ff9e-5939-4a46-b418-d0d99dce4081', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-04 09:53:13.403049+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('191b5ce5-629f-4613-9bb8-e265d56f3454', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'comment', NULL, NULL, NULL, '2026-03-10 18:17:47.125349+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1a623a12-07b9-4069-ad1f-b9c6116ac71b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1a74dd4e-82af-4c14-b2fe-faa366b4c25b', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-02 09:15:46.4319+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1ac41f30-efea-4104-b69d-78f1632e2a30', '067e9e48-6793-4299-9033-847755b59d70', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-11 14:11:49.112257+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1b09e5b6-dd70-4d5b-ada6-bb67c7adee40', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1b4bc8f0-175b-45a9-9975-63853e5944a0', '4f7826bf-9a4e-4367-bc94-ceb7b322a611', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-28 13:58:09.209204+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1b6a9dd4-dd58-4652-bf27-43206cc72a0a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1bb53363-fc0b-453a-9035-2d1d85976293', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-04 10:54:54.651212+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1bd54575-bf98-491d-83fe-082cead3fd07', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1be677cf-2120-4f36-800d-d29b4a5a27d9', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-03-03 13:25:55.606759+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1c5423e6-98de-45d5-8d42-ab53353d43ae', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-02 18:57:23.894969+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1cbb3ae6-9fcf-4fbb-9db2-7722ad91ec55', '3aaa2a20-4c4c-482a-9e6b-50fe581897cf', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 18:38:32.100345+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1cf0dec3-73f0-48e0-a8e2-be5e719e6033', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-26 16:19:52.808385+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1d29975f-8a40-480c-9517-ec84fdd32e3b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1d3055be-8fe1-4850-94af-f5b76d7d5c46', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1d6c0879-22db-4205-8e43-9044e50724c1', '970b30f6-583f-4cad-8f7e-ebe5175bdb0e', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-11 14:11:51.433037+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1dd818de-de5d-45e7-89a7-cabfbb698c42', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-04-03 16:52:35.034912+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1dda00dc-dd01-4d25-9085-d01bfa4d1e72', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1eb0b879-7a5a-4016-ba00-83d3a37b0f8e', 'a68689c1-dd51-4307-a0ba-730e7f589391', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-23 14:31:47.831286+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1ee68c63-501e-4bf9-ae8d-909e09cff148', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1f699fa1-90fd-4566-a223-e21b91951934', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'like', NULL, NULL, NULL, '2026-03-03 10:19:10.349338+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1fadaf24-badb-400d-9663-9271140eb095', '067e9e48-6793-4299-9033-847755b59d70', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-30 22:31:13.185788+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('1ff9fb18-8a63-4857-bbfd-9e601dbfb4ab', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('20403632-ec28-4eac-a538-e1f2334a4f0e', '5fb35559-3727-41d8-aa11-77189d405467', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:15.534844+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('219e7198-fcf5-4dda-be2a-dfd870ab1782', '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:14:33.408817+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('220ad312-ee44-4ee1-bef7-60e3e239705a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-02 18:56:37.481736+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('225b5850-07fa-4dc1-8ed7-e4b350bfe0f3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2313904b-e3fe-4b4e-9c0f-73d12540e62d', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'comment', NULL, NULL, NULL, '2026-03-10 17:37:44.847109+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('234b35c6-d92c-40a2-aeea-68ee8a36b9ec', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('23eebd1b-7c67-4afc-9b8a-d33238303a28', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'admin_announcement', NULL, NULL, NULL, '2026-03-10 19:19:10.229037+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('24044994-8d99-42df-b639-e46d13360636', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'comment', NULL, NULL, NULL, '2026-04-07 17:35:02.052097+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('24605e1f-4e0e-4133-a0c0-64b9cbfcdddb', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'community_join_accepted', NULL, NULL, NULL, '2026-03-01 19:53:01.997788+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('24c78d8b-866c-4111-a697-dbe0093ff368', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('260ad2da-c021-4a9e-ad49-68b4f3cec6d6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('264fb6bf-a25e-463e-93f2-a0aa2b98c29e', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 13:25:27.107359+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('26c665d2-7379-4fbc-91e0-4a246abbf1b4', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 10:17:33.403847+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('26cd598c-1e53-43ee-b96c-15ad5f797445', 'd9144849-e3d0-4d9d-995f-e13ec3f2ee5f', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:14:37.230596+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2833715c-5bd0-4499-b0db-f532be1f455c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('28d4b35c-2815-4da5-8a0b-90b55bbc42d1', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('290f915a-c2f6-4880-b96c-75c79eb09dad', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 23:10:02.211482+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('29384f97-08bc-42f1-b60e-fd6aec2183df', '5c896f75-c830-42b3-b959-6c7f40879b17', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-27 17:35:38.868824+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2938cf28-6a3b-4c81-b41a-63ee08b9fe61', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('298cb40d-4dcc-4f47-81b0-681c6af34733', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-03-21 01:48:29.616643+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('29ab2ffa-4b4f-4150-aad3-d6df91ddc2a5', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('29b52ad8-031d-47e8-9dbd-41c445d59a42', 'a9279bce-742e-4ca5-a993-a820b18830d7', NULL, 'follow', NULL, NULL, NULL, '2026-03-07 15:25:28.842784+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2a143455-7d5f-4298-b6df-6b8e879a9232', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-04 05:17:14.1592+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2ae34fbb-59a3-4e11-8131-7524d7707929', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-03-04 07:04:08.642321+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2b4cb61b-9103-4cc2-8e18-caa7e1c6cac3', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-07 15:20:28.867365+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2c463014-1835-4bc4-a29a-1ed705c8d12d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2c7ed5a1-d005-4dee-84f2-82127cf79631', 'f0440981-1974-4b21-867b-b808c7f4c704', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-02 09:15:39.410218+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2c9f6a76-7ff0-4193-a8eb-fa25ddf10a5b', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'connection_request', NULL, NULL, NULL, '2026-02-20 23:48:36.043388+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2cef0bd3-32dd-41b5-8a1c-cbb8e8ac18a3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2cfb64a8-c7cc-40e0-9d0b-516713d549aa', '36bfde0b-6708-4d28-83db-4e7583ddf402', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 17:33:31.885494+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2d94251e-a7ec-42f0-9210-a7c96d467c75', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-02 09:17:05.214731+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2db373b2-62fe-4bcc-9198-783cd13b4d34', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-04 10:54:54.198117+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2df83d8d-06b3-4e7e-ad61-65b3a262dad3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-05 17:45:12.903093+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2e652136-f96e-4627-8cbf-887160f3f36f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2e846918-ddd3-48a7-b6dc-9764e67e1a94', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-14 09:55:43.350775+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2ec0aabb-4909-4ef3-bded-f43500d50f9d', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-03-04 08:16:26.953762+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2f4f9cce-c4d5-43aa-9aa6-e8edd93d41d9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('2f76fef8-ab0a-496b-a987-e3a305d49596', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-03-03 23:11:10.798669+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('307a9f09-849c-46aa-8ed7-5f5a74fac5d5', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'like', NULL, NULL, NULL, '2026-03-08 22:00:04.002768+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3098e3e4-49db-4668-9115-bbb6d9e7b260', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-30 19:40:17.351317+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('31e3cfa7-a25a-47c3-a7a3-454d743534da', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-03-10 18:17:30.351485+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('32833643-617d-4635-8d2b-18f2aea3750d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('328466d7-5eaf-41c6-b258-4fcc22d93495', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-18 17:57:15.455867+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('332a4f5a-7e7f-4025-a91d-d5a0d28a45a7', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3351a7f2-00e1-483f-a1e5-762eabb1c982', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('339e30a7-4ed3-4109-a4b3-a07b175a3176', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-03 09:04:59.105835+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3422ede6-bae7-4695-aef8-0a1248b0d344', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-03 13:26:22.219298+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('343401ef-ac19-4580-9da2-36973b7f4c5f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-15 12:20:18.551558+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('34c90d99-29f2-429c-8315-a8cbf104aa9b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('34e615ab-939c-49ae-87eb-33a3af3f65a2', 'c64e6cd0-244d-4e6b-b01e-837f0afe254a', NULL, 'like', NULL, NULL, NULL, '2026-03-03 10:18:07.034093+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('34f84e20-3dec-494a-8121-07972b66caad', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 14:55:38.179899+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('353cac9e-46bd-4f69-88db-8e01faf704c1', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-05 17:45:11.61153+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('35958c60-34f6-4cdf-9e44-ae9d9372fdd9', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-02 09:17:39.644139+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('35a5e484-92d8-476c-8afc-ebb90d6b07a0', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('361092d4-2420-4788-9570-04b1f44033a0', '5b2275df-fb04-490b-ac8d-a5cba8607275', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-07 15:58:28.759784+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3698777e-89c0-479d-aa6f-0af51326238a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('36bb2b7f-37d0-4d44-8f1d-c1a45e7b6ddc', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-06 15:38:52.725866+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('36c016d2-a00a-4fcc-9c88-b225493e0eb2', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('37d44410-bead-4aad-bb08-30a546eef4b8', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('38221c6b-2f15-4d25-a610-6d9253a96f9b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('386cf4a8-b16e-4b61-accd-60f9844ca076', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('389aa58e-db08-4382-80a1-bcc7424c5a76', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-04 11:19:52.345334+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('38a2fbf9-17b5-45c6-b9ff-d40859e3198c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3983db08-89b1-4d8b-8bb6-5882c819a554', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('399f1727-5570-4512-a36d-af29c3f9b2de', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-06 15:56:03.213672+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('39c0e4d9-5c65-4113-8457-4a1bf223d0bb', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3a077a7d-e47d-4c67-9a3e-76233e0afc59', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3b0c5ca6-2f41-468a-8d66-dd7fc5a4b2e0', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-04-04 11:50:49.894933+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3b876ec0-f8f0-42e0-83a0-0680c8c57d15', '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-30 22:31:01.544481+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3b8d7c80-481d-4d49-8956-60b29e4d0e07', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-15 17:50:41.709705+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3c22bb46-fd65-4be9-9590-f808be2273db', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_request', NULL, NULL, NULL, '2026-02-28 14:16:43.25784+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3d3a9a5d-b80e-4eac-a0af-10b255642b57', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-02 18:53:51.061866+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3dd8342c-06c2-40a4-b773-2decf7f7bd00', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-02 09:15:41.55917+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3dde748a-0911-42b5-8c65-dac7122e0137', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3ddeb89a-2c73-40e3-8c50-3791e43137f2', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3e902e56-b3ed-4325-b88e-559b81818490', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-03-30 00:43:40.622539+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3eaeab3a-a84b-485d-a393-e48cd2d634b8', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'community_join_request', NULL, NULL, NULL, '2026-03-05 18:05:25.570556+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3ec0ce4c-8f2e-4d69-a07e-85b2e245dc9f', 'b564969a-bbf5-47cd-bb2e-404854045f70', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:15:04.541624+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3fab6a5a-45a4-4c90-bd1d-63ae61595751', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('3fd8ae97-4ad1-4166-bb88-77df6962bad2', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4018087f-df8c-4e2e-93dd-5316517e4e70', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('402688a7-ad63-4727-bbc7-6faa1308900c', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-03-10 22:15:59.43559+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('402aece5-c3ce-457a-bf59-c28659da7813', '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:42:44.412397+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('40541352-0d39-4287-a896-11380f0e4385', 'ee09fe2f-eef3-4042-9d0d-c7be02aa2bd5', NULL, 'community_join_accepted', NULL, NULL, NULL, '2026-03-05 18:23:08.270364+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('40f4e4ab-84a4-4966-bae0-222e1f541287', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'podcast_follow', NULL, NULL, NULL, '2026-04-02 19:13:36.764173+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4114b777-8ac4-459e-b37a-619bdb560dd5', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('41712655-4fc7-469b-999b-451c9e1a2ba1', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-18 10:13:04.666892+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('425df512-eb94-4141-95fb-805f77d131aa', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-11 14:11:32.345372+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('427435c4-1e45-410a-820d-8e7a31fe301e', '17e6a244-29dd-4a76-b202-f41cdcd6b3b1', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:10.520179+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('42a972c9-fce4-495e-9963-cee145978e1b', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-03-06 22:46:40.979545+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('42e6e335-a410-4a6e-8f3f-d1acb94cb54f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('430b9554-eeeb-4769-b86d-84fc2e1734d9', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-03-30 18:16:06.063633+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('44968e88-3d2f-41f8-8b10-01f1a18bb1ac', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4541babe-432c-4ff6-84b5-253e16118b03', 'f0440981-1974-4b21-867b-b808c7f4c704', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-31 17:40:15.86449+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('45efbdef-0d0f-48d2-a571-1f880dc95bf0', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('465d2a42-07b7-4de1-b28b-cc391bef1987', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-13 20:10:56.53717+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4699d386-6c58-443a-8733-0230ab3acb6c', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'comment', NULL, NULL, NULL, '2026-04-29 17:24:37.407958+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('46c6760f-eb88-4921-99c8-e0577fc0095f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('478992c0-5e57-4240-a0b4-533ef6ed9c1e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-04 11:19:56.236786+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4827ece9-c619-4f6c-94dd-ce13d23ddf1f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 21:30:02.848531+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4835804b-275d-4402-9fb0-241dbd25d45d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:43:01.813642+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4862c15f-eb65-437e-b170-47286ee0bcc1', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('491a8c37-fd32-4cbc-9f09-98dc4803a830', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-03 17:21:48.968456+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4a0ba1f6-c330-43aa-a0ff-f40d47ab3ed6', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-03-03 15:39:31.95004+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4a1e4c3c-9939-4d35-ae41-694ef0602b9d', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-03-22 11:30:12.872005+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4af1a88c-a112-40f5-8872-bdb2dc291d78', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'like', NULL, NULL, NULL, '2026-02-21 01:11:18.89914+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4b4d36b0-3f83-4041-abb9-2b1d54c6fed5', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4d72bf09-0463-4a40-bc05-c60be47e0c51', '4f7826bf-9a4e-4367-bc94-ceb7b322a611', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:14:59.882576+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4f20cd30-9f9b-4640-99d9-4b13e263b70e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-03 08:29:38.275303+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4f4d5978-d359-48e1-bcf1-90cbd0e9dccb', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-10 18:14:23.032047+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('4fa61686-3393-4c95-9b30-b337ad207d91', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-02 10:35:09.712794+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5007f80f-7652-4c84-9015-3be5db70d865', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('50382163-40e3-4837-bc7c-123ef03b7f7a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('504e4288-c263-4dcb-9d76-b30c8c6fa622', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('50560fd7-c038-4cd3-aa95-4a34bcac436f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('50a44ed8-14f6-4f1d-baf7-7b9c78acb276', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'community_join_request', NULL, NULL, NULL, '2026-03-03 10:18:48.991284+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('50c77019-27c3-4621-bcb0-f52731c14eb9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'comment', NULL, NULL, NULL, '2026-03-03 10:17:51.345692+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5204bd44-9bb2-44a3-9ee1-300049f9fc30', '453fa778-b1c7-4bab-b408-7e92fc28e009', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-14 11:16:49.710498+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('521ea131-dac7-4902-bcd8-4d43778409f8', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'community_join_request', NULL, NULL, NULL, '2026-03-02 20:49:00.366954+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('52782167-5669-43d8-91d6-cddb9ead1cbb', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-03-03 13:25:55.574635+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('52857988-b3ea-48ff-a24d-cd62760b5ed6', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-03-21 09:25:01.308133+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('52b9261f-02b2-4430-a2f2-8a6bac2d44df', '11ee4c78-396c-45d1-bb70-56ddea408bdf', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:31.193414+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('52f714de-e0bf-4a71-b417-dde6920b50cc', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-04-02 18:54:00.257883+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5362a4b2-da0a-4c8a-942d-c9d02f4434a9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-15 17:24:00.257884+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('537042e8-6131-48ed-b259-27088823820d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('53b6bfcb-ab28-44bb-b225-b6610878127f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('549ac75b-a450-4095-9e52-4bebb38f0fad', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:43:08.114954+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('54a85e6f-58f5-4080-a0f6-7dc8172f0de2', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-02 20:40:10.050442+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('54cb5e44-703e-478b-b38b-1ceba2805abc', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'comment', NULL, NULL, NULL, '2026-03-20 08:50:00.263926+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('55a750fb-3246-427c-a8f4-1c1d2621b295', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-05 18:40:43.017561+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5622df50-237b-4170-9436-1d8ec3aef496', 'e6ea1ee5-4ccb-4dd5-a0c6-4e0f629a3b66', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-01 23:50:24.152252+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('562ad0e8-b5dd-496d-8f76-c7bedd64a929', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-27 16:48:47.432496+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('57618851-26a1-47ec-90b9-89376950e094', '0d2191b3-01ae-4e61-8264-a4bc6f189858', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:46:21.762254+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('57a314a8-2cf9-49e1-ab82-68c903ea19b7', '9ef59e65-b448-4e41-b0c5-cbca525d8277', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 21:54:20.047697+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('582ae42f-7499-4c81-abe5-4fded9ab78fd', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('583d4ff1-0243-489f-96b9-6accc283caaa', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('58ee962d-e355-4010-bfb9-31469ff587e3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('594c3c16-9f5e-46ea-bf58-61c2c49c84fe', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-04 06:47:55.184543+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('59976a30-923d-428e-9f84-1369954e2548', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-01 13:22:12.31808+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('59de41f2-b4c2-4371-a1b5-b0405cc6fd2a', 'c64e6cd0-244d-4e6b-b01e-837f0afe254a', NULL, 'like', NULL, NULL, NULL, '2026-02-28 13:27:43.004516+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('59e45f0a-060d-440c-91f9-16ed4f171c33', 'ceb9be04-6648-4050-bf51-6eef782af33a', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-30 19:41:02.378618+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5b4e8d6d-6fe3-4cdc-bacd-f413554c06a7', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5b85c9c6-1a43-4bab-9758-0465ac8591e3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5cfa9079-929c-497b-842f-0cd4b2d1c042', '04b8b975-9e5d-402e-8c15-b1cfbc692955', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-13 20:01:26.364534+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5e259836-fe16-4b99-bc2a-5b0d33f43847', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-03-24 13:31:17.97324+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5e3a9964-70dc-412d-83c4-44a6a49c24d6', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-24 03:23:41.680412+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5e64b10c-5760-41fe-9fad-1256048a7e81', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-01 12:49:38.064422+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('5e91a5e2-7b02-4779-8156-71811a6566bd', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 20:50:01.360699+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('604ccb46-3202-4010-9e35-858ee77203b8', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-15 17:50:25.101185+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('60d3817b-80dc-4932-bf78-cc699dd989cd', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-04 08:14:20.113255+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('60e6d864-8b23-4319-be8a-dbf44e7be7db', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('610a9f5f-d2cf-40b9-a0aa-495ad17f1cdb', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-30 18:15:30.52755+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('61519fca-4fba-4e7d-80ad-7b76922a1e6e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-03-14 09:56:01.467328+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6196a22c-9fe5-45c7-af21-1e66f033798c', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-03-21 09:25:08.863569+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('621e4d88-773a-4e77-b45f-7666dda1004e', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:14:28.736191+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('623dab6d-6e5e-4951-82d1-7285777b494d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('62a52c22-7ff6-496f-8a22-37903d3e6abb', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-04-05 05:49:42.702718+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('62be6f65-7e87-4859-9dd2-d6dbe7338ca6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('630b6fcd-ecec-4971-bfa6-5f1a3cebe4ad', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-26 09:44:37.230136+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6314c602-e6e3-4544-acb9-88386a7fefbd', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('632f5aa1-06f9-4839-9620-26da6799503b', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 21:31:00.181187+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('634fb57b-aed6-47e1-9a6e-52fa88a7e769', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-02-21 14:09:27.263809+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('637c0d31-559c-44b7-ae8b-807713b714a1', '03c766f0-01cb-4569-aace-bb480dded7fd', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:20.679656+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('64373f80-4365-4258-9817-0f382fcb4ea1', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-21 09:26:57.79757+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('64e50c0e-a64d-45e7-b345-32f06e460480', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'like', NULL, NULL, NULL, '2026-03-26 18:00:41.9063+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('64e6adcf-5503-4594-a789-a641bd384faa', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-02 18:51:04.300013+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('64f5dfd4-6385-4de8-b5c8-fb0b5e9c1100', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('65191d66-4394-4e41-956f-a06e436e6d70', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-26 09:43:15.904953+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6595a9f4-942b-4964-8e31-7a83e99858f9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6607e278-227e-4222-9cc6-a06e82c287ca', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-03-29 07:22:11.216415+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('66205f0b-5381-4d1d-ab67-8f990401687d', 'aa79a01d-8d67-41f4-ac51-a2e3ab97aff9', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 12:29:53.065595+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('66e3f44d-3609-40af-b408-ddb3bbc8e45d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('67068203-2040-46a0-bcab-f45098eca151', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-08 18:08:22.187878+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('672f758e-3e4a-4e72-a1d4-6fd0e5d6dd15', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('674b838d-c4cf-4efb-972c-a3c66b6c714c', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 21:29:12.497354+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('677f78ec-0bbc-4611-8b78-5c7d540d91e9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('67c387d4-4831-4573-b026-9b2865af17d3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'comment', NULL, NULL, NULL, '2026-03-08 12:10:51.867386+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6813d385-6970-4ad3-b8dc-3271408a3ee7', '453fa778-b1c7-4bab-b408-7e92fc28e009', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-03 10:41:11.280162+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('689f77bf-a530-4b49-be31-ef96c5977499', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-02-21 11:29:25.858538+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('68f174f2-1465-4afa-af2f-2cf1b9b46b59', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-03-03 20:52:14.519922+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('691a3a1a-7038-4262-9e7d-cf69c9b6e863', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6984f0fd-ab87-4aa8-8901-95298eaecfd8', '7dc18219-7f89-45ef-880f-59d95a9c3cac', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-03 09:47:05.504569+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6a4d5b97-bd5d-46d1-923a-318583ccbc1f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-30 19:40:10.200848+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6a5dd31b-3448-4f82-a6ce-7d4589f83489', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 21:29:54.650735+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6a664c33-c514-4c16-b537-a4ac93ef79ac', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-02 20:43:15.796133+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6b4392a1-d87e-473c-a2f5-0a1d36169570', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6c4f5475-3ade-4666-b490-b99d7ff365eb', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6c62bf62-0163-4c52-b277-ae8ca759aa8a', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-02-21 06:16:38.616657+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6cc118b0-5ebd-4d75-a94d-53b2a82e2c4c', '03c766f0-01cb-4569-aace-bb480dded7fd', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-02 23:34:31.642879+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6d15fac4-3b7d-450a-bf10-840bebb12e4e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6d67fb7b-5996-4de8-83e2-0c2329aa0048', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6db7f409-fa6b-46d7-b35f-450e074b2762', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6e1dc700-9402-4414-b0ec-a3424aa42110', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-29 07:22:03.554672+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6e579251-a81f-43a4-9b94-ffb0c9d7fdd7', '067e9e48-6793-4299-9033-847755b59d70', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-31 11:33:59.610382+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('6fb44e8e-f5ae-44ed-b02d-d5bb0f17679c', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-03-03 21:12:26.030805+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('700cdbee-720b-4738-830d-29cfef65b336', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-02 09:15:40.0479+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7067d3ab-25f6-4c6d-904f-aa14d4e29ebc', '0dafb94a-ae6a-4985-945d-6b4bcdb721ae', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 17:14:30.174256+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('707f9966-a35e-419f-b34e-d12d020a3d85', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'comment', NULL, NULL, NULL, '2026-03-01 19:00:20.476718+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('70cc9e53-d943-4b71-9b23-91cd322d3e30', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'comment', NULL, NULL, NULL, '2026-03-01 12:49:53.845872+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('70ee68f0-e606-4c44-befd-2aa65b22a4eb', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7100816b-8a14-4ed7-a832-8aeb037a186b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('71604753-3764-46a4-8e51-658d9b1eeed3', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-08 09:54:18.659907+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('71dae8dd-6019-4666-8264-1a1f05c1db75', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-13 10:16:31.502596+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('726d4085-b8f8-49eb-aaef-ecc07aab59e1', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-03 16:52:39.24652+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('72ae7b60-8725-4f6c-8fa3-356bee7f95a2', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'like', NULL, NULL, NULL, '2026-02-21 01:24:38.589117+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('72ba4484-cad2-40ed-b43c-734dcc9ca1e8', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-04-05 05:48:35.605514+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('72c4521a-e8f2-4934-b506-f2db435b79c1', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'comment', NULL, NULL, NULL, '2026-04-07 17:35:02.20109+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('72e2aa0c-beeb-4e08-82dd-3f9c21b2aa09', '5b2275df-fb04-490b-ac8d-a5cba8607275', NULL, 'follow', NULL, NULL, NULL, '2026-03-07 15:25:48.328707+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('73026876-5482-4c87-be7e-1ce36ce4de52', 'd9144849-e3d0-4d9d-995f-e13ec3f2ee5f', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:19.240611+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('73489efb-b1c7-4009-b5cd-d900d004532f', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-07 15:26:06.243775+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('73b1bca4-9496-4987-9414-70f3384a2cb8', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', NULL, 'follow', NULL, NULL, NULL, '2026-03-18 17:32:40.425403+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('73eb0134-f2a3-49c1-b65a-1980545c8846', 'b76e30c2-39b7-434a-bcd9-4d5b94309dbf', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:15:09.062895+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('742e3e1f-6e97-4c83-836a-a79d696e12b5', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'comment', NULL, NULL, NULL, '2026-03-01 19:00:26.199522+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7435b822-0fe1-43ff-a2f2-0ba8708e42fd', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-03-04 08:17:56.09124+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('74606d54-7312-4ad3-ac70-04e21e984c6c', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 16:52:51.108001+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7476a55b-96d7-4710-9831-4e2efd12d52e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('74f1cf70-55d8-46cb-a7f3-6aa3360d6a97', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-03 21:34:10.639053+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('75a17761-501a-409e-89d7-1663d88c8acb', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-13 20:01:05.372066+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('75af6ff0-ec09-4fe6-968f-7f89debdc911', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'follow', NULL, NULL, NULL, '2026-02-18 08:27:17.032623+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7638d1d2-c14c-4489-a2e1-60878ad08053', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7764b483-e126-4020-8337-8c94cc91c0d7', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-15 17:24:10.138108+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('778522df-0c79-4eb4-a590-abedda1f4cd1', '0dafb94a-ae6a-4985-945d-6b4bcdb721ae', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 14:10:29.123077+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('77913270-8990-4835-a1b4-b6f88966b266', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('779f4463-7f55-4f1c-9085-f395a3123fd6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('780fe148-1f1d-4aeb-a974-8dd80f7f11a9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('786ba59d-d12e-4052-8941-feef1a403757', '04b8b975-9e5d-402e-8c15-b1cfbc692955', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:13.908046+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7894d125-f158-434c-b81c-779a1c6109c7', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-06 22:46:14.961926+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7952be86-d506-492e-826c-81046c465027', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('799fa0fe-d114-4266-a909-6030d39bc4a1', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-03-21 09:26:32.885819+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7a5bf9b3-1411-4c02-a1e8-51c0f9c23ce2', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 15:11:12.968193+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7a7bba9f-2a78-45ac-96c3-ba5205487d6a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7b5dbe9e-07af-4d05-a790-93090b0ab072', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7bd9c597-9533-4895-84b6-2e206c31a22e', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-04-02 18:54:03.889988+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7c7c2c41-b0e3-4b12-8161-c332c967ee57', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-27 16:48:51.791889+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7cbaecc6-c01e-4be5-aeef-fd5a9d19ef1c', '36bfde0b-6708-4d28-83db-4e7583ddf402', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:46:21.84139+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7cc01a95-6666-4461-861a-1ffacfd35fbd', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-13 20:01:09.406661+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7d71ccda-ffea-4392-b87a-916a0cba6a34', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7d974f86-8c3b-465c-9bce-a4004a6be9e4', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-02 20:43:14.338219+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7de441bd-cb98-4cb5-a3fd-86b44fc87675', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 10:19:26.425952+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7ed197f4-2728-4723-a43a-609bff13de75', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-03-03 21:30:19.347782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('7ef9ce56-84be-4bf6-a546-cc1f36839f6d', '39f77901-3d9d-4be3-b780-a696cf90261f', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-02 09:15:40.995748+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8068b3c5-e3bf-41cd-8288-42f0c7051892', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-07 07:28:40.991349+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('81544ff8-3aa5-40cc-9eec-0e5821f4c717', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-03 16:34:13.831549+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8190e1d5-ebcc-4aec-9d02-d228f939801c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 15:11:10.210918+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('81d04178-b85e-4755-9521-bc87512d52a9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-29 07:22:01.223846+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('81d09945-92a5-41ad-942e-52a5050efbd1', 'a68689c1-dd51-4307-a0ba-730e7f589391', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:17.220317+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('82699724-99f5-4029-ac01-d5af6c5eb85b', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-04-30 20:35:20.345935+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('82c6f6cd-9a34-4ed3-92ab-e4ef9e370882', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('83961833-6a6e-4e40-bbb9-f41572dab512', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('84231887-622f-4814-834b-81f6a7a0ac2b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('845a0d83-e115-450a-b137-8dbdeb1d8b2a', 'e619eaa4-5bcf-4a3e-bce5-ba966d18df45', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:32.844969+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8467ca25-efee-47a6-979b-7713bb8fb035', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8474821d-f5a5-48a4-8927-a4e009c702e7', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-16 12:03:59.707612+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('84c1a4a1-9076-4039-bef4-4343c263de76', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-02 18:53:55.363081+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8517193f-7d4e-43d6-bb82-d26a148101fb', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8517bc91-98e0-4028-b31b-b3af536ed31b', '8e1d27c4-f95e-4daa-81c2-c759368d7da5', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-14 11:14:56.359117+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8610d7eb-fade-4abe-8012-ad8e60a0a377', 'a68689c1-dd51-4307-a0ba-730e7f589391', NULL, 'comment', NULL, NULL, NULL, '2026-04-05 07:13:32.841537+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('86220753-ae3a-4ed0-9855-4e54f82379c7', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-04 09:51:13.841962+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('86274e29-1112-4b00-ac6a-17a8c697709b', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 10:19:22.590239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8647c6cc-5c22-401c-acbe-a6bb37b9ddb0', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('866d1142-f440-4f10-9d89-ff2bbc059b33', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('86c082d4-f490-49f9-aac7-c1e3a2d1257c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8726fca3-a42e-44e2-bd46-cdc7f800925c', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 16:16:27.160457+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8862055a-723e-49c9-a621-69231f5c135f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('88651b34-8d27-4640-a32d-721b5a640032', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-03-19 16:23:26.948523+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('88e9e119-29a5-46b9-bfcf-ff3e19ba5b76', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('88f26336-4366-4a0e-90f3-33a82950c651', '3aaa2a20-4c4c-482a-9e6b-50fe581897cf', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-07 07:28:25.707321+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('890764f7-7e94-408c-8a81-b7532a9fb547', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('891f1feb-304d-416e-a9f9-5a5fc0010f00', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-03-05 17:45:39.774396+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('894c63b1-a81f-4549-9e97-df2b126cdf0b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8954ed8e-b80a-4c3e-ba7a-601af4d82754', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-14 11:15:57.730132+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('89adec0d-0023-4f30-8b56-c72b12a76993', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('89e62646-32ed-4d7b-b384-46910fefe219', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('89f2e8f1-6873-486b-8a79-fa9aeb48c699', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-14 11:14:45.337784+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8a405b2a-175b-4608-85e5-471af6cfa74d', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:42:49.507992+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8a95779f-e0bf-4981-a7cd-8d44db6ee229', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8b43dbbd-a0df-4a0e-b0cd-deb0d87bf977', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-14 11:02:22.363553+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8b7c09c6-cb09-4886-85d0-a3015635d728', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8b7fee6d-1726-41c2-8502-575b59adad59', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-03-03 15:13:50.875956+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8c1355af-a5e9-4716-ab8f-2cafec9ab986', '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:27:08.084729+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8c4f8db7-2b0a-427a-9031-ae36c5af4ba0', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8c60b8ee-0b4b-406f-ac81-b9608b1ff8fa', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8ced3150-f91e-47d0-b45c-7097769cdaf1', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-16 16:44:05.09593+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8d66f34c-6275-4359-a8d1-425401f892b2', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-16 12:28:45.075866+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8de1e59f-3c75-4c2b-9fbe-e2bcbf97f793', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8e10c7de-a9e3-46b3-9b9c-420b5fef2446', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-02 09:16:44.941094+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8e3839c0-3d37-4443-9d51-e6da197f1f1d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-30 20:15:43.646601+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8e3a6691-9f0c-43a4-986a-65d11584fc28', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-02-20 23:48:23.391995+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8e69d74e-3885-407b-ad33-4e441a642dfe', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8f6fa245-c36f-46b4-8596-ff0c2b31bbcd', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8fa75911-01a0-4533-86ea-7418d1c86a26', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 15:11:07.288895+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('8fc42a68-db7c-4c92-938c-8deb8a230268', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:27:05.941643+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('900c51e3-605f-42ef-845e-e681455add9e', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-10 16:36:19.161439+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('904bef45-6c9d-4f98-8871-2ac3f0f1d501', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('905ab84a-a809-4b2c-9370-af77dde5c58f', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'comment', NULL, NULL, NULL, '2026-03-01 18:48:21.251335+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('90ebfe6f-e487-4a99-a836-e6bb24893872', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 21:29:46.933667+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9167c8f5-832b-455e-972f-043810226791', 'a9279bce-742e-4ca5-a993-a820b18830d7', NULL, 'follow', NULL, NULL, NULL, '2026-03-07 15:21:34.424892+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('91873e2f-c640-4420-a5fb-0a614a7d782c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('91b17709-80a4-437d-8ffe-00bce8456fc5', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'like', NULL, NULL, NULL, '2026-02-21 01:24:37.584124+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('91fbda4a-3ea5-48c5-9324-ab65ed71876f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('92c3b9a6-cc86-4f2a-9fb4-45dbc11565fb', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-06 12:35:16.409906+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('933ac384-7643-48a0-b0e9-9d1a8a3d707b', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-06 15:56:12.643839+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9372fa84-2749-4ff5-9daa-090b5b4d88ad', '7dc18219-7f89-45ef-880f-59d95a9c3cac', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-02 09:15:44.856921+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9382a51f-1066-4eee-b613-4da5f81e2824', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-10 22:21:34.129178+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('93c5979d-5e35-441d-b3b6-8100533a08f0', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-03 17:19:34.530437+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('93ee79ec-60c8-4088-81b3-00dbd642e5d7', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-15 12:32:53.359256+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('93f3d462-bca1-44c1-b4dd-6635106a6b6c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:26:53.532782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('94139738-a0d1-4ce1-acbc-6179e010c3d4', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9442790b-d826-49c5-9805-ba91ecfb1bf5', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-04-03 17:20:06.906796+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('94450c2b-e848-4065-9c4e-2992a3bdb371', '8e1d27c4-f95e-4daa-81c2-c759368d7da5', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-11 19:18:36.174025+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('94526288-46a7-4463-9430-4d110c21e91c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('95150f1a-65d6-4f56-b9a5-b5ec9daf5220', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('95857372-a6cc-45f1-998a-fd14ac355a1d', 'dfa38af7-12ab-4bd3-8a9e-87e71287c3b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-04 16:34:55.068061+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('96b8dcfd-1d88-499c-a188-0f1eb2ceede0', '4f7826bf-9a4e-4367-bc94-ceb7b322a611', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 14:31:52.838293+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('96d75aa3-5ead-4398-83df-a28170c8d030', 'a9279bce-742e-4ca5-a993-a820b18830d7', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-07 15:25:29.038532+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('97296ab0-a8b6-4241-bf35-106a0f24b10a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9879ac9a-672b-4182-864b-c6af79eb6d51', '6be8c692-0ffe-40d5-a202-7de574e99a68', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:04:45.367371+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('99356585-6c2e-429c-b390-d3f4d6f5dede', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('99460257-5106-4e5a-a23d-b323ba2887ec', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('997fb401-81aa-48ec-b885-22b71910427a', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-02-20 23:48:28.48984+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('999af56b-3029-4be9-9591-b6f61fe7743a', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-04-04 09:53:03.276016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('99b542fc-c96f-4d72-a7b5-4625da35abd4', '819fdcfa-c350-4297-b6d0-134171ca15c8', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-05 18:40:43.042349+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9a658e21-8fe0-476c-9168-473e11b6b36e', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 17:09:57.491221+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9a7e0543-789b-45f5-bd33-b3d4e27db4ed', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9a83f79e-13f7-485d-95d2-2c0314f73f2c', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-01 19:31:37.545352+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9b24e55d-2762-4593-8c02-ed26158e749e', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-30 22:31:05.979824+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9b319745-1cb2-4432-b37f-1841520ab345', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9be5a425-2195-4107-a241-0fa0606988d7', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9c1174cb-6e25-44c1-b918-3757f7944c8a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9c68dab4-b650-458f-89b0-483682dedf82', '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-13 20:01:26.412791+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9cc06341-3e9c-4b65-bbc1-90d89334c5b0', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9cebbadd-504e-4d19-ae78-f729a837512a', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-26 09:42:55.413143+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9d09f521-4d44-463b-a65b-edc14fc4b072', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-02 18:54:11.132504+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9d4d2e62-60b5-4a98-8c98-3d3306230de9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'comment', NULL, NULL, NULL, '2026-03-04 05:18:02.437096+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9d945891-4c79-430a-812d-a7ec1dd457af', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-04 11:17:40.290046+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9dc95904-fd6a-4d54-b3a9-35f1b8e58141', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9dded8f0-4da8-4113-943e-fecbee020c41', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9de71476-874c-433f-bded-bca84a65a336', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9e20a305-b1c6-4721-a694-184be14a103e', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-14 11:12:47.095995+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9e57612f-b57a-4e0a-88a0-0af893d74ac3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-04-03 13:26:19.888448+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9e62ac3a-d130-4a56-b6e6-70628fe10b29', '39f77901-3d9d-4be3-b780-a696cf90261f', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-07 13:38:28.837987+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9ea7f052-65c3-41b0-8d20-6d6f7f373884', '8e1d27c4-f95e-4daa-81c2-c759368d7da5', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-13 20:01:14.37372+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9eaae28e-91ec-4765-9f24-98f26ad39ffd', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9ebedc2c-e057-43c7-8b32-066890ff70c3', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-02-21 11:29:54.259668+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9ef3d46a-0d4d-4006-b9e9-c493f25e9551', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'comment', NULL, NULL, NULL, '2026-03-01 18:58:58.317918+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9f220925-5cd6-4643-a4fe-115ab93cbfcb', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 21:31:03.501647+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9fc98f8d-e784-4c85-8851-0713383b1bfe', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('9ff432a0-4f58-4259-9d92-248fcaa3ffe3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a10588a1-221b-4fc2-a539-895758108c10', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-23 14:36:22.393021+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a12ab7b6-c060-44b0-920d-4760e59c3cab', 'bbeaa920-b0a8-403f-8954-03751f843d47', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:46:22.083366+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a3510e9d-b983-47fc-ae8d-0284a5cf749d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:27:16.575578+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a3a3a94c-2615-48de-9630-8b54e3d18818', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-03-03 15:28:16.650971+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a3c33160-fd7a-409e-9b93-3e504480a408', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a4dc39b6-af1b-4c6c-aba4-012cfe9dd46b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a5f9a577-981a-4260-a04a-acc2dc041357', '819fdcfa-c350-4297-b6d0-134171ca15c8', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-15 17:23:58.053038+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a6ff0095-d2bd-4f9c-be3d-c8740b87db88', '24915d8e-82a1-4fb8-b1be-2fbe03d99794', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:46:19.428253+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a7831fb8-7f35-449e-9495-a9f10b461af8', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a841604f-8aa1-472f-aa0f-43b8c02e69fe', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-04 05:17:23.223921+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a8952c1f-8f76-431a-a346-6aa8e4ce0d86', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a89874d9-6d6a-4d39-87a6-a185994d62b8', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a8f83e25-8672-4aac-9b76-9e1dcd07dce9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-08 18:08:01.324741+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a9559cb5-39c5-4b42-a743-7f9653a19919', '9628ab6c-bcb7-4d5c-800c-f13e41844fcc', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:15:30.712477+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('a9ad7f01-21b6-43a7-9f6e-6ef6408450eb', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'comment', NULL, NULL, NULL, '2026-03-10 17:37:36.630871+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('aa8441c8-a071-4c45-becd-284fca0a8214', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-04-03 17:35:54.709942+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ab2b0af4-5020-453c-ac77-1fc3a880af83', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'comment', NULL, NULL, NULL, '2026-04-07 17:35:02.063727+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('abc310ca-9f00-41d6-8711-f2993ea5bf65', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-03 14:24:04.045644+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ac2382c7-0902-47a8-b3f8-21ec9c445ba0', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('acb1451f-db57-45b5-8c2b-dfda6720dd4e', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-30 00:41:48.065137+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ad1a041b-1309-4c45-af21-966729097af4', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-08 12:11:09.526346+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ad1ecfc7-cf36-46e2-bf79-2853e22237f3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ad99c9df-8af5-4a9d-9f95-e7410883f4ff', 'a55be48a-38f3-4334-9eff-c6594c27be6a', NULL, 'follow', NULL, NULL, NULL, '2026-03-07 15:26:27.3032+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b06908c4-fceb-4f05-9c98-98d3b47de033', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b0bb4826-3780-4c00-a347-94583a730770', 'bbeaa920-b0a8-403f-8954-03751f843d47', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 17:33:31.718156+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b0cba118-ecf7-4bc9-9094-3186e0b14e00', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b1d9e59f-0ff1-46a7-8c76-57c8dae48a11', '6be8c692-0ffe-40d5-a202-7de574e99a68', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:43:19.709816+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b21d7d2c-9f62-4dcb-ae3e-ec2f71e98450', 'aead7890-394b-484d-b818-df3158038b8b', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:43:35.443989+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b22b18b4-8587-4428-b6e1-ccfe71923a0e', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 21:12:28.542509+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b24e44c5-f08e-499a-832d-6d76401c541d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 20:10:12.642662+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b438dd8c-f018-44d4-a0de-6caec8609484', 'edc229c9-10e5-4721-8733-e8b74103ddcc', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:46:24.842556+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b4e1576c-bbb5-46ae-8ffe-3211a4d536aa', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-03-30 18:16:09.754775+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b4f97bb3-ee8d-4343-ba10-11456b78ecf7', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b51d7d0e-eaed-488d-aede-5f13a4491733', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-14 11:14:29.40405+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b5ab5373-72d3-405e-bd8c-c7d5d953db5f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-03 15:12:27.156445+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b5d18f99-0804-4b88-9a05-6e24ad2ba002', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-04 11:17:38.809021+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b6157546-a48d-4e85-90d6-ecf8b5435bc9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b6184421-4183-4cd6-9f01-70857482a8ca', 'd21ac845-bec4-420e-b284-6aad2ae0a314', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-13 20:01:16.341633+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b661aca0-a970-477c-9ab4-78ecb2ec9296', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b7293d5b-52bd-4e1a-a765-9129d65dddf9', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-15 17:24:10.887219+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b7ca1a79-deaa-4f37-8319-b7be5a8c3ff7', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b80d144e-a3ae-4be8-beea-842dc16fbc70', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b8453a2d-17f3-434f-b244-6cef748c2b44', '453fa778-b1c7-4bab-b408-7e92fc28e009', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 18:36:53.886724+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b85619f1-c48b-4f7c-94eb-564952b3ac9d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-08 12:10:32.508907+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b88e1962-34c8-4b9a-a9ba-7c4d58749932', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-04-26 09:43:01.828094+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b8b94bfd-4ec4-4fa2-adfd-e1578d5e4d1e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b92ca12a-7535-4b22-ae68-3a5f84edf25a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 10:17:41.617226+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('b988a311-8beb-4d17-8942-70fbfde943f0', '17832d0b-944d-4117-8703-422429b4f399', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-12 20:13:46.829491+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ba4a8b03-b84a-4b9e-93c5-8840e6582b93', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-03-22 18:25:33.75127+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ba935aae-ea5c-440d-9a41-001c3c966a7a', 'e89d2960-f719-4c9a-b210-f6408253207f', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 21:27:23.555226+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bab877ad-d95f-4ae1-abd1-c4376c23980d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bb281f05-b93b-4b31-bc27-ea6dee19c55e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bba84da0-bd83-4cf8-9721-f506afb95f85', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bbc6d8b2-0212-46bf-80d1-9bade704058d', 'c9e1da3c-42f3-40d0-a980-b9281cd89dfc', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 17:33:36.919692+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bc11607d-193d-4583-a414-b7af8feeb568', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bc5c9c1d-8754-4eeb-aacc-24b6a4182c0c', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-04-01 08:20:13.191499+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bc5fd167-4e62-4293-903b-376db37fefdc', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-06 22:45:22.087973+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bc79e35b-7124-466c-a2ce-db854659ab92', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 14:57:57.623213+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bca9ca36-bb9d-415c-85a5-26f0df326c5f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-30 18:15:31.040109+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bcccac44-b0d9-4521-8b6a-cf6925486988', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-07 22:19:16.903737+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bcfdd3e3-fc1b-42ca-97ad-c8c56c5685c6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bcfff452-d512-49bc-8a74-57f4636fd051', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bd01a375-9639-4bc2-8b7b-f82611582622', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'like', NULL, NULL, NULL, '2026-02-24 21:17:08.354598+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bd53f685-5109-4cf7-b230-2c01ffb28b88', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-03-10 16:12:17.062332+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bd5bbd10-b718-414e-b545-b93abed4dbb2', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-03 10:18:07.03977+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('be271e61-f65c-41b0-86d3-f1998150e511', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:42:09.95708+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('be50317a-4276-45b3-ad6a-d62fc9fc536f', '82da2032-6d31-425a-a328-c17a013995a5', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 21:17:39.518866+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('be9b9531-6f2c-4126-92d4-aed9e5e6fe24', 'f67b78c5-2aa8-44c3-9ffb-6c689160dd9e', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 17:33:35.589195+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bed063ae-578d-4fe1-8ab6-eea9184c6c64', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bf0dde81-99b5-4ffb-a3c7-811bf679b741', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'podcast_follow', NULL, NULL, NULL, '2026-03-16 13:49:34.573183+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bf1351a1-ff90-4e38-91a3-2a9c05451684', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', NULL, 'comment', NULL, NULL, NULL, '2026-04-02 18:17:24.522268+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('bfe8db68-06e9-4f6d-8a2b-adb62ce606ea', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-03-03 21:12:23.734987+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c00e0f4a-74ba-4da3-95ba-7f5193718a92', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c0315e14-7819-4fa1-8487-f0715acf9104', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c0dfb69a-f9f8-475b-9dcb-2278cdd8189f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c143ee75-ce21-48fe-8fdf-17161014f044', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-04-03 22:24:34.388007+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c147e02f-afe2-4757-a9be-22e09ba84d00', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c1a8538b-59ff-40d1-8811-6e2a3d33fdf3', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-20 13:40:31.106184+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c1f54935-7ffa-4fff-8da6-465c8771254b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c21c1d8c-bb19-4dc0-927b-d1ede0a72b34', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c3402bd6-bb0e-4258-b21a-8927ef6b6150', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c37f4406-d3e8-49ca-9c0a-13d1be6b0143', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-03 07:51:45.677247+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c411ec43-1d54-4c23-93a3-3668b6f44f19', 'ee09fe2f-eef3-4042-9d0d-c7be02aa2bd5', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-05 18:22:42.897874+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c4504239-97d2-4511-88d1-a990ebffe9e5', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c54887ad-06dd-4aef-8282-8d8ceaf42396', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c56182aa-f435-4c9b-807e-b78332652547', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-02-23 09:21:50.936276+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c58d4a11-8748-4603-8496-b4f7927b3bd1', 'f4926ff6-b964-44bc-be06-f6d9cc91b705', NULL, 'follow', NULL, NULL, NULL, '2026-04-06 16:18:32.980329+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c5e27c22-6d92-4490-86dc-f7397971bc58', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 21:31:06.988116+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c62d4414-a971-4ba3-bc65-943cfe7fc790', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c63f7b3a-0b83-466c-8da6-b77cd366584c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c67c7ec5-da7d-4355-be25-c842b3f74e73', '839042fd-c42a-47cf-84c8-b0ea72e446bc', NULL, 'connection_request', NULL, NULL, NULL, '2026-02-25 14:34:18.0039+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c6968eac-746f-4b26-a73a-3696a1abe1ce', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-08 20:11:45.202237+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c6a722f9-390f-4ff4-828a-962dd442b51e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c6ce6d7a-44d4-4ea4-b2a7-22cc7f141d88', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', NULL, 'connection_request', NULL, NULL, NULL, '2026-02-28 14:16:44.51+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c6cf926c-e06d-4a72-a1d4-0aa46cc3498f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:04:38.694677+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c6ef4743-6144-40fe-a414-34ef0b486e3f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-23 14:31:59.730567+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c7328a16-1cc0-439d-ad37-a251e4cfe7e5', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c76111b8-6cdf-4afc-9ff2-9099eaad711f', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-03-22 11:30:19.033862+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c8358f86-a08a-4b01-b50a-6897ec0ca426', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-01 19:31:34.93316+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c9577e51-b8ac-4b74-b731-959ae1f0267d', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-30 18:15:32.666712+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c99c7046-07d0-4a47-97e9-ec1c073b56cb', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c9b68d3e-6e36-43a1-8273-e7574d9e51e7', 'bb0d3c8f-9e67-4797-b20e-5f403080603d', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-30 19:40:35.026849+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c9c901a7-4ef8-49e1-8b10-93bc41bdd09c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'comment', NULL, NULL, NULL, '2026-03-04 05:21:13.005398+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('c9dd742d-9ec9-4591-b99b-00c9f3dce34c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 23:10:42.66952+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ca347dcd-e27c-4fc0-8f4a-28a5588b0a35', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cb218b76-9342-4380-bbe1-7734e4c24827', '03c766f0-01cb-4569-aace-bb480dded7fd', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-02 09:15:38.973883+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cb2b469f-adf2-44b0-b7ce-213a4c9223a8', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-03-10 06:06:04.21077+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cb830c9e-3fb6-4b35-9abe-d82c2563a8b5', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-03-19 07:11:08.259367+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cbb45807-b989-4a25-a072-0b7287b3afd8', '502bd82f-319b-4e45-a370-b9b402fb2e8b', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:14:33.408281+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cca406be-33cb-4323-b920-bbeb1168e6c9', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'comment', NULL, NULL, NULL, '2026-04-02 09:18:06.113023+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cce05960-5137-4308-80df-24a048d1f71e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 20:51:52.296964+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ccefc280-d765-47ff-97cf-2e80381c540f', '453fa778-b1c7-4bab-b408-7e92fc28e009', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-05 18:40:20.539849+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cdaaa587-4f8a-49b6-9f0c-b5037c01d20f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cdb3331f-3bdc-4a22-bf4a-d697ab43b2d2', '5b2275df-fb04-490b-ac8d-a5cba8607275', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-15 17:24:12.576705+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cdb75204-4dc1-4148-a673-25519a6e7592', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-03-10 18:17:30.434252+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cdce5630-c62e-4a30-9441-0d58a8e12e14', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cdfa5ce2-3c48-4405-8173-2d91f41820c3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-06 16:11:25.583293+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ce44d2e5-8dee-4f2a-ad1a-d8f3160fdee3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ce694d3c-da68-4397-b9ad-d038f9db3684', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'like', NULL, NULL, NULL, '2026-03-08 22:00:09.698363+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('cfb02fd0-8d25-4e08-b5e4-e1ad643197b7', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-18 10:12:54.959538+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d1088334-4b08-425a-b8ab-993e4dcdcfff', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d11218dd-26db-403b-b04b-132498b84bb8', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-04 11:19:45.456801+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d11a112a-e8eb-44d8-a62d-f3e97b6bcd91', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d12bc9d0-96fe-4aad-aee8-e76aa9176853', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'follow', NULL, NULL, NULL, '2026-03-13 10:16:28.911022+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d1705f02-b555-45b8-87da-268f8fd2e1a5', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d188b13b-fcd2-4764-afd1-3b938e968594', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d189c766-49ad-4518-96e9-8cd85a573527', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-05 05:50:02.832199+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d22818ea-980f-414f-a9c5-6e1a0d6ebf97', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'like', NULL, NULL, NULL, '2026-03-18 10:13:42.17109+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d25070e0-6323-45ca-844f-e98e7a6a2361', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d28f14d6-392d-428f-a25c-b0f9af190297', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d3142841-d8b3-4d21-bf95-366969820477', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'comment', NULL, NULL, NULL, '2026-04-07 15:23:53.102503+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d3530075-e547-428c-ae8e-f34f189a082d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-04 05:17:27.3925+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d3f6464e-c351-4ca5-8640-243c730e025e', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-04-03 17:20:03.504766+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d4a0c6f8-8ee5-4185-a750-16bda2c1ebb5', 'f4926ff6-b964-44bc-be06-f6d9cc91b705', NULL, 'connection_request', NULL, NULL, NULL, '2026-02-24 07:00:16.224645+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d4bedd9f-cdde-4cec-bbd2-dfa3b8bcdda5', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-22 06:35:38.642411+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d4c7713c-c8ac-450c-8084-0bbdd70f980b', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'like', NULL, NULL, NULL, '2026-03-03 20:52:20.603914+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d530b2d8-dd92-4a32-9303-1b7a0bb668c5', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-15 17:23:55.439686+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d53b38ee-0a6c-45b2-b14c-cd32005a3ec4', 'a9279bce-742e-4ca5-a993-a820b18830d7', NULL, 'follow', NULL, NULL, NULL, '2026-03-07 15:24:52.585146+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d5486a15-84be-409e-95a9-bc1e4f2961ca', '9988b701-3a3e-4942-aaf6-059c68e5aa26', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:43:27.909295+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d54da28b-ef2d-466f-8874-7c1deaa3e682', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d58df952-9b26-4e6e-8dae-0033f51e94ff', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-02 09:15:44.217385+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d7014109-5fcd-49d3-8052-9ae755105d43', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'follow', NULL, NULL, NULL, '2026-02-25 18:14:31.634549+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d71c0ce9-baaa-47a6-bfcc-11bd0732f9a3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d72b62ed-5c80-40b7-aa04-5474951cabb2', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d7a0a6ae-a35e-4f6d-80dc-8b54a9914f43', '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', NULL, 'comment', NULL, NULL, NULL, '2026-03-06 22:48:36.568984+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d7fb8338-0954-4121-a84f-b15d32f23cc8', '8830cfc3-363b-4b21-ad54-596bb64fe2d4', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-05 18:43:26.711944+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d88a51ba-dab7-46a9-9d16-3f18637322c6', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 14:55:40.724436+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d8c23380-cca9-4aa0-93b4-8db52ee1c4d2', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d8d94f8b-6c8a-47eb-ba84-9a2282f30ce8', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d9c572d6-8a21-47a0-a238-b54170454c44', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-07 15:26:06.253566+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('d9d26165-bdb8-47ff-9b47-860c79d911e7', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-03-03 15:13:53.167122+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('da1c4f46-9062-41d7-827c-929de3821156', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('da83f856-cef5-498e-b4ce-5246c3bc0ed3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 20:15:37.859041+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dadafe25-4a1c-4bea-975a-4ecbb1d2fbaa', '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-30 19:41:02.370841+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('db10548f-42f6-42d5-badc-eaa2b48717b0', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('db4853e7-cb3d-44b8-9ffc-fa4e4c810176', '2b3af27c-8395-4da3-8f28-ca3b0ee2b5be', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:15:13.148546+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('db680a06-538a-4928-adde-1314cc201caf', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:14:27.874715+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dba1b925-743b-481d-a726-1f92740d5990', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dba7a624-ebd9-4aad-9b85-21924b8f2c95', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-03-22 11:30:29.249154+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dbaf73c0-0130-413e-bf94-3901b816c2f8', '056f944f-5d1b-445d-ad66-9b34b7d06322', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:24.399+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dc1c613d-aa75-4468-948f-100a88dc4f53', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-03-29 07:22:06.776791+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dc239180-7e8c-402d-8aab-9b784818739d', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:43:10.321955+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dcb7173f-f276-4916-94fe-d5dbb597e7dd', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-22 11:30:15.183865+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ddc95367-7a56-4e18-a45f-59a6a3b12130', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('de1ef4ff-7c5a-4b51-b380-beacf3e3815f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('de322995-8517-4f62-893b-a53bb42e1f6b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('de84c7ad-0451-4513-bfe2-7ad2efff96cc', '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', NULL, 'like', NULL, NULL, NULL, '2026-03-06 22:45:55.411816+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('def43893-98db-45e0-8c77-bd9f8bad51b3', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('df8067dd-331a-48cf-97b9-b71697efaecd', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-04 05:20:29.559069+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('df9450c8-27ef-4a42-b016-ee2c5f0b649a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dfc43005-0704-4c54-96d7-c17ee77f63ad', 'e6ea1ee5-4ccb-4dd5-a0c6-4e0f629a3b66', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-02 09:15:42.482607+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dfd7c60a-9820-46f7-9c5a-5932d9a102bc', '819fdcfa-c350-4297-b6d0-134171ca15c8', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-03 21:33:08.719624+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dff41c35-104a-496e-b670-956847538297', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'comment', NULL, NULL, NULL, '2026-03-03 13:25:55.574995+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('dff639d0-d928-4ae1-8374-c0c62ad57df9', '363ab36c-1544-45c7-8fa1-6298c8ad85c6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:14:53.497859+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e09ce193-cb03-419c-b9e0-966e6f719b7f', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-04 11:19:49.275514+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e0b9b4cf-4574-477c-9793-1395796d4c3b', '1fdb1e97-1e7b-4cc0-a321-52a884882c14', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 18:38:29.573541+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e1a3d045-a5f8-4045-b76b-96f5c10bfb00', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e1d5336b-3070-467a-ab84-bd0a46cfa649', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'podcast_follow', NULL, NULL, NULL, '2026-03-22 06:34:42.496751+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e21424ca-770d-459d-8f9b-607d774efd2f', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 14:09:48.108969+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e2461ee1-0712-4135-840e-85df4c505f83', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e2b1524d-0327-42da-b314-7224ea93feff', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e2cb6bec-f728-4da5-b9fe-5b29459767d6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e2f4bcb6-549d-4fb3-81af-68fc8bacc60b', '453fa778-b1c7-4bab-b408-7e92fc28e009', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-03 21:12:47.728493+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e31324ab-c7d3-449c-a9c5-60597b820d70', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e35fab77-716e-480e-8aa9-512e8ae7dc65', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e4185c4c-0c79-44bf-97be-967c90ece896', '4e61d28e-76f7-418b-8a69-281a3652ee23', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:34.039197+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e41d45ab-73ee-486d-adbb-6a8e11391def', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-03 14:57:52.565377+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e44fe65d-c685-4b41-bdc4-fc3a7d5ed2b9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e45f1953-370a-4809-a2a4-3dfe047a6182', '7dc18219-7f89-45ef-880f-59d95a9c3cac', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-30 18:16:15.10106+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e48735f6-b148-4be3-8f08-d706fbeca66a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e49da94d-ac78-46c9-b0a5-ed7dc2c43296', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'comment', NULL, NULL, NULL, '2026-04-05 05:49:22.271601+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e4f1b668-d81f-4a7a-a1eb-05bd978ac9a5', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 21:10:07.90867+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e59ad592-b672-490e-b594-8dfd008a7a9d', '1fdb1e97-1e7b-4cc0-a321-52a884882c14', NULL, 'connection_request', NULL, NULL, NULL, '2026-02-26 18:59:19.866261+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e5d3e3e5-1ce8-4fbc-ae62-b0783f84c47d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e6174abd-b821-44bc-8b89-a9fe20cb1888', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-04-27 07:12:13.249182+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e61e0603-a692-4366-bf04-7adc1f87666b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e621e318-7563-467f-ab9f-e59ecd5331db', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e64c5300-5a8c-4eec-a3db-08b5ceeaabdc', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e70b1641-5fde-4d99-a083-37da2484c89e', '02770d5c-c756-441f-9ab6-fd1346f4f399', NULL, 'connection_request', NULL, NULL, NULL, '2026-02-21 11:38:48.780805+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e7234933-723c-4e6d-8a6b-3b431ccd70ca', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e7ec089c-cfd8-4334-a342-10faeb2c224e', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:27:02.491925+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e82b5699-a0df-4b75-8dc5-5fa061135b39', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e8355f51-a60e-4abb-8991-f7287af12d5e', '39f77901-3d9d-4be3-b780-a696cf90261f', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-16 19:15:04.705247+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e8c9f09a-a2d9-4c7f-b8d8-7f1b0e9f3b3b', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-03 09:47:05.72114+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e8ce3a84-6584-4f62-a12c-de07eb17dc44', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e936e401-d4f7-4280-9635-b460f0999e18', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e93cc044-dcf8-4214-8287-75374515a568', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'connection_request', NULL, NULL, NULL, '2026-02-18 08:25:05.073233+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e9b8815a-b02b-427c-aecd-9f6d60881b18', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'like', NULL, NULL, NULL, '2026-03-27 16:55:29.168146+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('e9d87aa5-4c03-4ca0-b376-791573f094f4', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ea83c16f-817a-456b-ab71-32c46547e00b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ea87deba-d8d8-45ce-b23c-31882942bd42', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('eae155a3-de14-466b-9681-1cceedaec626', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'follow', NULL, NULL, NULL, '2026-02-18 08:27:30.994158+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ebb30cff-debf-4a0b-be48-9025bd5287fe', '17e6a244-29dd-4a76-b202-f41cdcd6b3b1', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-14 16:19:14.199667+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ebd5d3cc-8341-47ce-8d7d-79e481fd822d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ec36ba2c-92f4-45b6-af59-0177e177aa5b', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'like', NULL, NULL, NULL, '2026-03-22 06:35:41.725034+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ecb643ed-02ce-469d-be10-cd673763ba38', '23578d06-87fe-4e9e-8ebe-7fb30c568714', NULL, 'connection_request', NULL, NULL, NULL, '2026-04-11 15:14:37.41748+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ed26bd07-599f-4bfc-a67d-9d022c1328b9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-14 11:14:32.040729+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ed5702e6-0b0e-4a9f-9bb0-7f18facbf705', '819fdcfa-c350-4297-b6d0-134171ca15c8', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-04 15:08:36.623437+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ede0e443-9dbd-4b1b-880d-c233e5d8e874', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('efa3a23f-eb24-4c77-bf60-4af40bedead6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-07 15:26:07.95179+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f02acb6e-9dbe-49a2-8a7d-f941c22b2b86', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', NULL, 'like', NULL, NULL, NULL, '2026-04-02 09:17:16.312235+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f047611c-8a1b-480d-9bcd-bf6466b554c9', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f07dac89-ec58-4c03-a2cf-bc5ba96910b6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f0ca9458-c32e-47cd-8315-0c9761a2b1d7', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f0f96393-65f3-47f7-b820-83cbdb937bca', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'admin_announcement', NULL, NULL, NULL, '2026-04-03 09:50:48.613501+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f141c62e-2997-4f41-ab1f-606c8f5db13b', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f172fb74-7613-4319-852b-e621724c33e1', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-06 12:35:13.184221+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f27206b4-590a-440c-84d1-2387597aae24', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:42:17.374216+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f2f9e225-c0e5-4cd3-a281-3a7b1291188c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'admin_announcement', NULL, NULL, NULL, '2026-03-10 19:07:42.183522+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f2fb7032-8351-48e1-aa1e-e6c64a073d32', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f3379c20-86d7-4b74-95c2-c8c128142bb7', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f4ee7f25-8ba7-4be8-a434-526b8ebf360a', 'fc9d4ad0-dc79-4a3f-a2bb-a857ff706c46', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-03 21:27:29.128872+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f554fe94-94bf-44f8-8bd3-50deecc7abad', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f58d7ac5-e96d-4d1f-add5-cac0816b48e2', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f629ea40-218f-46e2-a8a5-27fefbc2da1c', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'admin_announcement', NULL, NULL, NULL, '2026-04-03 13:38:53.083524+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f633586d-33f3-4a99-8754-962d5be18b18', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-04-04 10:52:58.572561+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f661d489-e113-4d9c-b5c0-d827952e7c01', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'like', NULL, NULL, NULL, '2026-02-24 21:17:06.542869+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f69ebf95-eb91-4960-9b22-a348fd086469', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'like', NULL, NULL, NULL, '2026-03-03 14:57:55.692456+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f6f39f02-7148-46f7-8691-f86a01f31ca6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f7f06a05-2df8-4247-8fbf-5d5b3b765648', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-07 07:29:03.075302+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f7fe53ad-e706-43a7-b445-7f8106a46baa', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('f9b50ca6-d233-4332-a732-a40a52d5e27d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'connection_accepted', NULL, NULL, NULL, '2026-03-10 06:04:14.399428+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fa0173aa-007d-4d7e-95f2-9db67d3429f6', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 07:27:13.393819+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fa542c12-1258-457d-97fe-c7c2469405cb', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'like', NULL, NULL, NULL, '2026-03-12 19:57:03.033408+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fa79740f-ebfc-4074-997f-2a06f8d3a467', '27d1ad60-6d73-439d-b4b2-4a1827371c24', NULL, 'like', NULL, NULL, NULL, '2026-02-21 01:24:36.671611+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fac18441-0279-4758-a7ab-d98d26d2adde', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fb004920-9c62-4159-a7bb-d71ecab3f30b', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'like', NULL, NULL, NULL, '2026-03-08 22:00:07.569239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fb141d44-a4ef-4bd1-aee3-5097e80ed102', '2b3af27c-8395-4da3-8f28-ca3b0ee2b5be', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-12 21:21:49.257274+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fb23a0e9-1a25-4510-98e9-8779efddd6bf', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fb276ec5-4aa4-4f10-854d-fd15d85a666c', 'd8484a31-77d6-49c3-b433-98614c8a71a0', NULL, 'like', NULL, NULL, NULL, '2026-03-03 20:52:17.429569+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fb429002-55a4-4335-8a17-6a52850d03d6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fb8b8d96-263c-4bab-9711-59ab3fd3e34a', '86edb2e2-873b-4bc2-af88-11f7ff6635f2', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-06 09:17:14.31097+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fbf86a6b-47e5-4636-8184-fa47287e7944', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fcbf43db-f6e3-4302-af7e-14452ef10109', 'e89d2960-f719-4c9a-b210-f6408253207f', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-03 21:31:05.939092+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fcdf85ad-7bac-4c47-9da9-4d7559ab91d0', '6be8c692-0ffe-40d5-a202-7de574e99a68', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-04 10:15:16.747964+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fd413ee7-afce-466a-aa94-43a6e26a6694', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fdfbea7f-5968-45af-902d-d7f61c1e0c65', '363ab36c-1544-45c7-8fa1-6298c8ad85c6', NULL, 'like', NULL, NULL, NULL, '2026-03-07 12:57:49.124421+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('fe31ea71-568f-41fc-bc30-287fde43a80c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'follow', NULL, NULL, NULL, '2026-04-03 10:17:12.780882+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ff4333c0-dc21-463c-aa62-a90c9adaefed', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, 'connection_request', NULL, NULL, NULL, '2026-03-29 07:18:30.452916+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.notifications (id, user_id, actor_id, type, content, reference_id, is_read, created_at) VALUES ('ff7dda25-76f2-4fbc-b060-39cb937cb212', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'like', NULL, NULL, NULL, '2026-03-03 14:57:53.933209+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
COMMIT;