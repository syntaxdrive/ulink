-- Fully-Provisioned Migration for public.points_history
BEGIN;
CREATE TABLE IF NOT EXISTS public.points_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('000aebb4-341a-48b7-8e86-4500a2409cd7', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-03-19 16:23:26.948523+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0017d3fe-2ec7-4dfa-96f5-28bd582f3b5e', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-03 15:39:13.648204+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0084c68f-95d9-4e3e-877f-c3dcb370ed02', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 15:09:32.980273+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('00c7d023-67ec-462f-a232-10e01b63e97c', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 21:30:19.347782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('00d4d37b-ce66-4aff-a246-76507e31510d', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-27 17:07:44.219684+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('014f0640-5b47-4b7c-9345-4cffc79c8ada', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '10', 'post_created', '2026-03-08 16:00:26.832314+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('01e5bfbd-6d0d-4d59-9b00-616a5a58f519', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 15:13:53.167122+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('024a6eb5-ba5a-4430-9c7e-0b884915625d', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '10', 'post_created', '2026-03-10 06:08:42.713682+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('02e1463d-275a-479e-a4bd-dd38cdda957a', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '10', 'post_created', '2026-03-08 15:54:55.207939+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('030c9169-c792-4fea-8ee6-09be81918f67', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-04-07 15:05:42.195521+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('03252615-f26f-4c8f-9dc4-3cc57af18d68', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-04-07 17:35:02.063727+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('03274c8e-bfe0-47a8-a68e-1330cc583381', '0bc9081a-1ca6-4c01-b367-e9038122b9ae', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('03f95084-af5c-482a-b286-8eaaf0fc81fa', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '15', 'connection_made', '2026-04-04 09:51:13.841962+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('049013f7-59ba-4781-82c5-966220d8294d', '2fd397a6-c090-4664-bac5-832d803c6c56', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('054eb4df-38b0-438d-ad1d-64c99b8fe79d', '440acc35-4fa7-4368-aebd-94cc272b3916', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('05c51544-f589-4981-aa46-89d9c1b22cc8', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-03-18 18:04:08.473048+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('05c627b9-4017-45ab-a14b-88bdb65185d4', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-02 20:40:10.050442+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0624541d-6652-4895-bc7b-c2b526e7fa83', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '5', 'comment_created', '2026-03-06 19:41:22.289706+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('064a6d30-076b-46ad-9163-77c0d4c6d191', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '15', 'connection_made', '2026-04-04 09:51:15.784757+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('06862665-6625-4585-907d-de85fb3f2efa', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 14:09:48.108969+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('06e5a4c3-d2ca-44a7-b1fb-79c3a3d1faca', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-03 14:24:18.58588+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('07a1b570-12bb-4284-9f87-ee45a9c88605', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-03 17:32:12.005601+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('07ffcd88-637d-48c2-b04d-38288cfdb590', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-02-28 11:42:57.619277+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('085c09c3-0196-4240-b01e-ef6d48e4d671', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-03-10 16:12:17.062332+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('08daaef4-4d0f-45b0-9356-4503b0b5bb59', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 16:53:50.183143+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('08dc6025-9287-4a45-a77f-d88f94c24436', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-03 08:14:15.263358+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0914ab83-2b63-40c9-85ad-e180b213a3e4', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-03 14:20:34.152343+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('09b8f5b5-fbc8-41b6-8700-4675046dbd0b', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-03-10 22:15:58.039821+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('09e8e44e-ea33-4aa2-84a4-869ad84423a2', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '15', 'connection_made', '2026-03-05 18:40:43.017561+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0a4612f2-edbb-4f43-a83d-3b5d2cae23e4', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-04 05:17:27.3925+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0a596920-7aae-48a5-a9e4-59b08475ebbd', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-10 06:04:14.399428+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0b189050-f645-4920-ae45-13a97e87f001', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-07 15:21:53.009862+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0b4d0027-f231-422b-aea8-0683049a7af9', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-26 09:07:56.194345+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0c6d7dbb-c68f-489d-967a-551b0c98055e', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-27 17:00:38.579718+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0c959f7d-e23b-4d19-b6d7-dc637f86a2fd', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-16 12:32:33.360365+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0d5b0e9f-9df5-4112-83cf-61d25c5e71ff', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 09:05:01.524489+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0dcf4eaf-8fe3-4a7a-a11c-327cade10d98', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 21:30:02.848531+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0e1b0569-0530-4e10-a8ba-21bb75cf518a', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-04-02 18:54:00.257883+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0e4d8382-f442-4b78-bcb5-7a9df91dd6bd', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-04-06 16:11:25.583293+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0fcee587-f5e0-4924-8b6c-f996322b92ef', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-04-10 09:49:17.468431+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('0fe8f4ef-551e-499f-852c-f756d644a336', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-08 20:11:29.309793+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1014ae05-772e-4f8b-b4a8-ee3686e5f29b', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-10 17:37:44.847109+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('101b09ae-30f6-4a85-b0a0-5bb08ab56d5c', '453fa778-b1c7-4bab-b408-7e92fc28e009', '5', 'comment_created', '2026-03-03 10:17:51.345692+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('117e05c9-9721-4490-bd9b-b2bb9cb15ad5', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', '15', 'connection_made', '2026-03-15 17:23:55.439686+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('11843629-4923-4a85-916b-8ac640338ea3', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-04-05 07:13:32.841537+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('12c72e9b-847d-4e18-8e0b-664b99125d7e', '2beaf604-2cac-4600-a7a8-5777402071c7', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('13612168-34b2-40f2-b9aa-0f8e30b89f60', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-03-21 20:35:22.942295+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1363d9ca-f8ec-4d44-9a60-62e8eabfae03', '8e1d27c4-f95e-4daa-81c2-c759368d7da5', '15', 'connection_made', '2026-03-11 19:18:36.174025+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('13c24f04-6dea-43b2-81b1-571cd380c762', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-02 20:51:59.496936+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('14a1e0fb-1d2d-4b17-aee1-801e4eeab7f3', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-05 18:39:29.170747+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('14c8c97e-d0a6-4f22-866e-824e2e5a3569', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 14:55:38.179899+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('14c9c400-2e51-41da-871c-c807cae52169', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-04 07:04:08.642321+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('14ee69ab-bbe9-4140-bd4e-e3dbea3a080f', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-07 07:27:05.941643+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1595209d-d36d-4cd0-9611-ed3cc3d25614', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-05-01 09:36:15.549245+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('15b46463-1718-4284-adf4-8ecfa87147a0', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-02 20:56:50.13436+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('15bff776-11b2-484e-a246-19f285a36c6b', '3bd69460-04a6-4445-bd49-eb809395aed1', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1647bd3e-b876-41f7-a35b-6260f3086a74', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-16 14:33:17.376393+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('16a548b2-6799-40bc-a873-14df717f16e5', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-25 18:35:22.207336+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('16a8dc1e-f6f0-48d9-a14b-d280f87c8520', '4e61d28e-76f7-418b-8a69-281a3652ee23', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('17a07b23-279e-4ff3-ba84-299e6e2192cd', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-10 22:21:34.129178+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1845ff9f-c599-4e5f-a50c-33a165731980', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-07 07:43:01.813642+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1848592b-e09b-4a68-8d28-626f18e4c9a4', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-04-03 08:44:42.519538+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('192dc5ac-09b5-4e8a-aba4-b8926d95d0c6', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-05-01 09:36:36.474026+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('19e3daec-55bb-426f-85f1-2cd0c2972520', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '10', 'post_created', '2026-02-19 13:45:57.156678+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1a50ed9d-1e2e-4985-befe-f616610aedf9', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-04-02 18:17:24.522268+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1afec33e-df2f-4f38-ae7c-9120b2c1d429', '819fdcfa-c350-4297-b6d0-134171ca15c8', '15', 'connection_made', '2026-03-15 17:23:58.053038+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1b93b166-f21b-464f-aa71-9281c88e176b', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-03 10:19:10.346055+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1bacadd7-5d7e-4b12-aae5-d47985bc735a', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-03 10:18:07.03977+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1bbbae74-2230-4dab-b17d-321504afa9a5', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-08 22:00:04.002768+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1c2df8ad-480c-443b-ae2f-5e43c0b3d704', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-11 09:38:20.479572+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1c58f1d1-877c-4984-b526-6ba86c67217f', '2f5f9545-ee9c-41f6-9699-4b5ea8bc0d06', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1c77e818-954e-48e7-8724-7fd07258cb47', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-26 09:43:15.904953+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1c883852-8248-4752-bc4f-23071b0eb327', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-07 07:42:17.374216+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1c967c7d-8cf2-4951-815b-97dc9426f1a7', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-04-04 11:50:49.894933+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1d008c16-1d2f-4fb0-9099-4df3d52149de', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-20 23:40:12.378742+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1d3a333b-a2f0-4c47-81d6-b9ab93c54989', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-04 08:17:56.09124+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1db63129-5b9e-4c4d-b5c2-d558139c0b4d', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 15:28:16.650971+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1de86144-aee5-4bb4-8e89-4465c48ce46e', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1e268852-3043-47f7-9f03-0838f681c25d', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-08 12:10:32.508907+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1e55b43d-7c39-4ff5-ad69-79c8a707223f', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-08 22:00:07.569239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1e5e439c-3924-464e-8841-5c6e14480eb0', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-04-03 21:08:46.308088+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1f73aaa4-571d-4b8b-8888-b2c9441013f9', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-03-04 05:40:54.86887+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1fa088c5-9150-4ee9-8479-a6fd48f768d4', '33c75afb-3e5a-4171-83de-8f915691c513', '15', 'connection_made', '2026-03-03 15:12:27.156445+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('1fcce20c-0d77-4314-8a3a-2532cdd5842a', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-03-10 18:17:30.351485+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2078a2c3-05b9-4585-8afe-ae88722a95e5', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '10', 'post_created', '2026-02-19 13:57:17.778212+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('21aa9ed8-0abf-41f7-9425-4d007d723e06', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-15 14:34:11.578224+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('22aa83d6-bc7a-4a81-8a9e-1ed18391cb9c', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-28 19:33:44.905722+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('22f63d05-fa09-42f0-a7d2-6d5b8d51879f', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-01 06:14:25.247815+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('23150f98-ce77-4696-b86f-e4c1ee3ea1e4', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-03 16:52:39.24652+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('234c494f-87bd-4e7d-9e4d-018c96c99f5a', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-27 17:20:58.172117+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('23d63c31-da22-45c0-ac15-11c323267f23', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '15', 'connection_made', '2026-03-07 15:58:28.759784+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('24ecda34-ce56-4714-8007-acc429bf6983', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-27 17:00:34.061325+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2506975a-6d71-4842-91a3-a5dd97cee8ff', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '15', 'connection_made', '2026-04-03 09:47:05.504569+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('25612b2f-636f-4318-9ddc-95d4795a2f41', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 21:29:46.933667+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('25d739de-bebd-4b15-9b4f-e614ded28b87', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-10 16:36:19.161439+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('26084a4a-feda-49b1-8cdf-362af813517d', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '2', 'post_liked', '2026-02-24 21:17:08.354598+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('260b649b-0341-4fcb-b0bc-6d29bd229e61', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-04 06:47:55.184543+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2638f743-f096-4a3d-b069-d9c74f31b41b', '217f054a-0234-42c0-85a5-804844487ba8', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('26aaf62b-37f3-400c-acca-935bd2f9f355', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-29 07:22:06.776791+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('276be8dd-8f10-4e16-be02-b8ac49b1f926', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-04-04 09:53:03.276016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('27ca4649-f79f-4155-8a41-3f959f5f05f9', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-02 09:17:16.312235+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('27cb9ca0-bccc-4c1d-a394-c43685de41f5', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-01 19:00:20.476718+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('284436d3-2a9b-463d-996a-63a464e08cc0', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-02-20 23:48:28.48984+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('29289090-2903-4615-9217-d1629ec64d47', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-15 17:50:25.101185+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2999a0dc-277b-433f-8391-6db45441b483', '3a35ef2a-b0c2-43d3-a2d8-44d334ed9c27', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('29a99b12-d613-4cc0-9b3e-40dd66686889', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-01 12:33:40.520929+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('29efd689-3c74-49e2-931c-46633078ccce', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-04-05 05:48:35.605514+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2a392e98-cc03-4b8a-9f9f-7bdf1dc3fe43', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-03-15 22:08:37.821835+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2a67c6be-1f8e-4d66-9e5b-5c46fdad1712', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2aaa4082-1e6a-4f71-870f-6d54ab12c183', '1fdb1e97-1e7b-4cc0-a321-52a884882c14', '15', 'connection_made', '2026-03-04 11:17:40.290046+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2ac37135-4b74-4e5b-b593-9e37980fb73a', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-13 20:10:56.53717+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2b04d927-d677-4d8f-94e4-0064f2994ad9', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', '15', 'connection_made', '2026-04-02 10:35:09.712794+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2b4fce95-dd9f-4ca9-8cbb-4d7464237921', '4be8e443-dc05-4790-b12d-adc4d2a6fa9d', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2b88e3a4-070b-47c9-8acf-3400db877f90', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-01 12:34:43.367218+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2c3b734b-3a9e-4108-bea7-27ca2e5d7805', '5b2275df-fb04-490b-ac8d-a5cba8607275', '15', 'connection_made', '2026-03-07 15:58:28.759784+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2dc1059c-679e-4325-9767-3d9491951dbe', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '15', 'connection_made', '2026-03-15 17:24:10.887219+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2f1f6bc5-13be-47ff-a094-bece6edec1ac', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-03-21 00:06:58.530986+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2f25ef11-e289-45f3-bfd4-5765ceeb3ac9', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-03 13:25:55.606759+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('2ff05fff-4974-4ca8-8361-e40168e2b34f', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-08 14:20:29.812654+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('300dfa1a-a9f2-4062-9fd3-01b0678d97c7', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-03 07:52:23.686934+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('303e0190-d720-4824-ac04-839eeab40390', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-30 19:24:41.886451+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('30671a8e-44ac-4e9f-81cd-a26cb6599a22', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-03 21:27:29.128872+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('307f3301-736e-4469-bf01-2ec4b9287609', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', '15', 'connection_made', '2026-03-16 16:44:05.09593+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('31904b01-7325-423a-a1dc-9d93ab8833ee', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 23:11:10.798669+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3267617a-a9fd-49b5-b0af-e6b18df5f44c', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-10 17:37:36.630871+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('327c4027-58c5-483b-8457-cb31137affd1', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-07 07:27:02.491925+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3298ae19-29c6-4e87-92df-b227b71ec299', '2beaf604-2cac-4600-a7a8-5777402071c7', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('32ad14a0-65df-4910-9935-4e8f1f9bbe86', '32f1614d-21de-48d8-83e4-ffc8c797f090', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('32d22eb6-9ee0-46b0-b113-a08e77eff305', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '10', 'post_created', '2026-02-20 23:06:22.414182+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('33358261-037e-45cd-9de7-e9b7ce9be0cc', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '15', 'connection_made', '2026-03-16 16:44:05.09593+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3398a259-1868-4ec5-9eab-6e0b68ac5b38', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-02 15:06:24.853087+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('33ca9cac-ef52-4d71-b365-d77956b3afb5', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-03 14:57:53.933209+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('33f4f437-2b16-416f-af2b-6fc84fafad41', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-05 16:52:55.847261+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('35783f24-ff85-49bd-b916-75fe7e7bae79', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '2', 'post_liked', '2026-02-21 01:24:38.589117+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('35e813e1-aa16-4c1c-90d4-4c327c3d6dc6', '32f1614d-21de-48d8-83e4-ffc8c797f090', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3647871d-39fe-4056-bfc4-cb1caa658b98', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '15', 'connection_made', '2026-04-26 09:44:37.230136+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('36aa7387-25dd-42c3-ac48-0cf31f29a37b', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '10', 'post_created', '2026-03-03 15:09:25.328095+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('370ebfdd-20e9-4b6b-ab19-68692156526c', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-08 22:00:09.698363+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('374cddac-f93c-4185-8ee7-79d78aef68a2', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-03-06 19:39:18.444821+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3758ccff-48e2-45c6-a3cb-db76178cbcd5', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-03 20:52:20.603914+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('37920747-0061-4e3f-8cbc-4495c11ae101', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-05 16:52:49.895691+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('37e0496d-1304-4b7d-b20a-7f583f0f2175', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-02-21 11:27:35.157556+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3809476e-b413-4fcb-b5e1-400a67475eb9', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '15', 'connection_made', '2026-02-23 20:11:28.476209+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('380a9f3e-b695-46ae-99e9-65c83675a81e', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-08 12:11:09.526346+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('398771c8-dcf4-43a3-a63a-2e8816277d88', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-02-21 11:29:25.858538+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('39cca607-4784-40c3-ba9d-05e202151a0a', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-03-29 07:22:11.216415+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3a24a3ad-262b-4b11-913d-eac9103bef39', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-02 15:03:28.448165+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3aa600d8-d7a1-44c3-9d40-c7273f7d88ee', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-30 18:16:15.10106+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3c100122-fe9d-4ef4-9a2b-f75b213040f0', '4e61d28e-76f7-418b-8a69-281a3652ee23', '5', 'comment_created', '2026-03-08 12:10:51.867386+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3c2d7c02-5978-43a1-ab58-7b81e642001b', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-03 21:34:10.639053+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3c308c76-2119-4f79-ad1e-b176aed95cea', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-02 16:23:17.468495+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3c4ca87f-c903-42bb-a1e3-eec239861e5d', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-22 11:30:15.183865+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3d4dfaf5-2fc3-4ae7-acb3-390c46199a4e', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-05 16:52:41.509763+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3e3cf024-399b-4c4d-92f7-6180cba1acd2', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '2', 'post_liked', '2026-03-03 10:19:10.349338+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3eb2a3bf-6f18-46d3-b726-a81ab7866ac1', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-04 10:54:27.972662+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3eb4bbf6-6878-46ec-bee6-d74cd2675276', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-03 17:21:48.968456+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3ecaac0f-f17a-46c0-9292-cef286d4296a', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '5', 'comment_created', '2026-02-18 11:43:15.896137+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3f66a977-e2db-4c45-a4bb-6a6e218c4a4e', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-03 15:12:27.156445+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3f9afde6-9a56-4142-acb9-1d3eed9abb1b', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-24 13:30:10.427057+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('3fe17633-1d8a-4052-b917-a0cf0d6a25e7', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '15', 'connection_made', '2026-03-30 00:41:48.065137+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4080fb6b-ead9-4576-8aa6-740a45208866', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-02 18:53:51.061866+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('40afe82b-0541-415f-8bee-74343a511782', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '15', 'connection_made', '2026-04-03 07:51:47.357782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('40fafcfd-3a65-4ff4-9deb-f85504451e17', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '15', 'connection_made', '2026-02-18 08:41:07.432995+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('41a23611-4cbc-4782-b601-4321e389818a', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-06 22:48:36.568984+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('41e603d8-575a-4e13-9261-3be7bd021b7b', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('41ea2567-38f3-4b52-b222-7cfb8ef00b95', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '5', 'comment_created', '2026-03-20 08:50:00.263926+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4243eb8b-a51b-4d83-9915-fa05bfdc48c6', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '15', 'connection_made', '2026-04-04 10:52:58.572561+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('42f1531d-ee4c-4603-babd-5eca8a2a8e26', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-01 08:23:23.07224+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('431c5036-9639-4570-88c5-c13e9035a9b3', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-04 11:19:52.345334+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('432389ca-f3bc-4e26-987a-7181182db765', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-05 16:52:13.156003+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('43c32fd0-8aea-4d28-882b-bd35f078402d', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-19 19:16:39.048592+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4429277e-21f5-4998-bf94-7faf1bdcae1c', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-12 19:57:03.033408+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('442d7886-3aed-4b47-b6f5-88ebf4a10ad7', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', '15', 'connection_made', '2026-04-03 07:51:45.677247+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4437f750-b72b-4b3c-847b-4aff17fdaf43', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '5', 'comment_created', '2026-03-04 05:18:02.437096+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('446842c6-3aae-42b0-8d94-043fcb0ec1ca', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-04-07 15:23:53.102503+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4565ab6b-6996-45a5-82ba-d334ae233820', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-22 18:24:19.005308+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('46287469-8024-4c07-8158-5ecbd448b491', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-04 16:31:59.2188+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('465f2f04-f205-4cea-96ef-54d71aba6e1a', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-03 13:45:39.042386+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('465f360d-0d74-42de-a060-ef52ddfd311c', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-03 14:24:19.395242+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('46b81a92-e79f-4a9f-b161-ee36648de2e5', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-08 20:11:45.202237+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('46c62605-662e-4c91-ab12-a14b5ad89ae2', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-02 20:56:57.24066+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4788ec21-7494-438d-8a6c-81bab02d7946', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-29 07:22:01.223846+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('47e50f9d-ecf8-4dd0-8d3a-dd83613841fe', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-15 17:50:41.709705+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4845acf1-82fd-41f5-b27e-2091dca07a91', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '10', 'post_created', '2026-03-10 16:55:26.93148+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4946b14d-2b3e-436b-b59f-5e81d5fc98fa', '363ab36c-1544-45c7-8fa1-6298c8ad85c6', '2', 'post_liked', '2026-03-07 12:57:49.124421+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('49a6f455-8c06-412d-b5de-4de90cbcef75', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '2', 'post_liked', '2026-02-21 01:11:18.89914+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('49c12e79-69dd-48fb-9d9c-b1fc5ed11bb3', '3bd69460-04a6-4445-bd49-eb809395aed1', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4a24e0a5-d465-4bc5-bbc6-b77b01765a91', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-04-04 06:47:21.231101+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4a6b493e-4e2d-4f0b-8f30-8db066fae304', 'a68689c1-dd51-4307-a0ba-730e7f589391', '15', 'connection_made', '2026-03-23 14:31:59.730567+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4add26db-c8cb-4de5-8229-a209d507e3d9', '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', '2', 'post_liked', '2026-03-06 22:45:55.411816+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4b625583-0b53-45c4-b048-2c66a9a814e0', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '5', 'comment_created', '2026-04-07 15:47:51.979895+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4bcd427c-b54e-4664-bc12-c23baad1497a', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 20:10:12.642662+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4beeacb7-0e73-4c27-9c5e-b780640f4719', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-01 19:00:26.199522+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4cc3708a-7c41-4f1a-9b5b-9f9fe573f8e5', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-07 07:18:08.843342+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4d2add75-8ccb-4278-be07-07138f3ccb1a', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-21 00:04:54.397391+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4d77da2d-27fc-407b-adbb-095a42e35d3f', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-08 10:49:40.424779+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4df7d510-0719-4661-8a9a-b48f5709ba7f', '819fdcfa-c350-4297-b6d0-134171ca15c8', '15', 'connection_made', '2026-03-03 21:33:08.719624+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4e65087e-42e7-46fa-b033-6fb171a4b965', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 21:29:54.650735+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4ef5ed3e-c2ca-45ab-9647-2d445aaa4477', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-07 07:27:16.575578+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4f277672-fe7b-4958-910c-d24422e5ea6d', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-11 12:29:21.02082+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4f4acadc-c9a0-420f-a773-b94839c9c356', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-03 16:52:24.149253+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('4f8c9828-dac7-4c5f-9e43-f9345a7987df', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-02-21 06:16:38.616657+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('500a0f22-cb91-4c62-bf72-d3f12321504d', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 15:10:42.195948+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('51555337-d8f3-4614-ba73-cee91a0f16ae', '33c75afb-3e5a-4171-83de-8f915691c513', '10', 'post_created', '2026-03-01 12:23:55.003094+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5182edc8-9701-4f8f-a999-7b410db14947', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-08 18:08:22.187878+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('51da4fac-b7f8-4d35-bdcb-37077091c9b9', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-23 23:37:49.814513+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('52004e8c-46fe-4118-ad21-29da56dad1a2', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-19 19:16:55.497109+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('52460f2a-ea75-47bf-948d-297e31b4001f', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-15 17:24:00.257884+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5387184f-fb80-43f3-8e1a-a9c3232f0b39', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-02 20:51:56.832273+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('54343f64-4598-465a-a285-dd7a97bde9a4', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-27 17:33:15.164927+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('54bb9830-7162-4f4f-adce-7248abf2c402', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-03 14:57:57.623213+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('54bf5251-15fd-4570-8f81-2c2ebc3bc4a9', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('551ff751-9cae-40ee-8bea-50b94b6fc0aa', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 09:37:00.554608+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('55bc9720-a155-45f1-947f-068f1b515857', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-03 13:25:27.107359+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('56ff4ab4-fcf3-4323-9ebf-95ec1a2a55b7', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-02 18:53:55.363081+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('57757336-cb22-474b-b3b3-220a5d5d5d42', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', '15', 'connection_made', '2026-03-15 17:24:12.576705+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('57959a89-d5fd-4421-b052-82f60d1ae744', '2f5f9545-ee9c-41f6-9699-4b5ea8bc0d06', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('57ddcbd6-4881-492d-92a0-64c91bdd460a', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 10:17:33.403847+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('582842c9-299c-4fc5-acde-a0d19de9c865', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-03 21:33:08.719624+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5a011a20-9ba3-40b5-8946-4911b025a8f3', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-26 10:10:09.308549+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5a16bfb9-4b6b-4366-8cf7-b7ac176b4755', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '15', 'connection_made', '2026-02-21 11:29:54.259668+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5a2a487f-ed93-47e8-910d-ce043f3fe87b', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-03-22 06:35:41.725034+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5a4b5d77-bf2e-4eb0-87b0-8ce417589097', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 21:12:26.030805+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5a698537-1e4e-4e74-a5c2-f4cabd7876ba', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-04 11:19:56.236786+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5a81828d-f650-44f0-890b-ef7ee58332c4', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '10', 'post_created', '2026-02-20 23:28:23.083675+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5ab84237-9151-4cd6-aafc-f4c5950bfa4b', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-02 18:57:23.894969+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5acd9005-7ef8-4121-ab70-f95b559d3085', '5b2275df-fb04-490b-ac8d-a5cba8607275', '15', 'connection_made', '2026-03-07 15:22:39.652094+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5acfb166-60a2-40ec-8c40-16b229a70bc1', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-18 11:35:29.211142+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5b639ddc-508b-4f95-8fbe-66c231e26aa0', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-08 15:16:31.208143+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5b94e43e-3693-4636-b059-dabfdc9880e9', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-03 13:46:01.423297+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5b966622-7878-49f8-86cf-5989a18239de', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '15', 'connection_made', '2026-03-05 18:40:43.017561+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5c192652-f833-416d-b3e2-bf6344f01424', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-02-21 00:00:39.493103+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5ca3f446-af18-4e0d-8f42-837328f1ea5d', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-10 18:03:00.833617+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5cec8a01-5470-493f-bfb9-873ea2a18855', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-07 21:10:07.90867+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5d679596-7608-476e-8318-64f4606a6c78', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-04-29 17:24:37.407958+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5d91e88f-65f4-41c4-b501-8601fd3de52e', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '15', 'connection_made', '2026-04-03 07:51:45.677247+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5e12c513-3692-4290-8581-40a2804340c3', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-04 10:54:54.651212+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('5e151df2-2046-4889-9e7c-d0f02b51a5f4', '3a35ef2a-b0c2-43d3-a2d8-44d334ed9c27', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6055d76f-f305-4b73-ba4a-38fb8d705a39', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-08 16:18:01.345071+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('61074114-34ce-4aae-9066-67b412df67d3', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-28 14:03:20.696193+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6113da68-ca90-4c03-ac59-78ba65857e23', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-18 11:06:25.424119+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('61332a59-a53d-4313-8c07-33e2b09c18ad', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-16 17:41:42.620531+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('61ae4f0c-a296-4f6c-a01d-82c7e5807c62', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '10', 'post_created', '2026-04-04 06:47:13.22904+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('61bcc2e3-e206-4164-a4e0-1a1ab9225f00', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-19 19:21:19.607221+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6244b547-0cb7-43b2-9afe-529cf9975cf6', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-03-21 01:48:29.616643+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6256573a-e921-46d1-8304-87969f5cf398', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-15 07:05:03.631666+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6274e27e-138b-4e7c-8cab-c328b2d2ab3b', '4be8e443-dc05-4790-b12d-adc4d2a6fa9d', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('62967008-f7fd-4197-aa01-e902e25fdc5f', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-01 12:49:30.628244+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('62a4c00e-c611-47f1-99fe-a7bfd048b450', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-03-16 16:14:15.178722+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('62f7d2f3-f5a0-49a4-b378-50da8d351881', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-03 17:20:06.906796+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6308d716-5143-43f9-9795-466b25cf54a4', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-11 19:18:36.174025+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('63a6da07-d932-4830-9d10-d3b39a05eef6', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-30 20:17:02.115594+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('63e12136-9d8b-4ffc-9b9e-b5cc214f66ff', '1fdb1e97-1e7b-4cc0-a321-52a884882c14', '15', 'connection_made', '2026-03-04 11:17:38.809021+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('63f50130-6f7d-4d35-a0a8-02ec58fcf3cc', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-01 08:23:17.309809+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('63f9d12b-9196-4553-a762-62418ea53945', '056f944f-5d1b-445d-ad66-9b34b7d06322', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('64bbce4f-49c1-4232-bd88-881c7a76f7c6', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-07 07:26:53.532782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6560621f-e6ee-4a2f-9f84-1f0dbb98a40f', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-22 11:30:19.033862+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('65e5ff04-c3d3-4786-a659-0b4dd6900607', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '15', 'connection_made', '2026-03-16 12:28:45.075866+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('663faed3-b56b-4b06-bf42-362d11c964c3', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-30 19:40:17.351317+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6643a518-2f9a-4993-9016-563ab6584986', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-04 05:17:14.1592+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6669b4f6-5559-43ce-a7de-99318cc21d4a', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '15', 'connection_made', '2026-03-02 20:43:14.338219+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('670f17c2-b742-4d81-ad84-e88cfaf95832', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-05 16:52:46.096585+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('674a7f52-62e9-481e-9553-ec893e77f9cb', 'c64e6cd0-244d-4e6b-b01e-837f0afe254a', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('67a06b42-be24-4e72-ac49-48786c22e807', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-03 23:10:02.211482+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('67bd9042-6a95-47e1-a7ef-6016c47ce23c', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-03 13:26:19.888448+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('686ef4cb-22ed-4aa2-8ae8-d82bc5ef3545', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '10', 'post_created', '2026-04-30 20:16:32.795221+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('68714691-adc6-4f0f-bf89-6d5e8362b581', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 21:12:23.734987+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('68b83875-5e84-45f8-86fc-e0e817a7b70f', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-14 16:24:04.092408+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('699139e8-0565-473c-97ef-e3eb0e1cefdc', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-04 16:30:42.549823+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6997526d-268e-4eef-94ab-33cd3caf5465', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-15 07:04:41.189274+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('69af8c60-f82d-41c4-873b-613dce6fd4a5', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-03 08:29:38.275303+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6ab0e77c-690d-4e1c-bb2e-1103fbc09e5e', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-03 16:34:13.831549+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6ac88baf-9a96-44f8-86ac-d19ac8eb2dfb', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-03 21:29:12.497354+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6adce382-e8f1-4bac-bdf6-e038cc8a9d38', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-21 09:25:01.308133+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6adde4fb-1719-483a-b5ac-6144ff2d72b9', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-07 07:43:10.321955+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6b0980f8-3c78-4cb1-af0c-fc0bd288ca0e', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-06 22:45:22.087973+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6bedfe50-07b8-4296-9080-2c2481d36227', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-01 19:31:37.545352+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6c261d28-d5b7-4ab7-8435-efa0f55a7d79', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-26 16:19:52.808385+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6cf32113-b248-4671-892a-295f4b765900', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-04-02 18:52:03.429971+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6d398f02-52ac-411c-83f9-b88d7d3f9d7e', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-03-19 07:11:08.259367+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('6d85d3cf-76dc-4fee-903e-e16719df4e0e', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-08 18:08:01.324741+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('701daeae-12ed-454c-80a1-49ddc82b180f', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-06 22:46:14.961926+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('71814aa1-66ae-4a87-a57d-0f2224107487', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-27 16:48:47.432496+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('72224faf-a757-4afa-b9f0-e18e80c0f9ea', '453fa778-b1c7-4bab-b408-7e92fc28e009', '15', 'connection_made', '2026-03-05 18:40:20.539849+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('725d5fb6-6c34-4dbe-b40b-fd5b1cf0d2a7', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-04 05:20:29.559069+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7275b03c-cd2b-4c45-beef-692dcd9cac59', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-02 09:22:56.07065+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('732f04a2-11ef-4bc4-a5c5-391ec622c3fe', '5b2275df-fb04-490b-ac8d-a5cba8607275', '15', 'connection_made', '2026-03-15 17:24:12.576705+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('73aac39b-9fed-4600-a376-75120e3df9ca', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-04 11:17:38.809021+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('746aee77-6f5d-4c0e-b559-7e06e5801004', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-14 11:12:47.095995+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7488d7b9-fac8-4b67-9810-2e97e95dc7c7', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-07 17:36:13.626424+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('75023937-b0a8-4865-b1e6-05e828684c2c', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '15', 'connection_made', '2026-03-15 17:24:10.138108+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7581c34e-266a-4902-9241-d02808f93851', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-02-20 23:48:23.391995+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('76c7ef2e-b186-43cc-ac3c-03f3dab5e296', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '5', 'comment_created', '2026-03-10 06:06:04.21077+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7700d630-352e-4db5-8cae-7528e9a6130f', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '15', 'connection_made', '2026-04-04 09:51:13.841962+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('77ebd732-0b4e-4496-b690-f96dcd086776', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-27 16:58:16.117387+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('78479786-1448-4b51-b5c8-82b039b8f098', '819fdcfa-c350-4297-b6d0-134171ca15c8', '15', 'connection_made', '2026-03-05 18:40:43.042349+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('78a8c4ab-4da0-4c86-aeb0-420a08e1962d', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-04 09:53:13.403049+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('78d35413-aa71-4966-98a2-bb0a0d86d504', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-06 12:35:10.182088+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('79279e90-339e-4402-9c80-2ffa33f769f2', '0bc9081a-1ca6-4c01-b367-e9038122b9ae', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('792a3cbe-0bd7-4d7a-ba36-fb8a6796bbf6', 'c64e6cd0-244d-4e6b-b01e-837f0afe254a', '2', 'post_liked', '2026-03-03 10:18:07.034093+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7959584c-f665-4c96-bbcd-914b87b3e578', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-02 18:54:03.889988+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('79f6b10c-b40e-45ae-a512-81b4d12c0e55', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-02 09:17:39.644139+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7a5214d4-ab5c-48b3-bfc6-0c60b90f95d7', '3debf670-e473-43ec-a6d3-c640a5989ac9', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7a9f0038-fc86-4544-a404-b3b0372d51e7', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-08 09:54:18.659907+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7bdbc7de-6be9-4283-99c4-e665dbcc1557', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-16 12:33:05.016675+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7d4305bd-84eb-48cc-85a0-336d036d5a00', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '10', 'post_created', '2026-03-11 09:36:56.156647+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7db40e40-19e2-40ee-9b79-f4eb7426c465', '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', '10', 'post_created', '2026-03-06 20:41:16.589639+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7df4eab8-ff1b-48a3-9cfa-c081e1fc6626', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-04 05:17:23.223921+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7dff377b-ad28-4d1e-96c6-f477a78c8a10', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-18 12:34:40.821664+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7e83243f-ba45-48e7-b7c5-8aeb282a17df', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '5', 'comment_created', '2026-02-28 13:24:35.959225+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7ee3beeb-ce55-47ff-8a77-9ebd11a93715', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-01 18:46:11.497695+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('7f7cb198-9d90-4a28-b3f3-4e0f46f74274', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-02-23 09:21:50.936276+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8023ac8a-1963-4988-a864-0683a2c479e0', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-08 13:13:06.210015+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8045175e-d6be-4f3a-919b-12be380ac978', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '10', 'post_created', '2026-03-03 15:10:34.574915+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('812a34b8-2606-4dd6-b132-818566edc878', '33c75afb-3e5a-4171-83de-8f915691c513', '15', 'connection_made', '2026-03-04 11:17:40.290046+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('81724f3f-8808-4e58-aa5a-a66ae2de1c9b', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-22 11:30:12.872005+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('819f6981-ac2b-41b5-9158-25b8c8e8d62e', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '15', 'connection_made', '2026-04-03 09:47:05.72114+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('81eb6d81-5ec2-4065-be9c-300c18ddafcb', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-03 09:04:59.105835+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8306c125-1535-4a11-9249-051eb6d65ddf', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-23 18:39:14.571541+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('84276b37-86c7-43d1-af79-aaa781dff180', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 10:17:41.617226+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('84b452a2-b164-4512-bc9e-8eda45d66132', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-01 12:30:43.083899+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('84cabf29-5753-426d-bbe9-e83891c68156', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-03-02 20:52:52.382561+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8509055b-36bf-4388-9e95-20db7ea5d849', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-02-18 11:43:06.989594+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('85139c48-6d4d-4dad-96c1-ab1f0c4d030b', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-02 18:54:11.132504+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('854dd44d-c720-415d-be25-0dc194d91949', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-14 11:02:22.363553+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('857f04b3-4129-462f-9dbd-8a2566233b7a', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 15:11:12.968193+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('858842ee-dd68-4989-a1a1-4dad16c827a2', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-03 16:28:27.915818+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('867cb1a7-ac1d-46fb-8ca5-05d1f356b8d9', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-03-27 12:41:55.785131+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('87523074-5807-43df-be61-340a58b6db37', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-01 13:22:12.31808+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('875f844e-6088-4bed-b6cf-a90288f8c096', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 17:32:16.531233+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('876f6f7f-01eb-4ca8-9c25-87e60868f687', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '10', 'post_created', '2026-03-08 15:56:26.016561+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('87c54fe9-86da-4971-9021-020a923ae72b', '33c75afb-3e5a-4171-83de-8f915691c513', '10', 'post_created', '2026-03-01 12:24:30.821735+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('88a489a3-f30f-4185-b1bc-cc7c012670e6', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '10', 'post_created', '2026-03-03 14:57:21.577643+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('88ae9cef-934f-4a67-977f-36852a54e20b', '30c368fe-2afe-480b-92ef-072b06c5bfb8', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('88e0fbc4-d8f1-4407-ab66-02d83abab9c3', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-21 09:26:32.885819+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8917e5a9-7299-429c-8d46-653df54418cf', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '10', 'post_created', '2026-03-08 15:51:59.419502+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8921d6a9-d6ba-4586-937d-ccfde7ac6691', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', '15', 'connection_made', '2026-03-15 17:24:10.138108+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8928e430-2c38-4108-a57a-b5822e330045', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-05 17:45:12.903093+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('896991b9-6a72-43a6-b575-7bc0ee98d8ab', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-02-23 20:11:28.476209+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('89dbf0a2-e15e-4e1c-8001-5f8861793af8', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-27 17:22:09.261057+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8a3cbfc4-d73e-4b5a-825e-f5a9818c2103', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '15', 'connection_made', '2026-03-01 13:22:12.31808+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8a68666d-3f9e-42f1-9a53-72855d46c84a', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 15:13:50.875956+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8aca5623-80bf-4a74-826b-34cfd9801eaf', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-07 07:29:03.075302+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8aec1ebb-02b2-4730-a840-f01a397b2c32', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-03-15 21:45:52.160202+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8bb25c94-c1a2-450c-abfa-88dc9a017e5c', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '2', 'post_liked', '2026-02-21 01:24:36.671611+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8bb6c9c4-f077-4d06-a38c-24a4f4b2deca', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', '5', 'comment_created', '2026-04-02 09:18:06.113023+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8c1e3160-22b9-4e24-a19e-6412b1ad7e59', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '15', 'connection_made', '2026-03-04 15:08:36.623437+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8c23c259-51ca-45e3-aa1f-0b25a447b159', '056f944f-5d1b-445d-ad66-9b34b7d06322', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8cc22232-a343-4b33-b74a-c77310fc0d5e', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '5', 'comment_created', '2026-03-04 05:21:13.005398+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8d283e2f-db76-4d91-b9df-784fadc8479b', '12804787-3749-4c69-bd0b-a0cb29a201c5', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8d41be04-e373-48e3-9783-f0431d0a1551', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-16 17:42:29.620991+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8e24e617-1d59-4403-9037-92f891634675', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-21 09:26:57.79757+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8e561964-9977-4763-98bb-bab3b961d81b', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-03 14:52:21.821013+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8e6e371c-c043-44f0-bcb7-db04c362c5c1', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-03-19 16:23:15.203225+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8ec6234d-ef89-4f55-92e2-35c6a9475ed9', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-15 12:20:30.853845+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8eda63eb-087f-4ae5-aa51-7c79584c8bdd', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-03 17:20:03.504766+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8f8e7515-adae-4f8f-b4fa-cb80c20286b5', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-20 23:56:06.850522+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('8fbf5fa5-c272-450f-a04d-3bb93b1cede1', 'ee09fe2f-eef3-4042-9d0d-c7be02aa2bd5', '15', 'connection_made', '2026-03-05 18:22:42.897874+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('90ea0fd2-d894-4ebd-9f5f-2f7decdf51e8', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-03 10:41:11.280162+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('91d3d925-0c46-4f88-a60d-14d0be4b7d5f', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '15', 'connection_made', '2026-04-26 09:44:37.230136+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('92035e86-f135-450f-9bc7-23479880f562', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-03-30 18:16:06.063633+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('924fb9c1-a314-4840-9ffa-885b6e419445', '7dc18219-7f89-45ef-880f-59d95a9c3cac', '15', 'connection_made', '2026-04-03 07:51:47.357782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9272ac28-4445-49f8-9f7d-49218b617924', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-03-10 22:15:59.43559+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9282c696-fccf-441a-a417-59ed6834a4b0', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-06 12:35:13.184221+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('937b7c9d-76d7-4c02-b9b3-64a12da2a5d5', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-03-10 18:17:30.434252+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('939b2668-7ccd-4181-820d-a88a58e6aa9c', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-18 10:13:42.17109+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('93d7466b-2636-4b6e-ad65-bfb83d0e3f74', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '10', 'post_created', '2026-03-18 18:03:36.747354+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('93df2a9e-588b-47bc-aa03-ebee8cdc488c', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-05 17:45:11.61153+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9444526b-b3f6-4127-b035-8f7f77177a17', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-07 15:46:59.404489+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('95011f6a-1911-4e40-9b40-bd703e3a42f5', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-06 14:28:07.609912+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('95019e2d-680a-463c-937b-4b5d2d4f96fe', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-20 13:40:31.106184+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('985aaab0-844b-474f-a04c-f944e9552958', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '10', 'post_created', '2026-04-03 16:52:15.087753+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('985df240-1b77-438a-b27f-ec7ef4175b19', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-02-21 14:09:27.263809+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9876e030-3802-4f89-be6f-abcb8c954e69', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9984d134-235d-41f3-b44f-218d6d1fd79b', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-01 08:20:13.191499+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('99b3019c-414a-400f-9b09-42b489a342e9', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-03 14:57:55.692456+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('99f0b0b3-c13e-490e-bd63-cbbf3481f9db', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-03 16:12:14.10138+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9a9d7484-05aa-44ed-a610-9499438af8fa', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-02-28 13:27:12.406012+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9abbb7a1-45ea-48a8-8f5f-694845e13987', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-23 14:31:59.730567+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9b5a394d-8b4d-40f6-b3ff-e7dbaf4b814e', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-19 19:21:08.223419+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9b6a5f62-bd7b-471d-b599-adacb37115cb', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-01 18:48:21.251335+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9be7e71b-3742-4a3b-8f2b-6df7445285e3', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-27 17:27:21.099303+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9be828fa-a01d-4054-9c1d-fdf57fd49be1', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', '15', 'connection_made', '2026-03-15 17:24:10.887219+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9d44d0e8-dded-4e59-9252-e181eec4c0ff', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '5', 'comment_created', '2026-03-06 19:41:43.538207+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9d609602-2e70-4537-a138-465d17d67bfc', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-04-02 10:35:09.712794+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9deb598f-a6af-4884-8728-eb8c46f8fd87', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-04 11:19:45.456801+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9e6c2090-46a9-4cf4-b059-80f31cbdabaa', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-13 10:15:17.094927+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9e9dcbcc-b57c-4fe2-945d-32451fce23eb', '33c75afb-3e5a-4171-83de-8f915691c513', '15', 'connection_made', '2026-04-06 15:56:12.643839+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9f8db745-dfd3-4091-b30a-1c90a6b471f5', '3aaa2a20-4c4c-482a-9e6b-50fe581897cf', '15', 'connection_made', '2026-03-07 07:28:40.991349+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9f9c0447-691a-410c-bc96-b95e2451fa16', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 20:51:47.103309+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9fa27a68-82a4-4825-932c-4cbb7ca6731e', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', '15', 'connection_made', '2026-04-03 09:47:05.72114+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('9fab29b0-4791-4934-af84-fec69f4e3eb0', 'c64e6cd0-244d-4e6b-b01e-837f0afe254a', '2', 'post_liked', '2026-02-28 13:27:43.004516+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a02ec984-13ed-4510-b725-9b581f068fb8', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '15', 'connection_made', '2026-03-02 20:43:15.796133+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a0747c45-364b-455d-a950-dc99ab92fb44', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-03 17:35:54.709942+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a0b91244-ef06-4def-810a-83b997f69abe', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-04 08:16:26.953762+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a0d19804-1f50-40af-bafc-963640b3e251', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-30 20:15:43.646601+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a10b40b2-6d4a-44b0-a2d4-a82364b97f44', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-22 11:30:29.249154+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a16840a9-e838-4667-bc5a-6c5b1c30b031', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-01 19:29:37.133075+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a294ae77-fcf8-4262-994a-9ceab0da62ae', 'a68689c1-dd51-4307-a0ba-730e7f589391', '5', 'comment_created', '2026-04-05 05:49:22.271601+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a2e2889d-13ba-4625-9633-25c6a406ec7e', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 23:10:42.66952+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a2f6062e-ca26-4b57-abf1-5578d6fc0486', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-29 07:22:03.554672+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a3781c7c-d842-4ed3-bc02-fb9cbbaae3b9', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '15', 'connection_made', '2026-03-03 21:12:47.728493+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a3ffd6a5-001a-4833-996b-459c3cff61ae', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-21 11:26:54.839678+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a59e22db-0c9b-476e-b75b-0339ef457eaf', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-06 15:56:03.213672+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a5dbcdd9-1504-47dc-865d-6618ad148498', '3debf670-e473-43ec-a6d3-c640a5989ac9', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a674ec3e-786d-46a8-8181-fe6eebb3109d', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-03 13:46:28.847252+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a69dbb1e-5f81-4b43-9796-649a8db3683f', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-03-04 15:17:53.38449+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a6e0fe0b-0fbe-4717-bb38-ccd6b61ccc7f', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-04-07 17:35:02.20109+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a70ac386-7b52-44bd-a3a6-c80b061c96c7', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-03 14:55:40.724436+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a7e3f0f9-9755-48bf-b968-c7ec03c5a815', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-03-15 12:14:21.351962+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a96fa5d1-6510-482e-bbe3-4abd3a53c83c', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-05 05:50:02.832199+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a9a42f38-a5ee-4481-b2d4-e1fc129dd3c5', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '15', 'connection_made', '2026-03-05 18:40:20.539849+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a9d592d5-dd13-4657-ae60-867ef58f3d8c', 'd364bb68-e2e4-4752-9ed6-88b53ead0c54', '15', 'connection_made', '2026-04-02 18:52:03.429971+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('a9e686b2-4128-4abd-8f29-ef28d3c1d94b', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 18:33:01.445475+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('aa96b5f0-f8a4-4d3a-9e0b-712cd18f19fb', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 20:52:14.519922+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('aaeb93a2-58df-4f9f-a194-e19c6dfbda92', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-01 12:30:06.694301+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ab72af5b-2494-4da9-949c-7bc0ed0b799f', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-03-06 19:06:23.339524+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ac1fb3e8-151e-401f-bb89-8018bec679a1', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ac49ada0-9691-4720-975f-d2b59b97d9b1', 'c64e6cd0-244d-4e6b-b01e-837f0afe254a', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('acc5b92a-1d41-4395-b4cf-f3b5077f7b5c', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-03 13:46:36.599218+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ae1ce1a6-2ccf-4840-98a9-378b14092843', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-03 14:57:32.263347+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ae382b7b-f726-4d47-a3b9-b07e3cd502b1', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-04-05 05:49:42.702718+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('aebcadf9-2904-4ab6-9eb9-7e0ec3398216', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '10', 'post_created', '2026-03-03 15:12:05.787347+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('af168e0a-13d0-4dd3-ab17-5451f4d5cc7e', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-05 18:22:42.897874+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('af32b99c-23c8-4da9-9c1d-f1ede79e8947', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-03-03 13:18:50.424105+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('aff54b33-4ae6-42e3-a9ab-058b3abc2704', '12804787-3749-4c69-bd0b-a0cb29a201c5', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b05f25e0-8277-49d1-9ef4-41acdfdcc7cf', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-03-22 13:18:15.717923+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b09d904e-2762-4030-8dad-6b4c2fc1192d', 'c64e6cd0-244d-4e6b-b01e-837f0afe254a', '10', 'post_created', '2026-02-18 19:15:30.352539+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b0b68dba-d252-438b-aa71-23f1f05b716c', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-02-18 11:42:59.847588+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b152d387-0e68-4265-9590-5e98f3f2eea1', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 20:52:17.429569+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b1de5566-9ff0-4c5e-b1ae-dae842c154be', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-07 07:15:26.207235+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b1fe5bb8-ae3b-46d1-b88e-2f37ef951dc6', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-03 13:25:55.574635+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b2087aac-d246-48c0-b07b-991b81016320', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-07 07:42:09.95708+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b25ca3ed-5344-4bdf-95be-884a5056287f', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '15', 'connection_made', '2026-02-21 14:09:27.263809+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b283cb9f-db38-4135-afb0-ae4896d7ec9c', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-14 22:18:09.32522+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b343699d-6aea-42be-b4df-f79190e547b0', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-01 12:49:38.064422+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b3909d6e-78e0-4acc-a162-2798b8ae479c', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-22 06:35:38.642411+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b4018e09-0355-42d8-948a-dce6f6b4f375', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-15 12:20:18.551558+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b42bf150-7dba-4f1d-80ed-e81db2bf2040', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-02-18 08:41:07.432995+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b49bc2e4-bc6a-4930-9dcf-7272f875e988', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-14 11:15:57.730132+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b4e6e232-3cd3-4870-935a-ee1bb9bd2074', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', '15', 'connection_made', '2026-03-15 17:23:58.053038+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b50b951e-27a6-4b9c-9342-cda2dcb9be79', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-05-01 09:36:42.053989+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b56277a6-752f-4aa8-926d-385bfd0c93c2', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-16 17:42:42.451161+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b569901e-a0f4-4054-9c6c-6623bdefb441', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-02-24 16:16:20.67725+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b5b46dc4-7052-4d5c-b9c3-38a8e4c6969c', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-01 19:31:34.93316+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b620fcd9-c42b-40aa-ae40-fd0f4a9b8562', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 10:17:31.399954+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b738778f-ca77-4c0b-a10a-6394905ee8aa', 'f4926ff6-b964-44bc-be06-f6d9cc91b705', '15', 'connection_made', '2026-04-06 16:11:25.583293+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b785b9a1-4bf3-47f6-bd88-9100ffd43ddb', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-27 17:07:14.99954+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b7d44222-9b79-478c-beb1-0990757e8c57', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-04 10:54:54.198117+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b850d531-2e4a-46dd-81f9-4aa005522d38', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', '15', 'connection_made', '2026-03-15 17:23:55.300639+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b8e69b81-c29f-4888-bfa9-3440ed7ef3df', '453fa778-b1c7-4bab-b408-7e92fc28e009', '15', 'connection_made', '2026-03-03 21:12:47.728493+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b919bb4c-fb4e-46ac-ad75-b5341d894eed', '33c75afb-3e5a-4171-83de-8f915691c513', '15', 'connection_made', '2026-03-14 16:19:14.199667+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b9493552-5c08-42be-a1da-8845d332519a', '30c368fe-2afe-480b-92ef-072b06c5bfb8', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('b992f0c8-6466-49aa-9e66-545a94577758', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-18 10:13:04.666892+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ba31c105-43fb-4734-a881-0d25a7ed55a0', '2fd397a6-c090-4664-bac5-832d803c6c56', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bab87ac2-2e0e-423b-8b17-082ac1751281', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-02 18:56:37.481736+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bb70af46-047e-4a7f-b418-29b736e9913e', '3aaa2a20-4c4c-482a-9e6b-50fe581897cf', '15', 'connection_made', '2026-03-07 07:29:03.075302+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bbe69968-b88e-4efd-9547-5e134ba9c4ff', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-02 16:19:18.186489+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bc776149-2e17-4795-8168-a978a8c6b1ca', 'fc9d4ad0-dc79-4a3f-a2bb-a857ff706c46', '15', 'connection_made', '2026-03-03 21:27:29.128872+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bcb683f4-9931-4d1b-b817-65be26190bb2', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-04-07 17:35:02.052097+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bcd92b56-4015-4585-8716-1f6acb7e669b', '363ab36c-1544-45c7-8fa1-6298c8ad85c6', '10', 'post_created', '2026-03-07 07:41:48.677605+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bd0183b0-4c7a-4a41-a8c9-efa0dbaf1910', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '2', 'post_liked', '2026-02-24 21:17:06.542869+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bd625464-9e33-4808-800d-bebc5feb0656', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-02-21 01:24:12.893013+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bed454f9-2a24-4552-9bff-f8e3df08b565', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', '15', 'connection_made', '2026-03-13 20:10:56.53717+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bede9492-6dd3-4669-b200-4ae0c3fe737a', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bf724177-5bf4-4745-b77d-4c669d564036', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-06 12:35:16.409906+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bf94b82a-06b2-4fdc-b6b9-9af172bcca5c', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '10', 'post_created', '2026-03-08 15:58:23.063073+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('bfb7a6b9-006a-4ba8-9245-96707d30b6b0', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-06 15:41:46.184512+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c0b53762-ff49-4398-a0e0-f7b95cacfb49', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-03-30 00:43:40.622539+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c139ebef-d853-4456-984c-061d90f71dc4', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-02 17:54:03.498126+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c29ce24b-7b04-43ba-a377-a7874fb72dac', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-24 03:23:41.680412+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c3acac4d-4b42-460c-b524-1be1e9d77c08', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-21 13:04:46.346146+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c40e2c5b-afc4-4d7c-9442-1ba768e85061', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '10', 'post_created', '2026-03-08 15:53:15.165099+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c5254aaa-b8f3-46bc-92bf-a0abbecb97c4', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-03 16:28:40.275702+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c529d742-bbda-4fd0-95e8-4cb77d2f9bc7', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '5', 'comment_created', '2026-03-10 18:17:47.125349+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c53c6c7e-9975-46ea-a49a-d57d548e5f0d', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-03 13:26:22.219298+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c62041a8-67fa-4442-803e-6b50de07e8ae', '33c75afb-3e5a-4171-83de-8f915691c513', '10', 'post_created', '2026-03-03 14:22:52.256303+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c6366613-b858-4cd3-bedd-f6ba85601922', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-02 20:53:06.366105+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c6f043ff-0eac-42e2-85c1-29de6ac4ac9f', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-03 09:35:53.6361+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c770b065-aafb-4b81-8bae-a471b86fb7e9', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-07 07:27:13.393819+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c7eb9402-5ecc-4f7b-995a-d8c051f1007b', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-03 13:08:49.408769+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c80c04af-7ac8-4723-bc81-f4b3d115d2e6', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-02 21:00:31.813616+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c88d3437-2eb6-4b59-886f-df34b64b94b1', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-10 18:14:23.032047+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c8d0447f-0ea8-42ae-8c78-3c5b66038506', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-06 22:46:40.979545+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('c93dadcf-4486-4ff8-b22d-12fc8281e8c6', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-08 15:27:21.451165+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('cb4940d9-c71d-4029-a4bf-c599ac6af5cd', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-15 12:32:53.359256+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('cbcbf61c-9e1d-4e45-b21d-bf24cb3c7a2e', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-01 15:20:10.561621+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('cd476b86-df36-43be-8ab9-fb3a2f6a54bf', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-07 22:18:29.806626+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('cd789d6c-f20b-4ea5-9c06-530ebc8a5750', '440acc35-4fa7-4368-aebd-94cc272b3916', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('cd7b788e-cafc-4628-a8c0-8d75844f9473', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-04-06 06:23:30.499214+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('cef6884e-a3da-4e55-8389-3f6ae5e6625d', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-23 12:37:33.303356+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('cfdcf967-1361-403c-afeb-81b5965b1beb', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-02 09:16:44.941094+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('cfe781d0-1b6a-45d0-a516-2c5aee3b4c0f', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-03 14:24:20.191906+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d0b06a02-a080-4e38-9c37-5b7c918a34a8', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-10 17:40:40.075838+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d10cd688-917f-4aec-bce7-10f47ca592d3', '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', '2', 'post_liked', '2026-03-07 07:27:08.084729+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d1150c10-404a-441a-8aaf-52d1cb22bca4', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-03 16:09:02.276857+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d158c00f-7034-4bfe-844c-f82f29b5c968', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-03-10 17:36:54.137974+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d15ab4b5-c2c6-4df5-b96d-8f0183b88dd5', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-08 16:17:59.34913+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d1730ba6-ebeb-42ab-86fe-39df9e94cc35', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '10', 'post_created', '2026-02-20 23:38:11.229247+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d22f0593-5013-4565-ad61-914bd369c171', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-04-04 09:51:15.784757+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d2eafdea-d938-41f0-8ba1-a8c098aa7d9b', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '15', 'connection_made', '2026-03-10 06:04:14.399428+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d30064f5-fc47-4e81-b574-a1208a8aeac8', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '5', 'comment_created', '2026-03-03 13:19:27.847899+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d40d957c-ec3b-445e-a6de-1d6b0bbb2ba5', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '15', 'connection_made', '2026-04-06 15:56:12.643839+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d4a8ca93-7080-4ef4-81ec-499da2191c3f', '33c75afb-3e5a-4171-83de-8f915691c513', '10', 'post_created', '2026-03-03 15:13:26.067011+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d4d7253c-bb7b-43be-9a47-d674b67565b1', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '15', 'connection_made', '2026-03-16 12:28:45.075866+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d51b252c-13c2-49d4-8a6d-5a00be3f7dd1', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '10', 'post_created', '2026-03-02 22:12:29.249415+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d587795a-e27b-4fc6-bdae-ad0eed09b9ab', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-07 07:42:49.507992+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d5e2984d-f848-4899-b30f-06e19a6c599e', '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', '2', 'post_liked', '2026-03-07 07:42:44.412397+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d5fce194-5582-45cc-8c0b-2d081f2ab2da', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 23:10:33.09394+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d61b9068-c0df-4522-a752-0295acf5f40a', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-03 21:12:28.542509+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d6200030-8363-4b6b-b909-8e863ec885f7', '5b2275df-fb04-490b-ac8d-a5cba8607275', '15', 'connection_made', '2026-03-07 15:46:59.404489+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d624defd-9084-4f9a-a6bb-8558ac1fca2c', 'ccbb49f8-195c-453f-96f7-a498f9e409f1', '15', 'connection_made', '2026-03-15 17:23:55.439686+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d64a22ef-703d-4531-aa2d-f2f095c1e37a', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '15', 'connection_made', '2026-03-15 17:23:55.300639+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d6ca28ab-ab00-4ea0-bf8c-57b1d6a63985', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-30 18:16:09.754775+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d76c0c87-d0d0-41d4-be38-572a5ecd3b97', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-26 12:39:12.527449+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d7dbdc9f-c25f-4601-b910-ab7734e8325b', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-18 10:12:54.959538+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d800fa38-bf07-4e79-a8d6-0c4c17e2ea32', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-04 11:19:49.275514+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d92fb80a-297a-40ab-9d82-89388cbd92b2', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-28 14:03:50.090834+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('d9879369-f4ed-4e2e-aea8-02fefb0cd7e7', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-18 11:12:49.159521+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('da683605-f458-42aa-b405-e3269177b275', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-19 16:59:28.6112+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('dab09355-368c-4bc5-91c2-4cbed2c43c98', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '10', 'post_created', '2026-03-21 00:09:08.705602+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('dbdf79d6-696a-426a-aa8e-13f71d697a23', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-15 12:20:28.270449+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('dc85ed74-f00c-43c8-b206-7f5db60d271a', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-04-26 09:43:01.828094+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('dcfaf86b-bf2f-4c97-8dbe-14a5a7c7cfd6', '217f054a-0234-42c0-85a5-804844487ba8', '10', 'post_created', '2026-03-28 19:49:05.283782+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('dd53e636-2b60-4a8f-b037-5c31bdd4e536', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-02-21 11:29:23.173169+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('de706830-c3ce-4ea9-963e-4552f1615c5c', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '15', 'connection_made', '2026-03-14 11:15:57.730132+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('df4dc2fd-8529-4120-900a-81651da9c4d1', '33c75afb-3e5a-4171-83de-8f915691c513', '15', 'connection_made', '2026-03-07 07:28:40.991349+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('df69fd60-4e7d-4798-8620-7a5a57631048', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-02 09:17:05.214731+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('dff25317-d3e3-4a2a-834b-4104019e1183', '17e6a244-29dd-4a76-b202-f41cdcd6b3b1', '15', 'connection_made', '2026-03-14 16:19:14.199667+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e0ccbf9f-5ded-499c-af8b-6b70ee97357b', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-07 22:18:46.327826+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e12b67d6-61a3-4785-91ae-eb2d929dbd56', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '2', 'post_liked', '2026-03-26 18:00:41.9063+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e1a3dd31-b4be-4f7f-b929-4bc3795f58a4', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-21 14:14:35.355654+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e1ff909e-4b9c-4158-9249-c7a03a0f6c9a', '7dc18219-7f89-45ef-880f-59d95a9c3cac', '15', 'connection_made', '2026-03-30 18:16:15.10106+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e254a27b-f72a-4966-b4fd-6932f4414c57', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-04 08:14:20.113255+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e2d559d0-42fd-494d-82c1-bdde72b89ef3', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-02-18 11:08:59.427291+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e3519689-7660-4f77-8b6b-07dc5c602d11', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-18 11:25:18.217356+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e39f6688-d7fd-427b-9063-9e8b029b37fe', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '15', 'connection_made', '2026-03-05 18:40:43.042349+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e3fcda10-f345-4e5d-9653-7433f472f7fc', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-03-21 09:25:08.863569+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e42235a1-5991-415f-b704-032aea721a63', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-27 16:58:06.170009+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e49aacf9-40e9-4ae1-96e5-ad51e68ba218', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-23 12:37:48.227183+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e4f299ef-9471-4350-a71b-e0822ec626bf', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 16:12:55.505758+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e51d1ed2-7c13-4695-825c-e29b7c6df628', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-30 20:35:20.345935+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e5e05fd3-aff1-4293-a535-90be3a2b9fef', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-03 14:57:52.565377+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e5e982ec-d3bf-4417-9345-90ff2caf13d1', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '2', 'post_liked', '2026-04-03 22:24:34.388007+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e67131af-e799-47c5-9a87-4cf0c13f0ae1', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-02 17:40:41.01266+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e68cdcb5-45c4-40fb-a70a-98b9c5ccbb44', '4e61d28e-76f7-418b-8a69-281a3652ee23', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e70a5d8d-31cc-482d-b680-90f6f11a1a54', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-30 19:24:50.258187+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e737f11e-8e38-499d-a69d-a488a94a8d67', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-25 18:35:45.137249+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e78abcd5-ed08-4ed9-954b-8fc70aff9ff6', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-01 12:49:53.845872+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e83519dc-b3e6-456e-9231-06a2994088d2', '11ee4c78-396c-45d1-bb70-56ddea408bdf', '15', 'connection_made', '2026-03-30 00:41:48.065137+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e878e795-bfb2-43e1-9576-16380701611b', '8798340d-7df4-4160-942a-5d222ea427b6', '15', 'connection_made', '2026-03-14 09:55:43.350775+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e8a7e5f9-90f6-4d98-98f2-78406d153a6c', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-27 16:48:51.791889+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e9cd2c3b-5bda-426c-84ac-20e44448f208', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-07 15:20:28.867365+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('e9e751f5-751a-4659-b7d5-e7f9ca890de4', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-11 14:10:29.280036+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ead60799-9564-4ac2-864a-59cf49c4e3d1', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 20:51:52.296964+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ec001272-9895-4bff-b13c-54fd44aa5ed7', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2', 'post_liked', '2026-03-03 15:39:31.95004+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('edbe948d-57be-447b-bc54-04d9d78facfa', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-02 22:12:12.633696+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ee1e929c-0af3-4795-8923-c14b912ab1ab', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '10', 'post_created', '2026-03-14 22:05:36.259626+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ee90b369-7580-4959-9186-68dc75d9c9be', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 20:15:37.859041+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('eee67be6-c095-4626-aeee-255a95471f5b', '03c766f0-01cb-4569-aace-bb480dded7fd', '15', 'connection_made', '2026-04-04 10:52:58.572561+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ef1f534b-57ef-4e12-9413-7c2d270fca23', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-27 07:12:13.249182+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ef25763d-ed5a-4843-98ab-9b8409dda3c5', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-16 12:03:59.707612+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ef5cad6e-ef40-43ef-bd37-20ce9ef48dae', '24915d8e-82a1-4fb8-b1be-2fbe03d99794', '5', 'comment_created', '2026-03-05 17:45:39.774396+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ef73a22e-d26c-4ff9-8f7f-6ef5e196e2af', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '15', 'connection_made', '2026-03-02 20:43:14.338219+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ef7832ec-6120-4dc9-8d6d-3557e27404a9', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '10', 'post_created', '2026-03-02 16:44:59.319112+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f06fd18d-ca4a-4aca-8515-d359cb83d44b', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '2', 'post_liked', '2026-02-20 23:28:28.883708+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f1863490-8c14-4f2e-b5f5-332ad293fe29', '453fa778-b1c7-4bab-b408-7e92fc28e009', '15', 'connection_made', '2026-03-03 10:41:11.280162+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f26c2c8f-0c3b-4b61-a8b4-7d9376abe4bd', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '10', 'post_created', '2026-03-08 15:52:31.790775+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f2b783d8-fec7-4720-874a-32ac498b4a0d', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '15', 'connection_made', '2026-02-21 11:29:54.259668+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f2f28fb0-63cd-41b9-a870-68ac3c601878', '819fdcfa-c350-4297-b6d0-134171ca15c8', '15', 'connection_made', '2026-03-04 15:08:36.623437+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f308dec3-aedc-4d96-a036-47e5ef795887', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '2', 'post_liked', '2026-02-21 01:24:37.584124+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f4b14356-dc8a-4b38-83bd-4733a451ca20', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', '10', 'post_created', '2026-04-01 06:14:03.173566+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f50fc03c-1e02-4b97-aa85-2ae35d21c357', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-02-18 12:23:37.270712+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f53c1764-a7e1-4017-a0aa-51c77af2ee6d', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-06 15:38:52.725866+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f5861b11-462e-45b8-b80d-c21a61f3e7be', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 15:11:10.210918+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f5e1303c-997a-4bc6-a6d1-39f9e0ce092f', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-03-22 18:25:33.75127+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f5e80364-c3f7-4641-b1cc-44094ff01177', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-07 15:27:24.91872+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f6142ceb-2ce5-40d3-b06c-de26d12617e8', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '2', 'post_liked', '2026-03-03 15:11:07.288895+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f663ae8f-8b24-41d3-8170-d76072a13f48', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-03-27 16:55:29.168146+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f7689d17-91b1-4ab5-82b0-d702f2c10efc', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-18 17:57:15.455867+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f7bf1d8f-0c33-4610-a091-d20c5486f902', 'a9279bce-742e-4ca5-a993-a820b18830d7', '15', 'connection_made', '2026-03-07 15:22:39.652094+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f85d4b79-b5fa-498e-bb3d-b7da418b7ee9', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-28 19:34:14.636397+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f86628f7-0127-48c2-9915-dc55b943b297', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 14:52:31.207969+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f8b052b1-348c-40d5-b022-362fdcd289e8', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-03 16:28:13.538662+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('f957f627-05d2-4f10-8ed3-702204378ace', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '2', 'post_liked', '2026-04-26 09:42:55.413143+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fa27f4ef-86cb-4850-9235-9817f8ef24b6', '8798340d-7df4-4160-942a-5d222ea427b6', '10', 'post_created', '2026-03-27 17:07:01.662948+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fb0eec55-153d-42bb-8f1a-cd2fa3058d2a', '7dc18219-7f89-45ef-880f-59d95a9c3cac', '15', 'connection_made', '2026-04-03 09:47:05.504569+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fb551db8-d039-49ee-aab5-e1dbba417ca3', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-03 20:52:05.615511+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fb794757-ba40-4db2-8145-45c6af2bde7b', '33c75afb-3e5a-4171-83de-8f915691c513', '2', 'post_liked', '2026-03-03 14:24:04.045644+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fb82ebd0-f3f4-44cb-b378-1994ce756bac', '03c766f0-01cb-4569-aace-bb480dded7fd', '15', 'connection_made', '2026-03-14 09:55:43.350775+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fbae8c3a-cd61-48f5-8a9b-1a402685e366', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-08 20:11:28.461519+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fc1342c8-1be9-4595-ab96-5f621d101320', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '15', 'connection_made', '2026-03-02 20:43:15.796133+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fc237595-9370-44bc-8e4e-8ea304e634b5', '27d1ad60-6d73-439d-b4b2-4a1827371c24', '10', 'post_created', '2026-03-28 19:49:04.584016+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fc3d6521-14e6-446c-9e56-4b45af6930f8', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-03-27 17:29:00.785971+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fc714f96-49ad-4c61-8271-3918b14d444c', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '10', 'post_created', '2026-04-06 15:55:25.827951+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fc950118-77fd-4270-831f-13fcb4b8cc87', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-03 13:25:55.574995+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fd437f6c-ad22-410c-803f-33ab9e0726b9', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-08 13:13:02.806136+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fd83c26a-ef68-4d77-a0b5-f4299b0a2044', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-04-30 19:40:10.200848+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fd9671cc-924a-4785-8a8c-116823756c4a', '8798340d-7df4-4160-942a-5d222ea427b6', '5', 'comment_created', '2026-03-01 18:58:58.317918+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fdb07ada-f28e-421d-bae5-0401e07048cb', '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', '15', 'connection_made', '2026-03-15 17:24:00.257884+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('fe25bb10-e368-40ff-aa0b-2c3933ef440a', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', '2', 'post_liked', '2026-04-03 16:52:35.034912+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ff0a35df-5681-44e9-b291-ca8bfeba3bbf', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2', 'post_liked', '2026-03-03 15:39:38.745332+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.points_history (id, user_id, amount, reason, created_at) VALUES ('ffa91cc3-22e6-475a-a6b3-15451743fc4d', '8798340d-7df4-4160-942a-5d222ea427b6', '2', 'post_liked', '2026-02-18 11:25:25.250707+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
COMMIT;