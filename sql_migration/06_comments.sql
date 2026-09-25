-- Pack 6: Comments (Safe Mode)
BEGIN;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('0c3672a3-3734-4daa-b879-a5fd9a053077', '6df03385-fb12-4821-ae93-7010b0c8d3a6', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, ' ‎2. Feeling overwhelmed. Sometimes the course becomes harder than expected. When people start struggling to understand the lessons, they may lose confidence and slowly stop learning. Data analysis swept me off my foot😭,  but I''m definitely going back to it ‎ ‎3. Motivation also reduces over time. Many people begin a course because they feel inspired at the moment ‎', NULL, 'text', '2026-03-06 19:41:22.289706+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('0ec39790-b768-42af-add9-981243ad65a1', '94f8f011-5b49-4e8b-bd46-1f99b5d4d5f8', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'I didn''t expect the ending 😂', NULL, 'text', '2026-03-19 19:16:55.497109+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('13fd4271-d123-40a1-bf92-a90d26ee5898', '99f4430f-005e-4979-b092-0ee7bacdd28d', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', NULL, 'Thank you ', NULL, 'text', '2026-03-10 06:06:04.21077+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('1ecfab29-756d-45e9-b377-cb9864f6346d', '19d35f34-5624-4245-a602-0c00bdfa3a8b', '8798340d-7df4-4160-942a-5d222ea427b6', 'ab24f6b1-e141-4b18-9bd9-d1c6df4f74ee', '@tamilore I definitely believe local refining will solve this issue. It may have adverse effects at first, but it will surely yield large amounts of revenue for Nigeria', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/comments/19d35f34-5624-4245-a602-0c00bdfa3a8b_8798340d-7df4-4160-942a-5d222ea427b6_1775373207779.jpg', 'sticker', '2026-04-05 07:13:32.841537+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('2787a8ae-74bd-4630-a197-cd4ab4e6a31b', '37d9259c-78fb-4839-9d52-61e27c00d61c', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'Beautiful melody🤧', NULL, 'text', '2026-03-27 17:07:44.219684+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('2ba14a00-6a62-4885-b556-3fa340056462', '94f8f011-5b49-4e8b-bd46-1f99b5d4d5f8', '5551f4be-68fe-4bbb-b267-f95211d71f1d', '0ec39790-b768-42af-add9-981243ad65a1', '@doyasor I also didn''t expect my love life will be with books and courses ', NULL, 'text', '2026-03-20 08:50:00.263926+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('377cd491-fef8-436c-a995-785ccadd8843', '99f4430f-005e-4979-b092-0ee7bacdd28d', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'The link here.   https://drive.google.com/drive/mobile/folders/1if09a9QyNfBRlAKey7If5preZ3BswudZ', NULL, 'text', '2026-03-03 13:19:27.847899+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('37802a94-abac-42c1-a707-72ea05526001', '99f4430f-005e-4979-b092-0ee7bacdd28d', '24915d8e-82a1-4fb8-b1be-2fbe03d99794', NULL, 'Waw Masha Allah ', NULL, 'text', '2026-03-05 17:45:39.774396+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('3ab3bfcf-6134-4cd6-a6e6-86862cc3c434', '56c7c788-5ba1-4c78-9ef5-2e99e967b93a', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'This is so cool)', NULL, 'text', '2026-03-04 05:18:02.437096+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('403a095c-1af2-484b-8316-d682135bc841', '00d9533a-ce68-404f-8eb8-cc6515afa048', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'Hey', NULL, 'text', '2026-02-20 23:48:28.48984+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('57d12669-f898-4884-a698-ea3e9e80fd3b', '774bc2be-c079-47f8-bd28-83c4e65cd524', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, NULL, 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/comments/774bc2be-c079-47f8-bd28-83c4e65cd524_8798340d-7df4-4160-942a-5d222ea427b6_1772612273929.jpg', 'sticker', '2026-03-04 08:17:56.09124+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('5e06b9c8-0268-4e89-86f2-e48b04abd17a', '6df03385-fb12-4821-ae93-7010b0c8d3a6', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'To solve this, people can start by: ‎1. setting small and realistic goals. ‎ ‎2. create a simple learning routine. Studying for just 20–30 minutes every day can make learning a habit. ‎ ‎3. Connect the course to a real goal. For example, they can use the skill in a project, work, or share their progress with others. ‎ ‎In the end, finishing an online course is not about being very smart. It is mostly about staying consistent and making steady progress❤️ ‎', NULL, 'text', '2026-03-06 19:41:43.538207+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('5fc8babd-9b12-41f9-a350-9cdc7d76b8e1', 'f79a8156-58c8-4200-b053-2d8253079e94', '8798340d-7df4-4160-942a-5d222ea427b6', 'f730c41c-3464-4dec-9293-849dfc78efb7', '@adigun_bamidele omooooo😂😂', NULL, 'text', '2026-04-02 18:17:24.522268+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('61a6ea3b-a8b9-46cf-bf47-960665bd9231', '6df03385-fb12-4821-ae93-7010b0c8d3a6', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'Very helpful. Thanks😄', NULL, 'text', '2026-03-06 22:46:40.979545+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('6203371c-fff2-42b0-8da9-8e2276019c96', '2fae9acc-c051-4faf-b06f-c60d58e40be4', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'Even Abuja collect stray bullet Ibadan isn''t escaping ', NULL, 'text', '2026-04-07 15:47:51.979895+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('642180d3-b819-4a25-9561-5cfb64a36d15', 'd298b109-fc36-48d1-9719-940f522d64a5', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'Na to call igwe for you😂😂', NULL, 'text', '2026-03-04 05:21:13.005398+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('67e0f387-1c4b-4ef5-80cf-504e376fa43a', '5327859f-072e-4b43-8128-da662f54905a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'Na wa', NULL, 'text', '2026-03-01 12:49:53.845872+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('6b01c229-c2d5-4d86-ad04-d24c0137bc9e', '65ca262a-2189-4826-95ab-357e79500bdc', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, '✌️✌️', NULL, 'text', '2026-04-29 17:24:37.407958+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('6e4d6350-be7a-4a8f-ada9-da4c618089eb', 'd996ddb1-70e7-4f35-94f9-7406441b2fdc', '453fa778-b1c7-4bab-b408-7e92fc28e009', NULL, 'Hmmm', NULL, 'text', '2026-03-03 10:17:51.345692+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('78b05aa7-7533-4973-bd34-9c3a7413f2bc', 'f79a8156-58c8-4200-b053-2d8253079e94', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'Same here mehn🥲', NULL, 'text', '2026-03-16 17:42:42.451161+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('7b9f69a4-7148-4400-bead-f5cbc55de8f7', 'd996ddb1-70e7-4f35-94f9-7406441b2fdc', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', NULL, 'wow', NULL, 'text', '2026-02-28 13:24:35.959225+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('83f0e816-bc26-404a-8128-173564184ff8', '2fae9acc-c051-4faf-b06f-c60d58e40be4', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'Ishh', NULL, 'text', '2026-04-07 17:35:02.052097+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('8e45579b-d763-4af5-855d-fae1dd9619f2', '2fae9acc-c051-4faf-b06f-c60d58e40be4', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'Omooo! Leave Ibadan out of it Na🥸', NULL, 'text', '2026-04-07 15:23:53.102503+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('9186a2b2-efc3-4f75-8f31-d0811cffebbf', '5df8d31c-f15f-4483-8749-a8285eac3785', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'Nice work. ', NULL, 'text', '2026-03-10 17:37:36.630871+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('9310d9c9-ba85-41d8-a9cf-2a3067f34498', '73b955c0-56aa-480a-9169-262c76feef65', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'I''m excited 😏', NULL, 'text', '2026-03-04 16:31:59.2188+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('a1da04ff-b895-4f92-bfc5-a50abfaba8b1', 'd298b109-fc36-48d1-9719-940f522d64a5', '8798340d-7df4-4160-942a-5d222ea427b6', '642180d3-b819-4a25-9561-5cfb64a36d15', '@divine_akele ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/comments/d298b109-fc36-48d1-9719-940f522d64a5_8798340d-7df4-4160-942a-5d222ea427b6_1772607845842.jpg', 'sticker', '2026-03-04 07:04:08.642321+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('ab24f6b1-e141-4b18-9bd9-d1c6df4f74ee', '19d35f34-5624-4245-a602-0c00bdfa3a8b', 'a68689c1-dd51-4307-a0ba-730e7f589391', NULL, 'Do you then think of we focus more on or solely on local refining fuel prices will drop?', NULL, 'text', '2026-04-05 05:49:22.271601+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('bd77bd60-8805-498b-8b1d-acf617ea750d', '84b3ac32-c874-4eb1-a5f0-1c6e11239a38', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'Who''s psyched??😎😎✌️', NULL, 'text', '2026-05-01 09:36:15.549245+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('c860655c-8d07-4850-b488-b39300b54d94', '86c4d8ef-bb13-49df-94cc-2b857d0d11f4', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'You''re welcome🌹', NULL, 'text', '2026-03-08 13:13:02.806136+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('c94a582b-6b38-4143-833c-9f31a2aa0621', '3e9a8d4f-a264-4676-818c-0fe47f4cb967', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'https://chat.whatsapp.com/L2wsznERitsDawNcnlfJLc?mode=gi_t', NULL, 'text', '2026-03-05 16:52:46.096585+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('d430688c-b4f1-4a30-93f7-f74ea9d71702', '3e9a8d4f-a264-4676-818c-0fe47f4cb967', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'https://chat.whatsapp.com/L2wsznERitsDawNcnlfJLc?mode=gi_t', NULL, 'text', '2026-03-05 16:52:49.895691+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('d579aef8-3f09-4290-b593-1067d6e5c697', '68dd276c-87b0-4db4-80d6-06f0111ae360', '5551f4be-68fe-4bbb-b267-f95211d71f1d', NULL, 'Omo bro that can be really frustrating. ', NULL, 'text', '2026-03-10 18:17:47.125349+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('d6c14226-cb0a-48d4-9163-2a6b59c0751c', '99f4430f-005e-4979-b092-0ee7bacdd28d', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'lets goooo', NULL, 'text', '2026-03-03 13:25:55.606759+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('dcbb982c-103d-4fc0-84ef-ca856087dbb0', 'd996ddb1-70e7-4f35-94f9-7406441b2fdc', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, '@unilinkng awesomoe', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/comments/d996ddb1-70e7-4f35-94f9-7406441b2fdc_8798340d-7df4-4160-942a-5d222ea427b6_1772474042121.webp', 'sticker', '2026-03-02 17:54:03.498126+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('ead66979-cbb4-4cb2-92de-2622563c6894', '3e9a8d4f-a264-4676-818c-0fe47f4cb967', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, 'https://chat.whatsapp.com/L2wsznERitsDawNcnlfJLc?mode=gi_t', NULL, 'text', '2026-03-05 16:52:41.509763+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('f0d77607-4311-402e-b78f-79c33d90cb03', '00d9533a-ce68-404f-8eb8-cc6515afa048', 'a016d26c-04f6-4c93-ab7c-28a031139de6', NULL, 'Hi hi', NULL, 'text', '2026-02-18 11:43:15.896137+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('f730c41c-3464-4dec-9293-849dfc78efb7', 'f79a8156-58c8-4200-b053-2d8253079e94', 'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', NULL, 'You go see shege but you go shine 😅', NULL, 'text', '2026-04-02 09:18:06.113023+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;

DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ('fd0fe668-1173-4ef9-b598-f1c1fa5a24de', '86c4d8ef-bb13-49df-94cc-2b857d0d11f4', '4e61d28e-76f7-418b-8a69-281a3652ee23', NULL, 'Thank you Unilink 🙏', NULL, 'text', '2026-03-08 12:10:51.867386+00') 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;
COMMIT;