-- Fully-Provisioned Migration for public.connections
BEGIN;
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, connected_user_id)
);

DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('023dee31-8591-4515-83b1-47c0e771261f', '17e6a244-29dd-4a76-b202-f41cdcd6b3b1', '33c75afb-3e5a-4171-83de-8f915691c513', 'accepted', '2026-03-05 17:09:57.491221+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('03967ef2-27c2-467b-918c-3c115125e66c', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-02-28 14:16:40.702457+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('06b759e8-73b2-4154-9cb9-dedb89d1d0a2', '8798340d-7df4-4160-942a-5d222ea427b6', '33c75afb-3e5a-4171-83de-8f915691c513', 'accepted', '2026-03-03 14:23:49.140802+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('06ba0505-e875-4b04-9fbb-90bd97063c9e', '5b2275df-fb04-490b-ac8d-a5cba8607275', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'accepted', '2026-03-07 15:26:06.243775+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('07f157cb-fb54-474c-8874-4441a1efe7a8', '8798340d-7df4-4160-942a-5d222ea427b6', '03c766f0-01cb-4569-aace-bb480dded7fd', 'accepted', '2026-03-02 23:34:31.642879+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('08116fee-6394-495f-9de7-1b0b5793ae18', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'b76e30c2-39b7-434a-bcd9-4d5b94309dbf', 'pending', '2026-03-16 19:15:09.062895+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('0dd04274-2ed8-4c49-8abc-d1cd9b8a55bc', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-02-20 23:48:15.05603+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('0e172be1-f734-4f76-9517-a1b83f93c65d', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'edc229c9-10e5-4721-8733-e8b74103ddcc', 'pending', '2026-03-05 18:46:24.842556+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1000e0ad-b136-4c7f-99df-89bab8acd95a', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '056f944f-5d1b-445d-ad66-9b34b7d06322', 'pending', '2026-03-29 07:18:24.399+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('10b5682e-0125-48c1-b8f3-3c79051f0a9a', 'd364bb68-e2e4-4752-9ed6-88b53ead0c54', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-04-02 18:51:04.300013+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('136c32e4-d180-4912-997d-54ef3f64b00b', '5b2275df-fb04-490b-ac8d-a5cba8607275', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-03-07 15:26:07.95179+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('13bf5b32-dd6c-47a8-8045-f6186155d2b1', '8798340d-7df4-4160-942a-5d222ea427b6', '2b3af27c-8395-4da3-8f28-ca3b0ee2b5be', 'pending', '2026-03-12 21:21:49.257274+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1430db29-83c3-43ca-ac2d-e39bf2d371a3', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '6be8c692-0ffe-40d5-a202-7de574e99a68', 'pending', '2026-03-05 18:43:19.709816+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1548f6a1-c198-430e-87dc-070515c30a3e', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '33c75afb-3e5a-4171-83de-8f915691c513', 'accepted', '2026-03-29 07:18:30.452916+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1555fb62-7f3a-4576-b48c-d6418d1253fd', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'accepted', '2026-03-13 20:01:06.632447+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('160ab2e0-194e-48bd-8b63-efbf8dfcb6ec', '7dc18219-7f89-45ef-880f-59d95a9c3cac', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'accepted', '2026-03-30 18:15:30.52755+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('161bca13-b92b-403d-9fd0-c5837d340159', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-03-14 11:14:32.040729+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('17b4de64-28df-4e89-a137-116883c6bec7', '819fdcfa-c350-4297-b6d0-134171ca15c8', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'accepted', '2026-03-03 21:31:00.181187+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('182ec0df-12bc-409f-9122-885197d6cae7', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '36bfde0b-6708-4d28-83db-4e7583ddf402', 'pending', '2026-03-05 18:46:21.84139+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1aa7cc3e-b9fe-4e7f-80ff-334fc46ae52d', 'c04bcc9b-4df1-4f63-b9cc-ac20bf3eb38f', '067e9e48-6793-4299-9033-847755b59d70', 'pending', '2026-03-30 22:31:13.185788+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1b9f6f4b-47d2-47bc-80bb-9d4e86c12eaf', '8798340d-7df4-4160-942a-5d222ea427b6', '5c896f75-c830-42b3-b959-6c7f40879b17', 'pending', '2026-04-27 17:35:38.868824+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1ca8b1e6-3525-4aaa-9f43-50cde09d2f7b', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'a68689c1-dd51-4307-a0ba-730e7f589391', 'pending', '2026-03-29 07:18:17.220317+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1d620d61-5acc-4c97-ad35-1a51b3680486', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', 'pending', '2026-03-16 19:14:28.736191+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1dbac32e-9ac9-4e4e-a504-dd235ec1a63c', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', 'f0440981-1974-4b21-867b-b808c7f4c704', 'pending', '2026-04-02 09:15:39.410218+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1dbe860a-9e23-4adc-a6aa-b75fb21600b3', '8e1d27c4-f95e-4daa-81c2-c759368d7da5', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-03-11 14:11:32.345372+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('1feef544-a732-42a4-bb21-8868be3ae194', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '4f7826bf-9a4e-4367-bc94-ceb7b322a611', 'pending', '2026-03-16 19:14:59.882576+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('20d5c29d-fe99-4143-9aa5-53a38372a62d', '8798340d-7df4-4160-942a-5d222ea427b6', '9ef59e65-b448-4e41-b0c5-cbca525d8277', 'pending', '2026-03-03 21:54:20.047697+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('22e07eb0-2cfa-4fd2-b252-156c44cacdec', '8798340d-7df4-4160-942a-5d222ea427b6', 'dfa38af7-12ab-4bd3-8a9e-87e71287c3b6', 'pending', '2026-03-04 16:34:55.068061+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('242dd9b4-b0fb-4132-946f-d404d774397b', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', 'd21ac845-bec4-420e-b284-6aad2ae0a314', 'pending', '2026-03-13 20:01:16.341633+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('26c70d42-7eda-4482-8583-93e9bfa722f7', '7dc18219-7f89-45ef-880f-59d95a9c3cac', '27d1ad60-6d73-439d-b4b2-4a1827371c24', 'accepted', '2026-03-30 18:15:32.666712+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('27251ba8-b927-43bf-a388-bbf2e03af29c', '8798340d-7df4-4160-942a-5d222ea427b6', '36bfde0b-6708-4d28-83db-4e7583ddf402', 'pending', '2026-03-05 17:33:31.885494+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('28bbfec0-5efb-4475-b841-70b9132adc79', '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'pending', '2026-03-13 10:16:31.502596+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('29cd3d24-d2de-468a-b546-2279aae5ae5a', '453fa778-b1c7-4bab-b408-7e92fc28e009', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'accepted', '2026-03-03 10:19:22.590239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('2a4939bb-63fe-4fa3-b521-6853b9bb3ed9', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', 'accepted', '2026-04-03 17:19:34.530437+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('2cdcf111-8c04-4a38-bf81-8c8baf9b6f93', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', 'pending', '2026-03-16 19:14:33.408817+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('2d76faa1-ce2b-47dc-af12-dd653f455ef6', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '39f77901-3d9d-4be3-b780-a696cf90261f', 'pending', '2026-03-16 19:15:04.705247+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('2f08a23c-88f0-4efd-87d9-8ef6fa9d2c58', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '88e8804b-e217-4884-983d-70c7e78f5061', 'pending', '2026-03-16 19:15:04.544199+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('30f5d04f-16e7-453c-a99e-f19a9fa37a25', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'b564969a-bbf5-47cd-bb2e-404854045f70', 'pending', '2026-03-16 19:15:04.541624+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('33c138db-b766-4f58-97b6-e0b9036cea84', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-03-13 20:01:09.406661+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('3737530a-9f15-48fc-bfd9-d7cf19514cc8', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'd9144849-e3d0-4d9d-995f-e13ec3f2ee5f', 'pending', '2026-03-16 19:14:37.230596+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('37899e95-bf84-4478-967d-d2fd2d337ed9', '8798340d-7df4-4160-942a-5d222ea427b6', '17832d0b-944d-4117-8703-422429b4f399', 'pending', '2026-03-12 20:13:46.829491+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('37e4accb-9810-406a-a2ec-21be63db664f', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', 'pending', '2026-04-30 19:41:02.370841+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('38014693-6823-4dc4-beb3-43ff502fb646', '8798340d-7df4-4160-942a-5d222ea427b6', '6be8c692-0ffe-40d5-a202-7de574e99a68', 'pending', '2026-03-04 10:15:16.747964+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('41073009-44b4-4711-b21a-2e8ca4e5051b', 'fc9d4ad0-dc79-4a3f-a2bb-a857ff706c46', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-03-03 20:50:01.360699+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('422f74c5-d8f4-48e8-9872-21dd4eaf16b6', '5b2275df-fb04-490b-ac8d-a5cba8607275', 'a9279bce-742e-4ca5-a993-a820b18830d7', 'accepted', '2026-03-07 15:21:36.898525+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('466f46e1-6cb2-471f-807d-5166295fdd66', '5b2275df-fb04-490b-ac8d-a5cba8607275', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'accepted', '2026-03-07 15:26:04.114397+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('481cdcfa-041f-4f94-9f40-c06b2de6be21', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', '17832d0b-944d-4117-8703-422429b4f399', 'pending', '2026-03-13 20:01:13.168448+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('486c0cb2-d74c-4570-a0b4-4ec2fbb7f26c', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '9988b701-3a3e-4942-aaf6-059c68e5aa26', 'pending', '2026-03-05 18:43:27.909295+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('48eb6ff2-cb9a-42cb-b84e-a8810b4f7cc7', '7dc18219-7f89-45ef-880f-59d95a9c3cac', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'pending', '2026-03-30 18:15:29.949806+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('4c778f49-73c3-4a97-b0d0-532f5bd585c2', '819fdcfa-c350-4297-b6d0-134171ca15c8', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-03-03 21:31:06.988116+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('4ded5c8a-7d1f-4389-969f-253b9ec95ac7', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '11ee4c78-396c-45d1-bb70-56ddea408bdf', 'accepted', '2026-03-29 07:18:31.193414+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('4e03da2d-1366-423e-a567-5a6459042bab', '8798340d-7df4-4160-942a-5d222ea427b6', '86edb2e2-873b-4bc2-af88-11f7ff6635f2', 'pending', '2026-03-06 09:17:14.31097+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('564a8c66-5c88-4b04-8c20-32d552609a87', '453fa778-b1c7-4bab-b408-7e92fc28e009', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-03-03 10:19:26.425952+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('58336432-d0dd-4559-8f35-611cbc457be4', '33c75afb-3e5a-4171-83de-8f915691c513', '0dafb94a-ae6a-4985-945d-6b4bcdb721ae', 'pending', '2026-03-03 14:10:29.123077+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('5a465d21-dd45-4859-8102-3250f104130a', '8798340d-7df4-4160-942a-5d222ea427b6', 'f67b78c5-2aa8-44c3-9ffb-6c689160dd9e', 'pending', '2026-03-05 17:33:35.589195+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('612b443b-2ae0-49ca-8db8-f524c93d3f36', '33c75afb-3e5a-4171-83de-8f915691c513', '1fdb1e97-1e7b-4cc0-a321-52a884882c14', 'accepted', '2026-03-03 18:38:29.573541+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('61311508-4f53-4a67-aac9-389bf124577c', '819fdcfa-c350-4297-b6d0-134171ca15c8', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'accepted', '2026-03-03 21:31:00.92501+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('621c1189-520e-4f8a-b7ab-5b543dd520cd', '8798340d-7df4-4160-942a-5d222ea427b6', '27d1ad60-6d73-439d-b4b2-4a1827371c24', 'accepted', '2026-02-18 08:25:05.073233+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('654701ce-71a2-4bce-8b8b-ae68f3e9ac2a', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '4f7826bf-9a4e-4367-bc94-ceb7b322a611', 'pending', '2026-04-28 13:58:09.209204+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('65814088-2513-406a-aeb9-5e7f71c752aa', '819fdcfa-c350-4297-b6d0-134171ca15c8', 'e89d2960-f719-4c9a-b210-f6408253207f', 'pending', '2026-03-03 21:31:05.939092+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('6604d222-9dce-42ff-863b-d090e1127e3c', '8798340d-7df4-4160-942a-5d222ea427b6', 'e6ea1ee5-4ccb-4dd5-a0c6-4e0f629a3b66', 'pending', '2026-04-01 23:50:24.152252+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('67a19105-319e-42a3-bf3c-0f2d83515448', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '0d2191b3-01ae-4e61-8264-a4bc6f189858', 'pending', '2026-03-05 18:46:21.762254+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('6884682a-52a4-4723-a762-3a4b9b0296f8', '8798340d-7df4-4160-942a-5d222ea427b6', 'bbeaa920-b0a8-403f-8954-03751f843d47', 'pending', '2026-03-05 17:33:31.718156+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('691d8099-258b-40bb-81e8-2bd31c74833a', '8798340d-7df4-4160-942a-5d222ea427b6', 'f0440981-1974-4b21-867b-b808c7f4c704', 'pending', '2026-03-31 17:40:15.86449+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('6aa4e224-7b53-4a13-960b-0934b82d3098', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'accepted', '2026-03-14 11:14:45.337784+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('6b1e4a76-22c8-486f-8872-e572c734f975', '8798340d-7df4-4160-942a-5d222ea427b6', '1fdb1e97-1e7b-4cc0-a321-52a884882c14', 'accepted', '2026-02-26 18:59:19.866261+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('6b73f871-d9d0-4e8b-b823-51e824226bfc', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2b3af27c-8395-4da3-8f28-ca3b0ee2b5be', 'pending', '2026-03-16 19:15:13.148546+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('6db33399-7ab6-41e6-a781-5b98e1dfd631', 'a68689c1-dd51-4307-a0ba-730e7f589391', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'pending', '2026-03-23 14:36:22.393021+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('6dd73e65-f315-43b1-8281-2d52daed29a2', 'c04bcc9b-4df1-4f63-b9cc-ac20bf3eb38f', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'pending', '2026-03-30 22:31:05.979824+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('6f8974f0-79ce-4e47-ba4c-996536edf89f', '8798340d-7df4-4160-942a-5d222ea427b6', 'a68689c1-dd51-4307-a0ba-730e7f589391', 'accepted', '2026-03-23 14:31:47.831286+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('704d44c4-162e-4a2b-88ff-d530cfc56faf', '7dc18219-7f89-45ef-880f-59d95a9c3cac', '39f77901-3d9d-4be3-b780-a696cf90261f', 'pending', '2026-03-30 18:15:28.501437+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('70aac9a0-933b-4d20-8b32-c0e834bbcb35', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '502bd82f-319b-4e45-a370-b9b402fb2e8b', 'pending', '2026-03-16 19:14:33.408281+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('71ec71f4-0de3-44e5-85fb-8a9ec8fdd39f', '8798340d-7df4-4160-942a-5d222ea427b6', '82da2032-6d31-425a-a328-c17a013995a5', 'pending', '2026-03-03 21:17:39.518866+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('73304bea-08c0-4bb7-9010-04c6f4eca642', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '02770d5c-c756-441f-9ab6-fd1346f4f399', 'pending', '2026-02-21 11:38:48.780805+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('734ac36c-8c58-41e6-82c8-3036b99b1921', 'ee09fe2f-eef3-4042-9d0d-c7be02aa2bd5', '6be8c692-0ffe-40d5-a202-7de574e99a68', 'pending', '2026-03-05 18:04:45.367371+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('73c8f39e-e8e7-4684-b5e5-8242fada1d75', '8798340d-7df4-4160-942a-5d222ea427b6', 'e89d2960-f719-4c9a-b210-f6408253207f', 'pending', '2026-03-03 21:27:23.555226+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('75ec2adb-97db-4be9-8b5c-f9ef29a77db6', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'aa79a01d-8d67-41f4-ac51-a2e3ab97aff9', 'pending', '2026-03-16 12:29:53.065595+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('7a9ac11b-29f3-48a3-8e31-76f9b004017d', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '363ab36c-1544-45c7-8fa1-6298c8ad85c6', 'pending', '2026-03-16 19:14:53.497859+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('7d3d6470-a973-4a47-9bcd-98e36755bce2', '819fdcfa-c350-4297-b6d0-134171ca15c8', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'accepted', '2026-03-03 21:31:03.501647+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('7e150881-1b03-4176-bd6f-f8ac3951976a', '8e1d27c4-f95e-4daa-81c2-c759368d7da5', '067e9e48-6793-4299-9033-847755b59d70', 'pending', '2026-03-11 14:11:49.112257+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('7f1f4038-cb5a-4d5f-8709-cf3d4bfc4852', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'e619eaa4-5bcf-4a3e-bce5-ba966d18df45', 'pending', '2026-03-29 07:18:32.844969+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('8016c08e-fe55-47fe-9fa3-95534305ec21', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'd9144849-e3d0-4d9d-995f-e13ec3f2ee5f', 'pending', '2026-03-29 07:18:19.240611+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('8702b611-2039-4ca7-a911-d61bafa926a0', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '04b8b975-9e5d-402e-8c15-b1cfbc692955', 'pending', '2026-03-29 07:18:13.908046+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('89144b86-0196-4261-902d-f9855a3c3231', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '5fb35559-3727-41d8-aa11-77189d405467', 'pending', '2026-03-29 07:18:15.534844+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('8a459b43-e5ab-447b-b002-e4db5fe3a755', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', 'e6ea1ee5-4ccb-4dd5-a0c6-4e0f629a3b66', 'pending', '2026-04-02 09:15:42.482607+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('92c18c89-13fe-4fac-baae-1e14a05bb9dd', 'bb0d3c8f-9e67-4797-b20e-5f403080603d', '067e9e48-6793-4299-9033-847755b59d70', 'pending', '2026-03-31 11:33:59.610382+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('937a4158-c0ab-4c11-801d-679b48114958', '8798340d-7df4-4160-942a-5d222ea427b6', 'c9e1da3c-42f3-40d0-a980-b9281cd89dfc', 'pending', '2026-03-05 17:33:36.919692+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('93f9f443-6cec-40f8-9f7d-4e6230e96e91', 'ee09fe2f-eef3-4042-9d0d-c7be02aa2bd5', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-03-05 18:04:38.694677+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('981ded23-7762-4309-ada0-5c70d0d186dc', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'pending', '2026-04-02 09:15:41.55917+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('9836dfef-3500-4306-9984-64e692bade0e', '8798340d-7df4-4160-942a-5d222ea427b6', '39f77901-3d9d-4be3-b780-a696cf90261f', 'pending', '2026-03-07 13:38:28.837987+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('98d78e75-b893-4270-b47b-fc0a0bd21397', '33c75afb-3e5a-4171-83de-8f915691c513', '453fa778-b1c7-4bab-b408-7e92fc28e009', 'pending', '2026-03-03 18:36:53.886724+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('9a339cb3-32fa-4302-98b2-77b2b4102af2', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '8e1d27c4-f95e-4daa-81c2-c759368d7da5', 'pending', '2026-03-14 11:14:56.359117+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('9bae54c1-dcf2-4027-943b-5dd212c513d2', '5b2275df-fb04-490b-ac8d-a5cba8607275', 'a55be48a-38f3-4334-9eff-c6594c27be6a', 'pending', '2026-03-07 15:26:08.636012+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('9cae49d0-76d7-44b9-b309-3cbde8ad663e', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'accepted', '2026-03-14 11:14:29.40405+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('9e10762b-fbda-45fb-b081-24fcae5d91b7', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', '04b8b975-9e5d-402e-8c15-b1cfbc692955', 'pending', '2026-03-13 20:01:26.364534+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('9ec08efa-dd7e-4679-8be1-2bf4f4b7a85c', '8798340d-7df4-4160-942a-5d222ea427b6', '4f7826bf-9a4e-4367-bc94-ceb7b322a611', 'pending', '2026-03-16 14:31:52.838293+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('a06c12f9-08fc-4d97-85f4-efd5df5ce38a', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '27d1ad60-6d73-439d-b4b2-4a1827371c24', 'accepted', '2026-02-20 23:48:36.043388+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('a13b2664-a86b-4876-a102-9ef9a480b183', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'accepted', '2026-02-28 14:16:43.25784+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('a1e8b33c-8d8b-4724-b112-11a30665b55e', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '17e6a244-29dd-4a76-b202-f41cdcd6b3b1', 'pending', '2026-03-29 07:18:10.520179+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('a2dfda62-c62d-4747-88b9-770c40fdfa2a', '8798340d-7df4-4160-942a-5d222ea427b6', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', 'accepted', '2026-03-07 22:19:16.903737+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('a490a3fa-a43f-40e2-8310-8f71cda08159', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '8830cfc3-363b-4b21-ad54-596bb64fe2d4', 'pending', '2026-03-05 18:43:26.711944+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('a5e24152-7492-4e69-95d1-dea229506e55', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'bbeaa920-b0a8-403f-8954-03751f843d47', 'pending', '2026-03-05 18:46:22.083366+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('a78095a6-fef3-44c5-9479-4f328312ffab', '8798340d-7df4-4160-942a-5d222ea427b6', '7fd09493-6d34-4673-8df5-7d744571cc7f', 'pending', '2026-03-05 17:33:31.770226+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('a915555c-547a-4164-a518-c452d4bc6d70', '8798340d-7df4-4160-942a-5d222ea427b6', '3aaa2a20-4c4c-482a-9e6b-50fe581897cf', 'accepted', '2026-03-07 07:28:25.707321+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('aa26c61f-7bb0-4921-bbad-f4576dd16894', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', '27d1ad60-6d73-439d-b4b2-4a1827371c24', 'accepted', '2026-04-02 09:15:46.4319+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('ab91c671-6022-489b-b907-cfaf4f0f48a1', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '4e61d28e-76f7-418b-8a69-281a3652ee23', 'pending', '2026-03-29 07:18:34.039197+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('afb7cd16-d078-4309-a4d4-52ce65aafb48', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'd8484a31-77d6-49c3-b433-98614c8a71a0', 'accepted', '2026-03-05 18:43:22.841503+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('b0273129-2cc2-4b11-bac8-7eaec8110b10', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'accepted', '2026-02-24 19:47:31.107799+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('b1259a41-a3e7-4b89-8ed7-383cb08bb2eb', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '24915d8e-82a1-4fb8-b1be-2fbe03d99794', 'pending', '2026-03-05 18:46:19.428253+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('b1942697-32de-4bec-a617-7c93f8d11c38', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '453fa778-b1c7-4bab-b408-7e92fc28e009', 'pending', '2026-03-14 11:16:49.710498+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('b4fc7fb8-6a19-4bc3-9861-a8f8ad1b8301', '8e1d27c4-f95e-4daa-81c2-c759368d7da5', '970b30f6-583f-4cad-8f7e-ebe5175bdb0e', 'pending', '2026-03-11 14:11:51.433037+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('b60ebe03-1d8a-4e1f-998d-eeb338d69331', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'accepted', '2026-02-28 14:16:41.972593+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('b8f061e9-6630-43e7-9070-ae399ada9875', '453fa778-b1c7-4bab-b408-7e92fc28e009', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'accepted', '2026-03-03 10:19:30.643355+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('b935667f-b12a-418f-b483-6a361190340b', '8798340d-7df4-4160-942a-5d222ea427b6', '23578d06-87fe-4e9e-8ebe-7fb30c568714', 'pending', '2026-04-11 15:14:37.41748+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('baa48b85-317d-438f-9759-dcf973c28b60', '8798340d-7df4-4160-942a-5d222ea427b6', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'accepted', '2026-02-25 14:34:15.832561+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('bddaa837-1364-427d-b186-4895e2b47a30', 'd8484a31-77d6-49c3-b433-98614c8a71a0', 'bb0d3c8f-9e67-4797-b20e-5f403080603d', 'pending', '2026-04-30 19:40:35.026849+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('be83dd71-872d-4d74-81fb-1053ab261cc3', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', 'pending', '2026-03-13 20:01:26.412791+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('bf5881ce-ba4e-4ab7-9f00-a0a4771ce102', 'a55be48a-38f3-4334-9eff-c6594c27be6a', 'a9279bce-742e-4ca5-a993-a820b18830d7', 'pending', '2026-03-07 15:25:29.038532+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('c210aba1-2567-4269-b936-85bdcc7111ed', '7dc18219-7f89-45ef-880f-59d95a9c3cac', '03c766f0-01cb-4569-aace-bb480dded7fd', 'pending', '2026-03-30 18:15:27.643202+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('c356a562-c664-4501-ba65-7706a2ee5b4b', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', '7dc18219-7f89-45ef-880f-59d95a9c3cac', 'pending', '2026-04-02 09:15:44.856921+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('c3aeccd0-f571-4f63-935c-4b1550265501', '17e6a244-29dd-4a76-b202-f41cdcd6b3b1', '0dafb94a-ae6a-4985-945d-6b4bcdb721ae', 'pending', '2026-03-05 17:14:30.174256+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('c7be2aa1-f75b-4d3c-a0e7-13f34512f612', '8798340d-7df4-4160-942a-5d222ea427b6', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'accepted', '2026-02-21 07:21:38.052555+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('c8fb9aba-66aa-46e1-bf7e-c98ab6591e8c', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', '39f77901-3d9d-4be3-b780-a696cf90261f', 'pending', '2026-04-02 09:15:40.995748+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('c9519811-ae1f-4c7e-9e77-bf823af2401f', '33c75afb-3e5a-4171-83de-8f915691c513', '3aaa2a20-4c4c-482a-9e6b-50fe581897cf', 'accepted', '2026-03-03 18:38:32.100345+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('ca8497e2-a5cd-40be-9d3c-a02c0ac21ab5', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'accepted', '2026-03-05 18:43:08.114954+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('cb92ce4a-db31-459e-8c5e-bb705c2467cf', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', '03c766f0-01cb-4569-aace-bb480dded7fd', 'pending', '2026-04-02 09:15:38.973883+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('d1293b9e-c133-4e4e-8cc5-e01be8d6f32f', 'c04bcc9b-4df1-4f63-b9cc-ac20bf3eb38f', '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', 'pending', '2026-03-30 22:31:01.544481+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('d1c1c485-4abb-4adc-877b-cd21db5e56fb', '8798340d-7df4-4160-942a-5d222ea427b6', 'f4926ff6-b964-44bc-be06-f6d9cc91b705', 'accepted', '2026-02-24 07:00:16.224645+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('d36cf497-140d-4dcc-83f6-ec80b3cc2227', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'd48e3524-c04c-46ac-8cac-4eb33d09696a', 'pending', '2026-03-16 19:15:31.226437+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('da33034b-ec5e-40c4-9817-7dd63dab7414', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '03c766f0-01cb-4569-aace-bb480dded7fd', 'accepted', '2026-03-29 07:18:20.679656+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('e0fe8351-625b-42b8-a953-acf127e8b94b', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'accepted', '2026-03-13 20:01:05.372066+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('e58c9cca-6703-4cd3-847a-7d94ce66159b', '5b2275df-fb04-490b-ac8d-a5cba8607275', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'pending', '2026-03-07 15:26:06.253566+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('eb6594a5-263e-44a4-8eff-2cbc8c22badf', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'ef9a5041-bff0-4588-9868-fd34ec58c6aa', 'pending', '2026-03-29 07:18:23.072046+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('ebef6518-c240-4204-b471-7f877e59d5e9', '8798340d-7df4-4160-942a-5d222ea427b6', '839042fd-c42a-47cf-84c8-b0ea72e446bc', 'pending', '2026-02-25 14:34:18.0039+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('f1289eda-4ba4-4d88-b6e6-b73b7e112e52', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-04-02 09:15:40.0479+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('f3a10992-1252-405b-9c65-69abe8491d9f', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', '8e1d27c4-f95e-4daa-81c2-c759368d7da5', 'pending', '2026-03-13 20:01:14.37372+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('f461826d-99b4-4e4b-9bc4-b7a96d5f133e', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'aead7890-394b-484d-b818-df3158038b8b', 'pending', '2026-03-05 18:43:35.443989+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('f482cbc5-37ab-468e-bebd-1fe717fcd8ee', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'pending', '2026-03-16 19:14:27.874715+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('f5d810eb-e4c7-4c08-ab41-ec6ae48ce90b', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'accepted', '2026-04-02 09:15:44.217385+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('f699ae9c-0996-4ecf-bb09-418e5fa0437a', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'accepted', '2026-02-28 14:16:44.51+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('f7c284cc-900d-45bf-83ba-6cab7049e8d7', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '9628ab6c-bcb7-4d5c-800c-f13e41844fcc', 'pending', '2026-03-16 19:15:30.712477+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('fddb2e56-63ec-40d3-b270-0263ed846368', 'd8484a31-77d6-49c3-b433-98614c8a71a0', 'ceb9be04-6648-4050-bf51-6eef782af33a', 'pending', '2026-04-30 19:41:02.378618+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('fe4b232a-397a-4312-96f0-0b3a0e0fe58c', '7dc18219-7f89-45ef-880f-59d95a9c3cac', '8798340d-7df4-4160-942a-5d222ea427b6', 'accepted', '2026-03-30 18:15:31.040109+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.connections (id, user_id, connected_user_id, status, created_at) VALUES ('ff6da519-9957-4723-80a9-30e6108661df', '8798340d-7df4-4160-942a-5d222ea427b6', 'd8484a31-77d6-49c3-b433-98614c8a71a0', 'accepted', '2026-03-03 16:16:27.160457+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
COMMIT;