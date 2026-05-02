DO $$ 
BEGIN

-- Post 1
BEGIN INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, created_at, updated_at) VALUES ('00d9533a-ce68-404f-8eb8-cc6515afa048', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'Hello, My name is Divine and I''m from the university of Ibadan ', NULL, ARRAY[]::text[], NULL, '2026-02-18 11:42:59.847588+00', '2026-02-18 11:42:59.847588+00') ON CONFLICT DO NOTHING; EXCEPTION WHEN foreign_key_violation THEN NULL; END;

-- Post 2
BEGIN INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, created_at, updated_at) VALUES ('06d5df15-be56-4542-b1be-3799273b0185', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '#UniLink Hey UI students! We know life on campus can get hectic...', NULL, ARRAY[]::text[], NULL, '2026-03-03 14:57:21.577643+00', '2026-03-03 14:57:21.577643+00') ON CONFLICT DO NOTHING; EXCEPTION WHEN foreign_key_violation THEN NULL; END;

-- Post 3
BEGIN INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, created_at, updated_at) VALUES ('0798abc2-c140-413b-b27a-f489c35fa1d4', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'Calling all UI Penultimate Students! 🦅 (NHEF 2026)', NULL, ARRAY[]::text[], NULL, '2026-03-08 15:54:55.207939+00', '2026-03-08 15:54:55.207939+00') ON CONFLICT DO NOTHING; EXCEPTION WHEN foreign_key_violation THEN NULL; END;

-- Post 4
BEGIN INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, created_at, updated_at) VALUES ('0b8c7402-89aa-40cb-b931-f57985cdb26d', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'NHEF Scholars Program...', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772985622301_0.4380067531162267.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772985622301_0.4380067531162267.jpg']::text[], NULL, '2026-03-08 16:00:26.832314+00', '2026-03-08 16:00:26.832314+00') ON CONFLICT DO NOTHING; EXCEPTION WHEN foreign_key_violation THEN NULL; END;

-- [The script continues for all posts...]

END $$;
