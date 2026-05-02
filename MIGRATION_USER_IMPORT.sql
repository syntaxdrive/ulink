-- UniLink User Migration Script (Full Auth Sync v3)
BEGIN;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '006493ae-dc23-47d5-bea3-ebd1afabb6ec', 'authenticated', 'authenticated', 'titaedu4@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "TITA Universal Services"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '006493ae-dc23-47d5-bea3-ebd1afabb6ec', 'titaedu4@gmail.com', 'TITA Universal Services', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJbqierxRlglPm4tKuP6PJW73JWHut9N84ih_g1X3ImOHyZT_g=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'X68548C9'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '02770d5c-c756-441f-9ab6-fd1346f4f399', 'authenticated', 'authenticated', 'ajibolaadegbite54@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "update matters"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '02770d5c-c756-441f-9ab6-fd1346f4f399', 'ajibolaadegbite54@gmail.com', 'update matters', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKTTQ22ez-bI3smtZk422qEEWcgy2EhVIRVJdTLNq1PNr1OGOg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '249DB3X9'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '03c766f0-01cb-4569-aace-bb480dded7fd', 'authenticated', 'authenticated', 'dmadariola205@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Daniel Madariola"}', '2026-03-02 22:34:02.943213+00', '2026-03-28 20:44:05.439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '03c766f0-01cb-4569-aace-bb480dded7fd', 'dmadariola205@stu.ui.edu.ng', 'Daniel Madariola', 'danlight', 
    'student', 'University of Ibadan', 'https://lh3.googleusercontent.com/a/ACg8ocLTdmYZ0Mzr_1MQ8LZiJ2rgpjtskU6JkLDRsXyySiy4JzNgJIo=s96-c', 
    NULL, 'Junior Architect, Spoken word Artist, Songwriter, 3d visualization enthusiast', 'Ogun State', 
    'Year pg student, Architecture', '[]', '[]', 
    NULL, NULL, 'https://www.linkedin.com/in/daniel-madariola-419a982a2?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-03-02 22:34:02.943213+00', '2026-03-28 20:44:05.439+00', 
    0, 1,
    '[]', '[]', '2026', 'AFBDF494'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '03c99aa5-ed1f-4390-99ef-1e4234300e75', 'authenticated', 'authenticated', 'adegbengaagbola60@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adegbenga Agboola"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '03c99aa5-ed1f-4390-99ef-1e4234300e75', 'adegbengaagbola60@gmail.com', 'Adegbenga Agboola', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLKHFO6yZ2dH5sBFy5DXDYgJZTumQcJoIyRQhxn_QsH9yCLE8o=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'XBF2C674'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '04b8b975-9e5d-402e-8c15-b1cfbc692955', 'authenticated', 'authenticated', 'omotomoniyi@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Omotayo Omoniyi"}', '2026-03-07 15:55:04.538258+00', '2026-03-07 15:55:04.538258+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '04b8b975-9e5d-402e-8c15-b1cfbc692955', 'omotomoniyi@gmail.com', 'Omotayo Omoniyi', 'codx', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocK_U1iNbaBt1RRhlg2dIihhQgZRt3DTXLLUUzIKcPgXmQBkZ4Gf=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 15:55:04.538258+00', '2026-03-07 15:55:04.538258+00', 
    0, 1,
    '[]', '[]', NULL, 'F5X41CFD'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '056f944f-5d1b-445d-ad66-9b34b7d06322', 'authenticated', 'authenticated', 'oladipupoemmanuel757@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oladipupo Emmanuel"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '056f944f-5d1b-445d-ad66-9b34b7d06322', 'oladipupoemmanuel757@gmail.com', 'Oladipupo Emmanuel', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLAnQAORpkrpnxiNNQWKUxcq8gLwHDA0_pb_wLnvvF0VzAMfA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '1X756AD5'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '067e9e48-6793-4299-9033-847755b59d70', 'authenticated', 'authenticated', 'omolaraanna@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Omolara Anna"}', '2026-03-07 12:50:26.609044+00', '2026-03-07 13:02:23.701+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '067e9e48-6793-4299-9033-847755b59d70', 'omolaraanna@gmail.com', 'Omolara Anna', 'omolaraanana', 
    'student', 'University of Ibadan ', 'https://lh3.googleusercontent.com/a/ACg8ocKbYjxD8H1ky2q1O7Rl2Cdr1OFlvzVpkXyLJ6-niq0NiqeUvSmT=s96-c', 
    'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/backgrounds/067e9e48-6793-4299-9033-847755b59d70_1772888394438.jpg', 'Project management, relationship manager ', 'Ibadan, Nigeria ', 
    NULL, '["Customer service","Project management"]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 12:50:26.609044+00', '2026-03-07 13:02:23.701+00', 
    0, 1,
    '[]', '[]', '2028', '7XX91CEE'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '071ce974-f0db-40e5-a200-0da90d19f620', 'authenticated', 'authenticated', 'abubakaryhalimat@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "halima a."}', '2026-03-14 10:51:01.726272+00', '2026-03-14 10:51:01.726272+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '071ce974-f0db-40e5-a200-0da90d19f620', 'abubakaryhalimat@gmail.com', 'halima a.', 'wardah', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocI6bqtksUSug35Y5wH-bWT9ysXQXj2KJ8-uDBCkRYvXqip5lwfR=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-14 10:51:01.726272+00', '2026-03-14 10:51:01.726272+00', 
    0, 1,
    '[]', '[]', NULL, '7D7XX56F'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'authenticated', 'authenticated', 'onyekachiikemefuna702@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Onyekachi Ikemefuna"}', '2026-02-21 11:36:56.862439+00', '2026-03-04 19:46:40.848+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '0805c7fc-0ebb-497e-8bdd-a620a7a4e750', 'onyekachiikemefuna702@gmail.com', 'Onyekachi Ikemefuna', 'onyekachiikemefuna', 
    'student', 'University of Ibadan ', 'https://lh3.googleusercontent.com/a/ACg8ocJy0GjBcxrvOp2efUAgOLxBo2neAFvs2pTwo4Ivl5J7iYgB3Os=s96-c', 
    'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/backgrounds/0805c7fc-0ebb-497e-8bdd-a620a7a4e750_1772653226769.jpg', 'Student| Educator| Lesson Designer| Fashion Designer ', 'General gas,Akubo Ibadan,Oyo state ', 
    'A lover of Christ.
passionate, optimistic, purpose driven and an upcoming fashion designer.
', '["Communication skills","Collaboration skills","Basic Research and Information literacy skills","Team work"]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, '@Blessed✨',
    115, true, false, 
    '2026-02-21 11:36:56.862439+00', '2026-03-04 19:46:40.848+00', 
    1, 1,
    '[{"id":"cert-1772653533748","title":"Basic Research and Information literacy skills ","user_id":"0805c7fc-0ebb-497e-8bdd-a620a7a4e750","issue_date":"","issuing_org":"JCIN UI "}]', '[]', '2028', '3X1DC86E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '0bc9081a-1ca6-4c01-b367-e9038122b9ae', 'authenticated', 'authenticated', 'estherosemudiame@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Osemudiame Esther"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '0bc9081a-1ca6-4c01-b367-e9038122b9ae', 'estherosemudiame@gmail.com', 'Osemudiame Esther', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIy1paQfOdYUcxnYB7QJkIWopVuo6j9V-UPRgLb7Tk6_wJalQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'BF3344X6'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '0d2191b3-01ae-4e61-8264-a4bc6f189858', 'authenticated', 'authenticated', 'preciouschime00@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Chimdindu Chime"}', '2026-03-05 17:36:10.476129+00', '2026-03-05 17:42:18.007+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '0d2191b3-01ae-4e61-8264-a4bc6f189858', 'preciouschime00@gmail.com', 'Chimdindu Chime', 'chime_anika', 
    'student', 'Enugu state university of science and technology ', 'https://lh3.googleusercontent.com/a/ACg8ocJzMiw-9xG9AATNuKPThoEFtbBIHexJKZlHvTHPlWwf6VN7qA=s96-c', 
    NULL, 'Pharmacy student ', 'Enugu, Nigeria ', 
    'I''m in my 20s
I love football, anime and films 
I''m currently learning a new language and I try to take life at a pace that suits me and not let me burn out easily ', '[]', '[]', 
    NULL, NULL, 'https://www.linkedin.com/in/chimdindu-chime-729387339?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', 
    NULL, 'https://x.com/chimdi_002?t=xKlW9l0VRhEIIss3v2w92Q&s=09', NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 17:36:10.476129+00', '2026-03-05 17:42:18.007+00', 
    0, 1,
    '[]', '[]', '2026', '5FFBB49C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '0dafb94a-ae6a-4985-945d-6b4bcdb721ae', 'authenticated', 'authenticated', 'erinoshoeniola@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Erinosho Eniola"}', '2026-03-03 11:46:38.206941+00', '2026-03-03 11:50:40.619+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '0dafb94a-ae6a-4985-945d-6b4bcdb721ae', 'erinoshoeniola@gmail.com', 'Erinosho Eniola', 'erinoshoeniola', 
    'student', 'Obafemi Awolowo University ', 'https://lh3.googleusercontent.com/a/ACg8ocLZ5cqostBIhFt5B5jgEzPFxyNuzBrONhWBRtqjKk5LcAfquQ=s96-c', 
    NULL, 'Mechanical Engineer', 'Osun, Nigeria ', 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-03 11:46:38.206941+00', '2026-03-03 11:50:40.619+00', 
    0, 1,
    '[]', '[]', '2030', '4X26E2B4'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', 'authenticated', 'authenticated', 'shankarustaz11@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Shankar"}', '2026-03-06 20:38:52.850319+00', '2026-03-06 20:38:52.850319+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', 'shankarustaz11@gmail.com', 'Shankar', 'bakoji_jr', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocK17jVZUARpE1uNclCHzWWQDiTLRHTEKqEg_thu6GuBAGgHjA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    16, false, false, 
    '2026-03-06 20:38:52.850319+00', '2026-03-06 20:38:52.850319+00', 
    0, 1,
    '[]', '[]', NULL, '7X9631AC'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '11ee4c78-396c-45d1-bb70-56ddea408bdf', 'authenticated', 'authenticated', 'ifecodblissedboy@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Emmanuel Ukpabi"}', '2026-03-05 17:48:21.183217+00', '2026-03-30 00:41:28.789+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '11ee4c78-396c-45d1-bb70-56ddea408bdf', 'ifecodblissedboy@gmail.com', 'Emmanuel Ukpabi', 'ifecodblissed', 
    'student', 'MOUAU', 'https://lh3.googleusercontent.com/a/ACg8ocK5MGJh2PlG9q50iZWUFoS210Fbaqb5wLuLf7QJGRs_AFHti210=s96-c', 
    'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/backgrounds/11ee4c78-396c-45d1-bb70-56ddea408bdf_1774831126050.jpg', NULL, 'Umuahia, Abia State', 
    NULL, '[]', '[]', 
    NULL, 'ifecodblissedboy', 'ifecodblissedboy', 
    'ifecodblissedboy', 'ifecodblissed ', 'ifeanyichukwu Emmanuel UKPABI ',
    NULL, NULL, NULL,
    15, false, false, 
    '2026-03-05 17:48:21.183217+00', '2026-03-30 00:41:28.789+00', 
    0, 1,
    '[]', '[]', '2027', '9XBC4X12'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '121a4f57-2fa4-4e45-aa3d-30904fd4b91d', 'authenticated', 'authenticated', 'seunakano08@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oluwaseun Akano"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '121a4f57-2fa4-4e45-aa3d-30904fd4b91d', 'seunakano08@gmail.com', 'Oluwaseun Akano', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKtADtotF6TB9ke74x6XckW3-1P0FHImXh-UkkcwKyFTo1nSA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '279BXXAX'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '12804787-3749-4c69-bd0b-a0cb29a201c5', 'authenticated', 'authenticated', 'charles.haywhykay@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Kelvin Charles"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '12804787-3749-4c69-bd0b-a0cb29a201c5', 'charles.haywhykay@gmail.com', 'Kelvin Charles', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ_qkUERNk34LqzV2blfPpc9k0sdA_GH3jeVMyutUAbolcE3tBQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '187F4A33'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '16d6b1bb-fc92-444c-8e14-08b4d0de70a7', 'authenticated', 'authenticated', 'alawal256847@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Abdullah Lawal"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '16d6b1bb-fc92-444c-8e14-08b4d0de70a7', 'alawal256847@stu.ui.edu.ng', 'Abdullah Lawal', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocK7hRjqI0_BVyijXzLTwrtLtGUQ4ODNTLhLm0Vg3ibJ81A0Qw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '94785C6F'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '17832d0b-944d-4117-8703-422429b4f399', 'authenticated', 'authenticated', 'jonahfavour885@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Jonah Favour"}', '2026-03-12 19:53:36.140095+00', '2026-03-12 19:53:36.140095+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '17832d0b-944d-4117-8703-422429b4f399', 'jonahfavour885@gmail.com', 'Jonah Favour', 'jonah', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJJ4bm_vkRTK7sM5utS_8-OFeN66lK45p9q3X-ND0bBvbCFMG0=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-12 19:53:36.140095+00', '2026-03-12 19:53:36.140095+00', 
    0, 1,
    '[]', '[]', NULL, '39D2235F'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '17964883-9348-4f57-ab1c-e51ce2531914', 'authenticated', 'authenticated', 'nemeremchy6@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Chi Nemerem"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '17964883-9348-4f57-ab1c-e51ce2531914', 'nemeremchy6@gmail.com', 'Chi Nemerem', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLhPIm9Qi-Nw43JAjVML2skYca1zUpUQn00GvNQGsqJ-C2D2w=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '69D8CEX1'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '17d1a1b9-05d7-4b05-bdd1-e4d09dd40b8e', 'authenticated', 'authenticated', 'olakanyeprecious2@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Olakanye Precious"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '17d1a1b9-05d7-4b05-bdd1-e4d09dd40b8e', 'olakanyeprecious2@gmail.com', 'Olakanye Precious', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJWfYmPtMJ4dXno_o1nzV6IFoEDl7gGjLrK1dyvpUoxuAYWEA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '3B82ABAD'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '17e6a244-29dd-4a76-b202-f41cdcd6b3b1', 'authenticated', 'authenticated', 'adedayoobaloluwa910@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Obaloluwa Adedayo"}', '2026-03-05 16:54:10.382013+00', '2026-03-05 17:13:57.404+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '17e6a244-29dd-4a76-b202-f41cdcd6b3b1', 'adedayoobaloluwa910@gmail.com', 'Obaloluwa Adedayo', 'gabriel', 
    'student', 'Obafemi Awolowo University ', 'https://lh3.googleusercontent.com/a/ACg8ocIU_YAvHkq_KJan-fjpaK81LXg6qlEKMl3hJxUltU4KMcgmGw=s96-c', 
    NULL, 'AI Content and Video Creation ', 'Oyo, Nigeria ', 
    NULL, '[]', '[]', 
    NULL, NULL, 'https://www.linkedin.com/in/obaloluwa-adedayo-7b762a3a6?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    15, false, false, 
    '2026-03-05 16:54:10.382013+00', '2026-03-05 17:13:57.404+00', 
    0, 1,
    '[]', '[]', NULL, 'F74F22FD'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '1b6028af-3509-46b4-9100-e30063e4a637', 'authenticated', 'authenticated', 'joanayuba2018@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Joan ayuba"}', '2026-03-06 15:39:18.01571+00', '2026-03-06 15:39:18.01571+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '1b6028af-3509-46b4-9100-e30063e4a637', 'joanayuba2018@gmail.com', 'Joan ayuba', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIf9_1m68Mj7BxXFi6FoJ2r272Rudbe_w5BO6-WmONxnockahi_=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-06 15:39:18.01571+00', '2026-03-06 15:39:18.01571+00', 
    0, 1,
    '[]', '[]', NULL, 'CC3A9D38'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '1c223def-e8c9-4689-90d8-c4d217303b2f', 'authenticated', 'authenticated', 'afolabitoluwani23@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Toluwani Afolabi"}', '2026-03-07 15:46:26.728776+00', '2026-03-07 15:46:26.728776+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '1c223def-e8c9-4689-90d8-c4d217303b2f', 'afolabitoluwani23@gmail.com', 'Toluwani Afolabi', 'toluwani', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ5Ms0QEaBKmqCw2ri7oBeP2TwlxJwKdmg0YC1vWMfqQ-pdBA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 15:46:26.728776+00', '2026-03-07 15:46:26.728776+00', 
    0, 1,
    '[]', '[]', NULL, '53BA5X5A'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '1d2be3ee-c1f3-4504-a1b3-8a22df7fb4e2', 'authenticated', 'authenticated', 'isiborjoshua507@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Joshua Isibor"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '1d2be3ee-c1f3-4504-a1b3-8a22df7fb4e2', 'isiborjoshua507@gmail.com', 'Joshua Isibor', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJJI1Ggw5tAtgUO36BC-5ZjZ9aXVKPiS6SZFtiVViAmJvN9RZ-X=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '6EC19863'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '1d6620c2-9dd2-4e99-b5e2-f58255b92486', 'authenticated', 'authenticated', 'alexayomide304@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Alex Ayomide"}', '2026-03-21 16:08:50.409445+00', '2026-03-21 16:08:50.409445+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '1d6620c2-9dd2-4e99-b5e2-f58255b92486', 'alexayomide304@gmail.com', 'Alex Ayomide', 'alex', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKHDyaT8WOae_-8QXLa_R_vHinavVsti7I6GXyBc5XzjkFaXw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-21 16:08:50.409445+00', '2026-03-21 16:08:50.409445+00', 
    0, 1,
    '[]', '[]', NULL, 'F49X3D4B'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', 'authenticated', 'authenticated', 'oduolatomiwa4@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oduola Tomiwa"}', '2026-03-07 16:00:43.661998+00', '2026-03-07 16:12:32.996+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '1eee80b5-0fbb-4468-ad42-5e38942b8c3d', 'oduolatomiwa4@gmail.com', 'Oduola Tomiwa', 'tomsteve', 
    'student', 'University of Ibadan ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/1eee80b5-0fbb-4468-ad42-5e38942b8c3d/avatar_1772899754014.jpg', 
    NULL, NULL, 'Ibadan Nigeria ', 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 16:00:43.661998+00', '2026-03-07 16:12:32.996+00', 
    0, 2,
    '[]', '[]', NULL, '51796633'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '1f21b83e-834b-459b-972b-1339c430f394', 'authenticated', 'authenticated', 'royallove1214@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Royal Love"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '1f21b83e-834b-459b-972b-1339c430f394', 'royallove1214@gmail.com', 'Royal Love', 'royallove', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIFxk_uqwaqPnkBzGDYNGLMO1xAeKKVP4QrzzIhfTpHH35dtQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'D8DB78DX'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '1fdb1e97-1e7b-4cc0-a321-52a884882c14', 'authenticated', 'authenticated', 'bioweb000@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Zero Scam Nigeria "}', '2026-02-23 08:31:33.378723+00', '2026-03-04 11:18:35.049+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '1fdb1e97-1e7b-4cc0-a321-52a884882c14', 'bioweb000@gmail.com', 'Zero Scam Nigeria ', 'zsng', 
    'student', NULL, 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/1fdb1e97-1e7b-4cc0-a321-52a884882c14/avatar_1772623105620.jpg', 
    'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/backgrounds/1fdb1e97-1e7b-4cc0-a321-52a884882c14_1772622827026.jpg', 'Bringing a halt to Fraud in Nigeria', 'Ibadan, Nigeria', 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    40, false, false, 
    '2026-02-23 08:31:33.378723+00', '2026-03-04 11:18:35.049+00', 
    0, 1,
    '[]', '[]', NULL, 'D4FD4BD7'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '217f054a-0234-42c0-85a5-804844487ba8', 'authenticated', 'authenticated', 'oluwadamisiakinjole@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Akinjole Jesutofunmi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '217f054a-0234-42c0-85a5-804844487ba8', 'oluwadamisiakinjole@gmail.com', 'Akinjole Jesutofunmi', NULL, 
    'student', NULL, 'https://ui-avatars.com/api/?name=Akinjole%20Jesutofunmi%20&background=10b981&color=fff', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '5113XD32'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '21ade790-1423-484e-ace4-3a2cbcb032a4', 'authenticated', 'authenticated', 'oshiboteamirah@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Amirah Oshibote"}', '2026-03-07 13:04:31.768804+00', '2026-03-07 13:04:31.768804+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '21ade790-1423-484e-ace4-3a2cbcb032a4', 'oshiboteamirah@gmail.com', 'Amirah Oshibote', 'oshiboteamirah', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIH41ljs4ULfvC4dPo5Y6VQiZsLi0tClAQQxDmy2-KvKQpgZQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:04:31.768804+00', '2026-03-07 13:04:31.768804+00', 
    0, 1,
    '[]', '[]', NULL, '959B8EC4'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '2248fc95-8840-4f5c-9824-327bfbc65c70', 'authenticated', 'authenticated', 'olamau3@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Deji Olama"}', '2026-03-06 11:24:38.163618+00', '2026-03-06 11:24:38.163618+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '2248fc95-8840-4f5c-9824-327bfbc65c70', 'olamau3@gmail.com', 'Deji Olama', 'proscore', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIzU1t3vkby1tHyB5G7IswQFNcV_Uhr1ggLQfvwh1-huz1S5Q=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-06 11:24:38.163618+00', '2026-03-06 11:24:38.163618+00', 
    0, 1,
    '[]', '[]', NULL, '55C246C6'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '23578d06-87fe-4e9e-8ebe-7fb30c568714', 'authenticated', 'authenticated', 'adtheeconomist@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "AD"}', '2026-03-24 13:29:35.305584+00', '2026-03-24 13:29:35.305584+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '23578d06-87fe-4e9e-8ebe-7fb30c568714', 'adtheeconomist@gmail.com', 'AD', 'advisuals', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIqB7wXD7xpaCEh3QMLjxXgqfUyNguxsSk2D-BKaJICcYkdmfU=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-24 13:29:35.305584+00', '2026-03-24 13:29:35.305584+00', 
    0, 1,
    '[]', '[]', NULL, '3XAB2F1X'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '239723ff-6fef-4a15-9a5d-265d979489b7', 'authenticated', 'authenticated', 'vikfridge@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Vik Fridge"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '239723ff-6fef-4a15-9a5d-265d979489b7', 'vikfridge@gmail.com', 'Vik Fridge', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocILQq777PPeG7wrbNLDtzNmnvXrZQbYrDtFB6ZjElz6Ni12Zg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '24DB1D32'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '24915d8e-82a1-4fb8-b1be-2fbe03d99794', 'authenticated', 'authenticated', 'sadiqabdullahi7068@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Sadiq Abdullahi"}', '2026-03-05 17:43:32.205837+00', '2026-03-05 17:43:32.205837+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '24915d8e-82a1-4fb8-b1be-2fbe03d99794', 'sadiqabdullahi7068@gmail.com', 'Sadiq Abdullahi', 'dm_sadeeq', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKjUXLXyA_aPPJrd6EyPfaaKF2Ck1HOCzeA6L814987GDk1=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    5, false, false, 
    '2026-03-05 17:43:32.205837+00', '2026-03-05 17:43:32.205837+00', 
    0, 1,
    '[]', '[]', NULL, 'B58F797A'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '24d05ced-a2f9-4dca-922d-d93cd8ad8fb0', 'authenticated', 'authenticated', 'faithajewole89@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Faith Ajewole"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '24d05ced-a2f9-4dca-922d-d93cd8ad8fb0', 'faithajewole89@gmail.com', 'Faith Ajewole', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLeugV36EhRONJofv2bPVG-Zyt6ScIBh6grzpLDpcyKlf22YQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'B287CA1A'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '24da4c08-ddc1-43cf-a5f1-c08c83dcc6d9', 'authenticated', 'authenticated', 'princessodun13@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "IBIROGBA ADEOLA"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '24da4c08-ddc1-43cf-a5f1-c08c83dcc6d9', 'princessodun13@gmail.com', 'IBIROGBA ADEOLA', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKMXshMKf6rI9hqTW11X_hJ5KOMEGxjprMuQtOt0olVizHctA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'A7XX1FCE'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '25b37200-c56c-42f6-8ef4-ede4a2769c3a', 'authenticated', 'authenticated', 'sinmiololade@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Sinmi Ololade"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '25b37200-c56c-42f6-8ef4-ede4a2769c3a', 'sinmiololade@gmail.com', 'Sinmi Ololade', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKabgI-C-wi7nOwcUXm8QsbbpwmFZEJlU4SGvcWN5pSySlNaQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'B9XA6811'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '26f5e6fe-7fd2-4257-99ea-533946b936fc', 'authenticated', 'authenticated', 'oreoluwaemmanuel579@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Idowu Olamide Yinusa (Maverick)"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '26f5e6fe-7fd2-4257-99ea-533946b936fc', 'oreoluwaemmanuel579@gmail.com', 'Idowu Olamide Yinusa (Maverick)', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKfsJiMf6a8cgzT-YI2Rcd7VXYXyGUZ31iVP6ehVRxZwwqm2i94=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '83X46FAF'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '27d1ad60-6d73-439d-b4b2-4a1827371c24', 'authenticated', 'authenticated', 'quakestartup@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Daniel Oyasor"}', '2026-02-17 19:17:36.393374+00', '2026-02-21 11:29:54.259668+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '27d1ad60-6d73-439d-b4b2-4a1827371c24', 'quakestartup@gmail.com', 'Daniel Oyasor', 'quakeng', 
    'student', 'University of Ibadan', 'https://lh3.googleusercontent.com/a/ACg8ocJOJH0odrPGRXdCAyy4chb0FqufbaAznBFWBVs-VO497sy7CQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    144, false, false, 
    '2026-02-17 19:17:36.393374+00', '2026-02-21 11:29:54.259668+00', 
    1, 1,
    '[]', '[]', NULL, '4D27D46F'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '2a18d81d-5a5b-47ee-b877-b351cc0c9e1b', 'authenticated', 'authenticated', 'kolapokabirat19@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Kabirat Kolapo"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '2a18d81d-5a5b-47ee-b877-b351cc0c9e1b', 'kolapokabirat19@gmail.com', 'Kabirat Kolapo', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIWMpSYn3B0D1XropSgrrhk5JLCVRsjeqAllcoMNt-8IldD4wS3=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '46A3AX94'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '2a9748d3-0e5a-4b3a-a937-9164432d4564', 'authenticated', 'authenticated', 'egbunadeborah4@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Egbuna Deborah"}', '2026-03-07 13:51:26.383527+00', '2026-03-07 13:51:26.383527+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '2a9748d3-0e5a-4b3a-a937-9164432d4564', 'egbunadeborah4@gmail.com', 'Egbuna Deborah', 'egbunadea', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ59ZHFF1BOcl9XxvEqEXACD8AM76RS-Aicufs0NNS6SPZNyg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:51:26.383527+00', '2026-03-07 13:51:26.383527+00', 
    0, 1,
    '[]', '[]', NULL, 'BCB253DA'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '2af2a93d-fcd7-4f62-8447-2f37948715ba', 'authenticated', 'authenticated', 'enokeladaniel92@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Enokela Daniel Fed-ojo"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '2af2a93d-fcd7-4f62-8447-2f37948715ba', 'enokeladaniel92@gmail.com', 'Enokela Daniel Fed-ojo', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ1OYQcP1v1ZH_1i60o2yB135WlFQ4stwvF3GH7-hLkzHpraAsP=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'A69A82EB'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '2b3af27c-8395-4da3-8f28-ca3b0ee2b5be', 'authenticated', 'authenticated', 'godo41004@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Mario"}', '2026-03-07 15:44:46.017863+00', '2026-03-07 15:44:46.017863+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '2b3af27c-8395-4da3-8f28-ca3b0ee2b5be', 'godo41004@gmail.com', 'Mario', 'king', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKJ9P8NxTNLRgDHqJQB2rdtdGCIqa66bYvA8wSkhHcg3lYyJg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 15:44:46.017863+00', '2026-03-07 15:44:46.017863+00', 
    0, 1,
    '[]', '[]', NULL, '77A56X5D'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '2beaf604-2cac-4600-a7a8-5777402071c7', 'authenticated', 'authenticated', 'obiomawise00@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Wisdom Obioma"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '2beaf604-2cac-4600-a7a8-5777402071c7', 'obiomawise00@gmail.com', 'Wisdom Obioma', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLW0df37I_fUhkSlW450L1xcXN8FLeIoHtt5my17iPIj8JL6g=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '4AD7XE64'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '2bfa7be2-faa2-493d-ac48-2321c0a2c4be', 'authenticated', 'authenticated', 'oluwaferanmisamuel794@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oluwaferanmi"}', '2026-03-21 11:39:49.111365+00', '2026-03-21 11:39:49.111365+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '2bfa7be2-faa2-493d-ac48-2321c0a2c4be', 'oluwaferanmisamuel794@gmail.com', 'Oluwaferanmi', 'femzy04', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKw-6AqhLycHlvhokot0WHKYJoKThp0amTkJnfFYVmKnjPWCA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-21 11:39:49.111365+00', '2026-03-21 11:39:49.111365+00', 
    0, 1,
    '[]', '[]', NULL, '58737936'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '2d78ce20-3c4f-49a8-9a32-fb12a9fa21c6', 'authenticated', 'authenticated', 'eadenibuyan244286@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Eniayo Adenibuyan"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '2d78ce20-3c4f-49a8-9a32-fb12a9fa21c6', 'eadenibuyan244286@stu.ui.edu.ng', 'Eniayo Adenibuyan', 'eniayo', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKvJ6ka0Th8MphjAEvUXBBAX_wDiJ6ENIaIKsk6on_t_7B0xQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'CD7871X4'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '2f5f9545-ee9c-41f6-9699-4b5ea8bc0d06', 'authenticated', 'authenticated', 'hmuraino242182@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Haleemah Muraino"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '2f5f9545-ee9c-41f6-9699-4b5ea8bc0d06', 'hmuraino242182@stu.ui.edu.ng', 'Haleemah Muraino', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLdFYj8mW7XP4gRJrC1-X3ZLSlOJkJbX7yyd1XYcGo84Njg8A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'F63XE8A9'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '2fd397a6-c090-4664-bac5-832d803c6c56', 'authenticated', 'authenticated', 'dicksonsaviour2@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Dickson Saviour"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '2fd397a6-c090-4664-bac5-832d803c6c56', 'dicksonsaviour2@gmail.com', 'Dickson Saviour', NULL, 
    'student', NULL, 'https://ui-avatars.com/api/?name=Dickson%20Saviour%20&background=10b981&color=fff', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '39A791BE'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '30c368fe-2afe-480b-92ef-072b06c5bfb8', 'authenticated', 'authenticated', 'gbadamosikarimot559@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Gbadamosi Karimot"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '30c368fe-2afe-480b-92ef-072b06c5bfb8', 'gbadamosikarimot559@gmail.com', 'Gbadamosi Karimot', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKvWl1D5_b97oiwSqdDsGnTy8n-JTe4XuWIL4qwUWF7JAO5nQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'AD5EC15B'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '313d0787-3a7a-49bd-9ebf-de3f5dab1fdf', 'authenticated', 'authenticated', 'kuyenife@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Kuye \u201cNifemi\u201d"}', '2026-03-21 14:58:36.836794+00', '2026-03-21 14:58:36.836794+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '313d0787-3a7a-49bd-9ebf-de3f5dab1fdf', 'kuyenife@gmail.com', 'Kuye “Nifemi”', 'k_on', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJvOsPZeP7OufUVnp8aCnzpX-uFY5VhmuQKkM1WaV7S_WmoQA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-21 14:58:36.836794+00', '2026-03-21 14:58:36.836794+00', 
    0, 1,
    '[]', '[]', NULL, 'B9D75218'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '3245b46d-69d5-46a4-ae78-cbce987e9a0a', 'authenticated', 'authenticated', 'akinsolaayomide67@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ayomide Akinsola"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '3245b46d-69d5-46a4-ae78-cbce987e9a0a', 'akinsolaayomide67@gmail.com', 'Ayomide Akinsola', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLTVcyMlcil10eJIlOqyLwaXMumobtH16Ck3qyhRJmavx19Vg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '828B6791'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '32f1614d-21de-48d8-83e4-ffc8c797f090', 'authenticated', 'authenticated', 'oguntoyinboesther3@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Esther Eniola Oguntoyinbo"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '32f1614d-21de-48d8-83e4-ffc8c797f090', 'oguntoyinboesther3@gmail.com', 'Esther Eniola Oguntoyinbo', NULL, 
    'student', NULL, 'https://ui-avatars.com/api/?name=Esther%20Eniola%20Oguntoyinbo%20&background=10b981&color=fff', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'XC89XB62'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '330bb039-5f2d-4f2a-a6db-de03b8960316', 'authenticated', 'authenticated', 'rodneyafuga62@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Rodney Afuga"}', '2026-03-05 22:05:25.90001+00', '2026-03-05 22:05:25.90001+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '330bb039-5f2d-4f2a-a6db-de03b8960316', 'rodneyafuga62@gmail.com', 'Rodney Afuga', 'sanguine', 
    'student', NULL, NULL, 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 22:05:25.90001+00', '2026-03-05 22:05:25.90001+00', 
    0, 1,
    '[]', '[]', NULL, '1XE9AAD9'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '33c75afb-3e5a-4171-83de-8f915691c513', 'authenticated', 'authenticated', 'oyasormichael187@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Hero \ud83e\uddb8"}', '2026-03-01 12:21:23.713044+00', '2026-03-03 14:23:57.004+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '33c75afb-3e5a-4171-83de-8f915691c513', 'oyasormichael187@gmail.com', 'Hero 🦸', 'icecream', 
    'student', 'Obafemi Awolowo University ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/33c75afb-3e5a-4171-83de-8f915691c513/avatar_1772546590594.jpg', 
    'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/backgrounds/33c75afb-3e5a-4171-83de-8f915691c513_1772546476068.jpg', 'Mechanical Engineer | ', 'Ife, Nigeria', 
    '...they shall be known as Ice cream 🍦', '["3d animation","3d modelling","Cinematography","Writing and storytelling","Product design and animation","Game dev","Architecture"]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    143, false, false, 
    '2026-03-01 12:21:23.713044+00', '2026-03-03 14:23:57.004+00', 
    0, 1,
    '[]', '[]', '2029', '688F5A8B'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '34237e35-cfff-4234-8d4f-8c5ecd52976c', 'authenticated', 'authenticated', 'iniderin602@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Derin Ini"}', '2026-03-13 18:57:17.255357+00', '2026-03-13 18:57:17.255357+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '34237e35-cfff-4234-8d4f-8c5ecd52976c', 'iniderin602@gmail.com', 'Derin Ini', 'derin', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKhGoJ0de9UOuRlxFXENLhjS_w7jXVT1YHpGnkshp6y8HLZ3A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-13 18:57:17.255357+00', '2026-03-13 18:57:17.255357+00', 
    0, 1,
    '[]', '[]', NULL, '19459A9B'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '3479d8c9-8d5d-43db-a8c1-bbbfd2e70bac', 'authenticated', 'authenticated', 'emmaagboola43@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "emmanuel"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '3479d8c9-8d5d-43db-a8c1-bbbfd2e70bac', 'emmaagboola43@gmail.com', 'emmanuel', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKXa8j8uI9_7Icp5KSU_p1hNfafwiIH2vPcjxV3zIJKVV4ujw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '94AA897X'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '363ab36c-1544-45c7-8fa1-6298c8ad85c6', 'authenticated', 'authenticated', 'farukishola45@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ibrahim Faruk Ishola"}', '2026-03-07 07:33:25.370734+00', '2026-03-07 07:40:50.066+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '363ab36c-1544-45c7-8fa1-6298c8ad85c6', 'farukishola45@gmail.com', 'Ibrahim Faruk Ishola', 'freemanlay', 
    'student', 'University of Ibadan ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/363ab36c-1544-45c7-8fa1-6298c8ad85c6/avatar_1772868980481.jpg', 
    'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/backgrounds/363ab36c-1544-45c7-8fa1-6298c8ad85c6_1772869231168.jpg', 'Real estate/ web3', 'Oyo state Nigeria ', 
    'I''m after only those who look after me ', '["Space hoste","Project marketing","Song writer and singer"]', '[]', 
    NULL, NULL, NULL, 
    NULL, 'freemanlay39704', NULL,
    NULL, NULL, NULL,
    12, false, false, 
    '2026-03-07 07:33:25.370734+00', '2026-03-07 07:40:50.066+00', 
    0, 1,
    '[]', '[]', '2027', 'C54522CA'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '36bfde0b-6708-4d28-83db-4e7583ddf402', 'authenticated', 'authenticated', 'estydux2222@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Esther"}', '2026-03-05 17:32:03.225826+00', '2026-03-05 17:32:03.225826+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '36bfde0b-6708-4d28-83db-4e7583ddf402', 'estydux2222@gmail.com', 'Esther', 'esther', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKPxqn0B7ZGf00ebl2BX-vPtOgMjiYNpDaqwQC4HZBjitmr4jg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 17:32:03.225826+00', '2026-03-05 17:32:03.225826+00', 
    0, 1,
    '[]', '[]', NULL, '746366F8'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '39f77901-3d9d-4be3-b780-a696cf90261f', 'authenticated', 'authenticated', 'olokodeolasile@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Olokode Olasile"}', '2026-03-07 13:05:22.807775+00', '2026-03-07 13:10:03.215+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '39f77901-3d9d-4be3-b780-a696cf90261f', 'olokodeolasile@gmail.com', 'Olokode Olasile', 'olastar', 
    'student', 'University of Ibadan', 'https://lh3.googleusercontent.com/a/ACg8ocLZKO5i5tuYhm859xErUm8qBKp2PZ0dmUqkZgnV7d8AqCusjw=s96-c', 
    NULL, 'Ola star', 'Oyo', 
    'Good person', '[]', '[]', 
    NULL, NULL, NULL, 
    'olastar', NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:05:22.807775+00', '2026-03-07 13:10:03.215+00', 
    0, 1,
    '[]', '[]', '2027', '6FAE2B92'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '3a35ef2a-b0c2-43d3-a2d8-44d334ed9c27', 'authenticated', 'authenticated', 'inioluwaaaasotunde@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Inioluwa Sotunde"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '3a35ef2a-b0c2-43d3-a2d8-44d334ed9c27', 'inioluwaaaasotunde@gmail.com', 'Inioluwa Sotunde', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKy2j1DGVO9nYfilTWkg5g2DwKV498fi1dGo__Ljp60XNtBnw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '37B4BCF3'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '3aaa2a20-4c4c-482a-9e6b-50fe581897cf', 'authenticated', 'authenticated', 'obiyeror@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ann Oyasor"}', '2026-02-28 11:00:07.080838+00', '2026-02-28 11:00:07.080838+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '3aaa2a20-4c4c-482a-9e6b-50fe581897cf', 'obiyeror@gmail.com', 'Ann Oyasor', 'anny', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKSfQ4aZTtnv4YmVSh_eFGLoywLQeBZ5iG3xqo_ZwkgSDanGg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    40, false, false, 
    '2026-02-28 11:00:07.080838+00', '2026-02-28 11:00:07.080838+00', 
    0, 1,
    '[]', '[]', NULL, '972B48A2'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '3ac6154a-3b36-4975-9cc3-aa81032e1ac4', 'authenticated', 'authenticated', 'alexshopifycomdesigns@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Alex Ayomide"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '3ac6154a-3b36-4975-9cc3-aa81032e1ac4', 'alexshopifycomdesigns@gmail.com', 'Alex Ayomide', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocK4K06gkCfv2BDV8m5uXUdGVYWTagVV4TKI_oMkuweNifqycQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '3B75AB83'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '3bd69460-04a6-4445-bd49-eb809395aed1', 'authenticated', 'authenticated', 'adetolaadeyinka2@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adetola Adeyinka"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '3bd69460-04a6-4445-bd49-eb809395aed1', 'adetolaadeyinka2@gmail.com', 'Adetola Adeyinka', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKtkymI2w2wcvDHuWrvjG5_aPW9OCe589JDqAJ1CCOEiM24NA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '6164A398'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '3cc72679-da7c-48a8-a731-e373d6277e34', 'authenticated', 'authenticated', 'charityeruaga@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Eruaga Charity"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '3cc72679-da7c-48a8-a731-e373d6277e34', 'charityeruaga@gmail.com', 'Eruaga Charity', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKEzyE-QQVGaJx0oyBd4fG47FScoz7mTopf6l6bNw-_buL9QYzC=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '1EEFX29X'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '3dd8711c-963a-4093-b478-f62bce8f070a', 'authenticated', 'authenticated', 'careerup52@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "User "}', '2026-02-23 09:10:18.707858+00', '2026-02-26 10:12:17.441+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '3dd8711c-963a-4093-b478-f62bce8f070a', 'careerup52@gmail.com', 'User ', 'danieloyasor', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLtUrmCmUsW_XjFPdjC5IaAC5UrTgMAaLB-9G-Fv_IQ6BxJCA=s96-c', 
    NULL, NULL, NULL, 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-23 09:10:18.707858+00', '2026-02-26 10:12:17.441+00', 
    0, 1,
    '[]', '[]', NULL, '756C8325'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '3debf670-e473-43ec-a6d3-c640a5989ac9', 'authenticated', 'authenticated', 'mikaymedia1@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oluwaseun Akinwande"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '3debf670-e473-43ec-a6d3-c640a5989ac9', 'mikaymedia1@gmail.com', 'Oluwaseun Akinwande', 'mikay', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLPFnRyC-6ba-BumD6PfOujpYYRjV0MGxG659ulxBPLc8MD4Og=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '2FDABEAA'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '40a90976-e512-488c-8c44-f1be10cc23a9', 'authenticated', 'authenticated', 'ogunkunleabisola09@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Glory Ogunkunle"}', '2026-03-07 13:48:15.289981+00', '2026-03-07 13:48:15.289981+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '40a90976-e512-488c-8c44-f1be10cc23a9', 'ogunkunleabisola09@gmail.com', 'Glory Ogunkunle', 'abby', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLTbPOVdrvBfNKyhqlZ9QD9XCxS3Nj7ud9tQV3otd0Cr8IqCg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:48:15.289981+00', '2026-03-07 13:48:15.289981+00', 
    0, 1,
    '[]', '[]', NULL, '76CA8F68'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '440acc35-4fa7-4368-aebd-94cc272b3916', 'authenticated', 'authenticated', 'mercyoloniluyi9@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oloniluyi Mercy"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '440acc35-4fa7-4368-aebd-94cc272b3916', 'mercyoloniluyi9@gmail.com', 'Oloniluyi Mercy', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIYSzXqVU08hFa2HVDypT02k8w5RNhl-nC34CjwSw8p4TUf7w=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '23A44FA2'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '453fa778-b1c7-4bab-b408-7e92fc28e009', 'authenticated', 'authenticated', 'quantumprso@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oyasor Priscillia"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '453fa778-b1c7-4bab-b408-7e92fc28e009', 'quantumprso@gmail.com', 'Oyasor Priscillia', 'hhhh', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJYwD0WXaX9joAT7EUfnQvRtq7od-rIrA0TfSJwEe2jxR39UII=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    60, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'D2522C6X'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '45ce957a-1b45-4f30-8300-759add328d46', 'authenticated', 'authenticated', 'eniayoadenibuyan@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Eniayo Adenibuyan"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '45ce957a-1b45-4f30-8300-759add328d46', 'eniayoadenibuyan@gmail.com', 'Eniayo Adenibuyan', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJFaac0gQEhxvCjqXTDkVuLGnZ4xy0H0bqllPyCt4CpcXcjhlc=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'XD199A4C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '45f5f915-3489-4a65-ae1c-d244a47e28d4', 'authenticated', 'authenticated', 'abdulazeemajala@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Abdulazeem Ajala"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '45f5f915-3489-4a65-ae1c-d244a47e28d4', 'abdulazeemajala@gmail.com', 'Abdulazeem Ajala', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocL1THkkF_zcPry2dKeJRNSuVy2FoGlc8abcVZt2cC_JcihdiQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'AD6A5C92'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', 'authenticated', 'authenticated', 'emmanuelmorakinyoofficial@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Emmanuel Morakinyo"}', '2026-03-14 11:01:46.364187+00', '2026-03-25 18:39:50.841889+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', 'emmanuelmorakinyoofficial@gmail.com', 'Emmanuel Morakinyo', 'morak', 
    'student', 'Ladoke Akintola University (LAUTECH) ', 'https://lh3.googleusercontent.com/a/ACg8ocIzgLkGNNawF2vHR00jBXfIGqYh6hTwkLy5nykELlAVqx1FeIQm=s96-c', 
    NULL, 'Graphic Designer || Video Editor || Brand Strategist ', 'Ibadan Nigeria ', 
    'Lover Of  God 
Highly Effective Folk⚡
Graphic Designer ||Video Editor || Brand Strategist
', '["Graphic design","Video Editing","Brand Strategist","Logo Design"]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, 'https://wa.me/message/R3HSAACOD73XG1',
    150, true, false, 
    '2026-03-14 11:01:46.364187+00', '2026-03-25 18:39:50.841889+00', 
    0, 3,
    '[]', '[]', NULL, '77AF5XF4'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '49165160-e2ef-4196-803c-bb3ff446d933', 'authenticated', 'authenticated', 's.capogna@unilink.it', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Capogna Stefania"}', '2026-03-05 18:54:17.091278+00', '2026-03-05 18:54:17.091278+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '49165160-e2ef-4196-803c-bb3ff446d933', 's.capogna@unilink.it', 'Capogna Stefania', 'ste', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJapAAh21dTU2ar0YHeyxaRkiY__Hyw3MBq6wV_BgM7XKk8AQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 18:54:17.091278+00', '2026-03-05 18:54:17.091278+00', 
    0, 1,
    '[]', '[]', NULL, 'E5EAB937'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '4a6f5aab-b92f-4221-8fc2-e7bd64ce9604', 'authenticated', 'authenticated', 'jayjayhanidu@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Jubril Hanidu"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '4a6f5aab-b92f-4221-8fc2-e7bd64ce9604', 'jayjayhanidu@gmail.com', 'Jubril Hanidu', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKOABl_bPcIASA5l_x6EOykaoTDIo2yCU6aO2zCvZyBMY2Wig=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'D1AF4292'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '4be8e443-dc05-4790-b12d-adc4d2a6fa9d', 'authenticated', 'authenticated', 'sey@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Seye"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '4be8e443-dc05-4790-b12d-adc4d2a6fa9d', 'sey@gmail.com', 'Seye', NULL, 
    'student', NULL, 'https://ui-avatars.com/api/?name=Seye&background=10b981&color=fff', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    30, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'C13B9911'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '4e61d28e-76f7-418b-8a69-281a3652ee23', 'authenticated', 'authenticated', 'onojamargaret364@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Onoja Margaret"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '4e61d28e-76f7-418b-8a69-281a3652ee23', 'onojamargaret364@gmail.com', 'Onoja Margaret', 'maggi', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKGsknJoBaWItp4Vsz0xlkUsfYHep_D_wnIUi2roJtp8HB60Q=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    35, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '35E91981'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '4ecb4275-43b0-484a-b716-2484dfd02628', 'authenticated', 'authenticated', 'emmanueleyitayo26@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Emmanuel Eyitayo"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '4ecb4275-43b0-484a-b716-2484dfd02628', 'emmanueleyitayo26@gmail.com', 'Emmanuel Eyitayo', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIZdT5152YtabEStgav7Bs3oyQmE1FYTjIyJQCPCe82d5dSyw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'DCD8EX5F'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '4f7826bf-9a4e-4367-bc94-ceb7b322a611', 'authenticated', 'authenticated', 'adesuyiadekunle2006@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adekunle Adesuyi"}', '2026-03-16 13:45:51.393098+00', '2026-03-16 13:45:51.393098+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '4f7826bf-9a4e-4367-bc94-ceb7b322a611', 'adesuyiadekunle2006@gmail.com', 'Adekunle Adesuyi', 'favour_sonofgrace', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJjWH6tfh-Uwen8jx6WaJq3ykX3B9GAaSZUGULNxQhbvdeNEA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-16 13:45:51.393098+00', '2026-03-16 13:45:51.393098+00', 
    0, 1,
    '[]', '[]', NULL, 'BEDXDBAC'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '502bd82f-319b-4e45-a370-b9b402fb2e8b', 'authenticated', 'authenticated', 'rjighjigh8@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Jighjigh Rogers"}', '2026-03-07 15:17:10.292515+00', '2026-03-07 15:19:51.812+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '502bd82f-319b-4e45-a370-b9b402fb2e8b', 'rjighjigh8@gmail.com', 'Jighjigh Rogers', 'jboy_cool16', 
    'student', 'UNIVERSITY OF IBADAN ', 'https://lh3.googleusercontent.com/a/ACg8ocKytGxeudKsy7Kk4FXcdMX1NBSncDkzzN1hpm8UMtoa-NeCZQ=s96-c', 
    NULL, NULL, 'Oyo, Nigeria ', 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 15:17:10.292515+00', '2026-03-07 15:19:51.812+00', 
    0, 1,
    '[]', '[]', '2030', '8262BF17'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '50ba3654-422a-44c8-90c2-bfff52dd815c', 'authenticated', 'authenticated', 'olayiwolamary1710@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Mary Olayiwola"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '50ba3654-422a-44c8-90c2-bfff52dd815c', 'olayiwolamary1710@gmail.com', 'Mary Olayiwola', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLWs-5zA0DfBWtOxETOUCV_EEOM-mOEA9almoy_9XvqmoO7oIo=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'AD2XDX8A'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '5170c6a3-d6a8-4433-a950-ed119ad248bc', 'authenticated', 'authenticated', 'fridaymarvelous483@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Friday Marvelous"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '5170c6a3-d6a8-4433-a950-ed119ad248bc', 'fridaymarvelous483@gmail.com', 'Friday Marvelous', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJjs6-LGIVLdRlgpFvTIQLv162IaCm0-odTTclBIT0pWSmcMaU=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '843D5X16'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '51daafa4-b1ed-48a9-8fed-9bdbfcc7be33', 'authenticated', 'authenticated', 'omohikma@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Hikma Omosanya"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '51daafa4-b1ed-48a9-8fed-9bdbfcc7be33', 'omohikma@gmail.com', 'Hikma Omosanya', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKl34Z6vC9rNYaunJw0GQH7C_ExR37gbGjpLY_b2rphyEm3ag=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '464F1325'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '51ebdf29-93de-41ff-b4ac-f0637b8d2635', 'authenticated', 'authenticated', 'marvellousoluwaferanmi240@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Marvellous Oluwaferanmi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '51ebdf29-93de-41ff-b4ac-f0637b8d2635', 'marvellousoluwaferanmi240@gmail.com', 'Marvellous Oluwaferanmi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIqwVWXXwev-vCWCWxaQp21GBuGd-SMeS_fcrdLF8LGfQHO5w=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'D7948969'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '53e21874-0b6c-4a5a-ac21-a692a6ac9ca5', 'authenticated', 'authenticated', 'ogundijiifunmilayo781@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ogundijii Funmilayo"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '53e21874-0b6c-4a5a-ac21-a692a6ac9ca5', 'ogundijiifunmilayo781@gmail.com', 'Ogundijii Funmilayo', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIxNCCOEsfiw3NAhYJhh_6uoWCQrkkBlQbsdJl3-yZZr5A-Zt4=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '75B53F44'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'authenticated', 'authenticated', 'amarachimunachi37@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Amarachi Munachi"}', '2026-02-21 04:26:02.447903+00', '2026-03-27 16:44:28.834+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'amarachimunachi37@gmail.com', 'Amarachi Munachi', 'becomingma', 
    'student', 'University of Ibadan', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/5551f4be-68fe-4bbb-b267-f95211d71f1d/avatar_1774629756085.jpg', 
    NULL, 'Crypto enthusiast and Business person ', 'Abuja ', 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    'pi_yoyo7', NULL, NULL,
    NULL, NULL, NULL,
    338, true, true, 
    '2026-02-21 04:26:02.447903+00', '2026-03-27 16:44:28.834+00', 
    1, 1,
    '[]', '[]', NULL, 'E145BA6B'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '5b2275df-fb04-490b-ac8d-a5cba8607275', 'authenticated', 'authenticated', 'nzeakornoble23@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Noble Nzeakor"}', '2026-03-07 15:19:02.255182+00', '2026-03-07 15:19:02.255182+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '5b2275df-fb04-490b-ac8d-a5cba8607275', 'nzeakornoble23@gmail.com', 'Noble Nzeakor', 'noble', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJtdg23cxeGVPB0ongY6RXAuhnf_oa289rXcJ4j53_DRh9E5g=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    60, false, false, 
    '2026-03-07 15:19:02.255182+00', '2026-03-07 15:19:02.255182+00', 
    1, 3,
    '[]', '[]', NULL, '89228378'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '5c896f75-c830-42b3-b959-6c7f40879b17', 'authenticated', 'authenticated', 'ojoemmanuel736@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Emmanuel Ojo"}', '2026-03-24 10:45:59.62482+00', '2026-03-24 10:45:59.62482+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '5c896f75-c830-42b3-b959-6c7f40879b17', 'ojoemmanuel736@gmail.com', 'Emmanuel Ojo', 'emmafx', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLt5yVyCEaj67_FDTShzTe541hrI03JmMOe6ng0gMMORIGLGw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-24 10:45:59.62482+00', '2026-03-24 10:45:59.62482+00', 
    0, 1,
    '[]', '[]', NULL, 'X3CFF1DB'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '5daaf15a-da7a-443d-904f-9a34a45e91e5', 'authenticated', 'authenticated', 'ajagbeabiodun416@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ajagbe Usman Abiodun"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '5daaf15a-da7a-443d-904f-9a34a45e91e5', 'ajagbeabiodun416@gmail.com', 'Ajagbe Usman Abiodun', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLcZJa_7d1ErVD2iDxCEt2YbIS-f39PuUyyVm_2l06HKIqwsg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '848DDFBE'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '5e8caffd-5022-4ecd-826e-f5ac1a147122', 'authenticated', 'authenticated', 'luckysuccess615@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Patience Success Lucky"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '5e8caffd-5022-4ecd-826e-f5ac1a147122', 'luckysuccess615@gmail.com', 'Patience Success Lucky', NULL, 
    'student', NULL, 'https://ui-avatars.com/api/?name=Patience%20Success%20Lucky%20&background=10b981&color=fff', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'AX9A74DD'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '5ed30e97-6676-4ce8-85f7-2bbb754d5350', 'authenticated', 'authenticated', 'gamaliel280307@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Gamaliel"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '5ed30e97-6676-4ce8-85f7-2bbb754d5350', 'gamaliel280307@gmail.com', 'Gamaliel', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKa2gAyqOSle1WdJ4OIN5AY9xaUfURMYvACaXPmT0UV5Jd6lg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '94FAB734'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '5fb35559-3727-41d8-aa11-77189d405467', 'authenticated', 'authenticated', 'iyanuoluwa758@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Daniel Iyanuoluwa"}', '2026-03-03 19:42:10.442917+00', '2026-03-03 19:42:10.442917+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '5fb35559-3727-41d8-aa11-77189d405467', 'iyanuoluwa758@gmail.com', 'Daniel Iyanuoluwa', 'daniel', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ3R5y_6cfSRmxV1P4SLeI6XSMitwcIaclfkwiWwJGZ8EKh5A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-03 19:42:10.442917+00', '2026-03-03 19:42:10.442917+00', 
    0, 1,
    '[]', '[]', NULL, '31DA6B45'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '60d302c9-50b8-4ab4-a5db-152c481566b2', 'authenticated', 'authenticated', 'favouroluwatofunmi9@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Favour Oluwatofunmi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '60d302c9-50b8-4ab4-a5db-152c481566b2', 'favouroluwatofunmi9@gmail.com', 'Favour Oluwatofunmi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKPBKb-W_R7P7fcSt5TgrNEQuCuvJOwTe5ramc6zdOGYxMBHb1H=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '89953D9C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '6361e27b-a747-4bf8-8116-0d7a67fbf690', 'authenticated', 'authenticated', 'enokeladavid61@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Enokela David"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '6361e27b-a747-4bf8-8116-0d7a67fbf690', 'enokeladavid61@gmail.com', 'Enokela David', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLjZu0Wgd7vceMC3gAU7MAKM8p73ZziLJiLZCQ7LGrePDZCjf2g=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '41996X35'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '63af1fb2-a6d9-4e05-a109-72a6bbb0db4a', 'authenticated', 'authenticated', 'fathiaoyeniran56@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "OYENIRAN Fathia"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '63af1fb2-a6d9-4e05-a109-72a6bbb0db4a', 'fathiaoyeniran56@gmail.com', 'OYENIRAN Fathia', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKxQHWZlhQOQ0fhqGDttKjKKZU0ztRfUeHjOLPLGi-3bBdW2RI=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'EX15828E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '6529d9fe-733d-496d-8c90-d226e751e9c1', 'authenticated', 'authenticated', 'akelebridgetefe82@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Akele Bridget"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '6529d9fe-733d-496d-8c90-d226e751e9c1', 'akelebridgetefe82@gmail.com', 'Akele Bridget', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ9-OQqTA9wECUb69-SD7Ph3vWUb1hbJo8oj08MHPISu8XggQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '186E5ACC'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '6538fe71-851a-4ebd-a05d-bb0a550e8208', 'authenticated', 'authenticated', 'yesiroh2010@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Isa Yesiroh"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '6538fe71-851a-4ebd-a05d-bb0a550e8208', 'yesiroh2010@gmail.com', 'Isa Yesiroh', 'yesirohtheeconomist', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLyH_ZCZFJABMvAibGPW_8lxxO_XqafDIn0ecA_sxl2CJF0a_U=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '5ABX5E1C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '67ff6216-0593-41f7-b8dd-5f32fbebdc53', 'authenticated', 'authenticated', 'soyelemotunrayo@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ebunoluwa Soyele"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '67ff6216-0593-41f7-b8dd-5f32fbebdc53', 'soyelemotunrayo@gmail.com', 'Ebunoluwa Soyele', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJq-E_qwKOLigIOEPgAotDW1mssAA6G1iwoNjelsoIyHntZCA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'XE463344'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '6ab23bef-8514-4ee7-a30a-8ece900bba05', 'authenticated', 'authenticated', 'marvelousabigail924@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Marvelous Abigail"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '6ab23bef-8514-4ee7-a30a-8ece900bba05', 'marvelousabigail924@gmail.com', 'Marvelous Abigail', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLgnW1D0Pr6pWJ4vbMVClA3Y7_LduCMFBB-oU4jzDmLunZ2DTqO=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '61F9F4ED'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '6bd8fa28-01fe-463d-9d36-d452426c54fa', 'authenticated', 'authenticated', 'olalekeidayatomowumi@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Olaleke Idayat Omowumi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '6bd8fa28-01fe-463d-9d36-d452426c54fa', 'olalekeidayatomowumi@gmail.com', 'Olaleke Idayat Omowumi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJNHp1CjXptb0vdw9y0aqAqypcrRsoO9qFcfGirgkJ6aR1Yzg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '8EE8XBEC'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '6be8c692-0ffe-40d5-a202-7de574e99a68', 'authenticated', 'authenticated', 'dadheke255717@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Decency Adheke"}', '2026-03-04 10:02:00.471818+00', '2026-03-04 10:04:37.807+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '6be8c692-0ffe-40d5-a202-7de574e99a68', 'dadheke255717@stu.ui.edu.ng', 'Decency Adheke', 'decency', 
    'student', 'University of ibadan ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/6be8c692-0ffe-40d5-a202-7de574e99a68/avatar_1772618586351.jpg', 
    NULL, 'Actor ', 'Ibadan,Nigeria ', 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    'my life as Decency ', NULL, NULL,
    0, false, false, 
    '2026-03-04 10:02:00.471818+00', '2026-03-04 10:04:37.807+00', 
    0, 1,
    '[]', '[]', '2029', 'X1539XEB'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '6fa2063a-3cfe-44fe-b5ec-efe0e0b5caac', 'authenticated', 'authenticated', 'mubarakadejumo30@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Mubarak Adejumo"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '6fa2063a-3cfe-44fe-b5ec-efe0e0b5caac', 'mubarakadejumo30@gmail.com', 'Mubarak Adejumo', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIPkWN3HsTHeiyLCQCOjhyOBqwpGwjf4Xl_Sb1uz-V4pR1WGrdh=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '48C229CX'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '76ef1ed5-355a-41b5-8854-4ec4c20ad5f9', 'authenticated', 'authenticated', 'cristyjames445@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Cristy James"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '76ef1ed5-355a-41b5-8854-4ec4c20ad5f9', 'cristyjames445@gmail.com', 'Cristy James', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKjIKcnWBNf4ehoRum_KvuxJuYRCCcL_xMiGCOp31CmfGpWOg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'A18DFC4A'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', 'authenticated', 'authenticated', 'pennymunis@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Peniel Munis"}', '2026-03-07 20:55:17.011577+00', '2026-03-07 21:08:57.321+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', 'pennymunis@gmail.com', 'Peniel Munis', 'pennysylva', 
    'student', 'University of Ibadan ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174/avatar_1772917322324.jpg', 
    NULL, 'Student | Creative Designer | PR', 'Ibadan, Nigeria ', 
    NULL, '["Creative Design","PR","Event planning"]', '[]', 
    NULL, NULL, NULL, 
    'www.instagram.com/pennysylva/', NULL, NULL,
    NULL, NULL, NULL,
    66, false, false, 
    '2026-03-07 20:55:17.011577+00', '2026-03-07 21:08:57.321+00', 
    0, 1,
    '[]', '[]', '2028', 'X3821792'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '7b3c5943-d07d-44f5-928c-329c4185983b', 'authenticated', 'authenticated', 'fareedahakinola21@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Akinola Fareedah"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '7b3c5943-d07d-44f5-928c-329c4185983b', 'fareedahakinola21@gmail.com', 'Akinola Fareedah', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKFyZTJ1jemwL3PNUTuwEFk9c2_UIkepWIBTutjnS71OY47Cg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'X2BE6945'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '7dc18219-7f89-45ef-880f-59d95a9c3cac', 'authenticated', 'authenticated', 'wordpressapp6@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Samson okorodudu"}', '2026-03-30 18:13:16.099166+00', '2026-03-30 18:15:09.316+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '7dc18219-7f89-45ef-880f-59d95a9c3cac', 'wordpressapp6@gmail.com', 'Samson okorodudu', 'testament', 
    'student', 'University of Ibadan', 'https://lh3.googleusercontent.com/a/ACg8ocLCFfE3XGMESL9pM_9wbmXf6nsi4izO56sju4yk8mhCsDkqkg=s96-c', 
    NULL, 'Crm setup & automation specialist', 'Ibadan', 
    'Year 3 student, Computer science', NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    45, false, false, 
    '2026-03-30 18:13:16.099166+00', '2026-03-30 18:15:09.316+00', 
    0, 1,
    '[]', '[]', '2028', '979AA727'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '7f5f6c28-4860-4bbd-8fd5-d96c80b134aa', 'authenticated', 'authenticated', 'raphealolajide009@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Rapheal Olajide"}', '2026-03-07 15:38:42.314045+00', '2026-03-07 15:38:42.314045+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '7f5f6c28-4860-4bbd-8fd5-d96c80b134aa', 'raphealolajide009@gmail.com', 'Rapheal Olajide', 'raph_2009', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJDt2OK32bGzkmbDWpW-B0WFpCsit_SDT7VzEZt8f-zdrB8Pw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 15:38:42.314045+00', '2026-03-07 15:38:42.314045+00', 
    0, 1,
    '[]', '[]', NULL, 'BA93A1X3'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '7fae4254-530d-4f50-a377-be5ecdf7b54d', 'authenticated', 'authenticated', 'koleiremide336@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Iremide"}', '2026-03-07 16:04:48.455488+00', '2026-03-07 16:04:48.455488+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '7fae4254-530d-4f50-a377-be5ecdf7b54d', 'koleiremide336@gmail.com', 'Iremide', 'shadow', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIkCKaeF5-002gQZ_4EXnx9M9-soIg4Solyk9c_1pAKXl-XjQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 16:04:48.455488+00', '2026-03-07 16:04:48.455488+00', 
    0, 1,
    '[]', '[]', NULL, '1973A225'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '7fd09493-6d34-4673-8df5-7d744571cc7f', 'authenticated', 'authenticated', 'muhammadalaminadam37@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Muhammad Alamin Adam"}', '2026-03-05 17:23:06.338429+00', '2026-03-05 17:23:06.338429+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '7fd09493-6d34-4673-8df5-7d744571cc7f', 'muhammadalaminadam37@gmail.com', 'Muhammad Alamin Adam', 'muhammad', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJVl2-lAVwwEaMYBHsDKMCFtH080nlCg_vLFMb7qgPwXlnL3A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 17:23:06.338429+00', '2026-03-05 17:23:06.338429+00', 
    0, 1,
    '[]', '[]', NULL, '3EA15E33'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '80d1a337-afae-4421-b4d5-017b8c5c277d', 'authenticated', 'authenticated', 'ahanonuemmanuel909@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ahanonu Emmanuel"}', '2026-03-06 10:44:56.372597+00', '2026-03-06 10:44:56.372597+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '80d1a337-afae-4421-b4d5-017b8c5c277d', 'ahanonuemmanuel909@gmail.com', 'Ahanonu Emmanuel', 'emmanuel', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKNg_KYhry1gi-OiJtSSnzadfqMlNgtmqy1G0FFW2Zkgl9YWySs=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-06 10:44:56.372597+00', '2026-03-06 10:44:56.372597+00', 
    0, 1,
    '[]', '[]', NULL, '45EE6477'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'authenticated', 'authenticated', 'unilinkrep@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Unilink Team"}', '2026-02-27 20:04:20.799332+00', '2026-03-29 07:17:42.768+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'unilinkrep@gmail.com', 'Unilink Team', 'unilinkng', 
    'org', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJX8GpgBKnAMOY55ukQlwUOZhYhJqvVdqS_MLP5Vc3fjJYNJfk=s96-c', 
    NULL, 'Disseminating UniLink info', 'Ibadan, Nigeria', 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    254, true, false, 
    '2026-02-27 20:04:20.799332+00', '2026-03-29 07:17:42.768+00', 
    0, 1,
    '[]', '[]', NULL, '1X52DD67'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '819fdcfa-c350-4297-b6d0-134171ca15c8', 'authenticated', 'authenticated', 'favourmustapha5@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "favour Mustapha"}', '2026-03-03 21:27:15.203067+00', '2026-03-03 21:27:15.203067+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '819fdcfa-c350-4297-b6d0-134171ca15c8', 'favourmustapha5@gmail.com', 'favour Mustapha', 'ffavourmustapha', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLSZmyR5W61yf5A1OhLLuRhIISjZ_fktohSxnIrZ0JtBHAN7ymhDQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    60, false, false, 
    '2026-03-03 21:27:15.203067+00', '2026-03-03 21:27:15.203067+00', 
    0, 1,
    '[]', '[]', NULL, 'EFCE9338'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '82da2032-6d31-425a-a328-c17a013995a5', 'authenticated', 'authenticated', 'abiolatimothy75@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Timothy Abiola"}', '2026-03-03 21:04:50.684663+00', '2026-03-03 21:04:50.684663+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '82da2032-6d31-425a-a328-c17a013995a5', 'abiolatimothy75@gmail.com', 'Timothy Abiola', 'sayless', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLNa-aI-7opR7LBD4WiIWN-Ue-pQ3TU1yBqZ7eRALE7jPr7UoiT=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-03 21:04:50.684663+00', '2026-03-03 21:04:50.684663+00', 
    0, 1,
    '[]', '[]', NULL, '6A195CAA'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '8303097b-c913-4110-89f0-bf4315466327', 'authenticated', 'authenticated', 'balqisopatunji@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Balqis Opatunji"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '8303097b-c913-4110-89f0-bf4315466327', 'balqisopatunji@gmail.com', 'Balqis Opatunji', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKEZdHPCkBbVYe2fNd-lk3H_DK0tR21Y2Lyi0Gx97Ep3x6dfg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '9A4E615E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '83502776-18b4-4ffc-af75-3267760316a6', 'authenticated', 'authenticated', 'adebodunademola203@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adebodun AJAKAIYE"}', '2026-04-03 08:57:59.602838+00', '2026-04-03 08:57:59.602838+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '83502776-18b4-4ffc-af75-3267760316a6', 'adebodunademola203@gmail.com', 'Adebodun AJAKAIYE', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIShumcqkjA-A2uu9jyDNsSJBR9Y711XeNbSSXF648OrDiJXQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-04-03 08:57:59.602838+00', '2026-04-03 08:57:59.602838+00', 
    0, 1,
    '[]', '[]', NULL, '1DCAD553'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '839042fd-c42a-47cf-84c8-b0ea72e446bc', 'authenticated', 'authenticated', 'ibirogbaadeoladeborah@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "IBIROGBA ADEOLA"}', '2026-02-24 21:51:10.375827+00', '2026-02-24 21:51:10.375827+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '839042fd-c42a-47cf-84c8-b0ea72e446bc', 'ibirogbaadeoladeborah@gmail.com', 'IBIROGBA ADEOLA', 'africangirl', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLiYJ2U_9u7X1ug4j0DOLIz0Hu288G2B5S3c1iJopZk11Ro0v0=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-24 21:51:10.375827+00', '2026-02-24 21:51:10.375827+00', 
    0, 1,
    '[]', '[]', NULL, '895BCBE3'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '84385d55-0eeb-45c4-bd90-6626a94836b9', 'authenticated', 'authenticated', 'mubarakmomoh08@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Mubarak Momoh"}', '2026-03-07 13:36:47.486724+00', '2026-03-07 13:36:47.486724+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '84385d55-0eeb-45c4-bd90-6626a94836b9', 'mubarakmomoh08@gmail.com', 'Mubarak Momoh', 'mubi_jaso30', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIzkQ_0Q7yC-lgdkZXVPjdEENdIGK1mAl7uZGg1BStbLQiSXA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:36:47.486724+00', '2026-03-07 13:36:47.486724+00', 
    0, 1,
    '[]', '[]', NULL, 'E28C4BA3'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '84429e04-fbdc-4fc3-9c65-ce61e1687b68', 'authenticated', 'authenticated', 'oladotunaladejohn@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oladotun Alade"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '84429e04-fbdc-4fc3-9c65-ce61e1687b68', 'oladotunaladejohn@gmail.com', 'Oladotun Alade', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLNTk4-t7rfjSneBBae23kPEZOR6BEPGNXDmfRKCuKvjEA03Q=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '91599CD9'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '84526547-9115-4948-a559-f3473ac56d0c', 'authenticated', 'authenticated', 'lgbadegesin242170@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Laughter Gbadegesin"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '84526547-9115-4948-a559-f3473ac56d0c', 'lgbadegesin242170@stu.ui.edu.ng', 'Laughter Gbadegesin', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIQNZXNRS0opGcWELaNPNqxGSnneiuTWjJ44MvFlymW8KEtmg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '9DF5AD7C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '84c5e6f0-a125-4bb6-b322-ee72a2f7a2df', 'authenticated', 'authenticated', 'akinlabitemitayo21@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Temitayo Akinlabi"}', '2026-03-07 14:59:34.851491+00', '2026-03-07 14:59:34.851491+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '84c5e6f0-a125-4bb6-b322-ee72a2f7a2df', 'akinlabitemitayo21@gmail.com', 'Temitayo Akinlabi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLttluRBxqmeEieoiI8knSEcRjbpBqpUSvaSvY0GvN9R5i_Rw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 14:59:34.851491+00', '2026-03-07 14:59:34.851491+00', 
    0, 1,
    '[]', '[]', NULL, '6C774EFC'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '859887b9-3441-4c7f-94fd-991f7006d605', 'authenticated', 'authenticated', 'ronaldinhoosowole@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ronaldinho Osowole"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '859887b9-3441-4c7f-94fd-991f7006d605', 'ronaldinhoosowole@gmail.com', 'Ronaldinho Osowole', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJBdGJw8dh_rYKVk4_9qjFUDWb54a_bKFxnixXAHJ9aXHlxFA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'DAA4XD3F'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '85d303c0-0942-4d81-bf28-de13149beb7b', 'authenticated', 'authenticated', 'alawodekehinde09@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Alawode Kehinde Amos"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '85d303c0-0942-4d81-bf28-de13149beb7b', 'alawodekehinde09@gmail.com', 'Alawode Kehinde Amos', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJPRb8vjheF5gaBmUWO7TvA8DB-XQ1s9mgrV3f2eRqFFMcJqKw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'B15FE775'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '86edb2e2-873b-4bc2-af88-11f7ff6635f2', 'authenticated', 'authenticated', 'josephjust90@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Just Joseph"}', '2026-03-06 07:25:58.091484+00', '2026-03-06 07:25:58.091484+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '86edb2e2-873b-4bc2-af88-11f7ff6635f2', 'josephjust90@gmail.com', 'Just Joseph', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJX2wGZMTlbHE5VRR9vrO2TWQzvcOaOg_qsRyMbpz0C-__7JA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-06 07:25:58.091484+00', '2026-03-06 07:25:58.091484+00', 
    0, 1,
    '[]', '[]', NULL, '1B5DDD2E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '87710b73-e226-4c18-bbfd-30b0e94a3bae', 'authenticated', 'authenticated', 'crmexpertly@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "CRMExpertly"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '87710b73-e226-4c18-bbfd-30b0e94a3bae', 'crmexpertly@gmail.com', 'CRMExpertly', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocL0KEQDWSzog4FmYgreK16OiJ_OYTf0fhwCVqD9zOdYulA9pQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'C78C4C74'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '8798340d-7df4-4160-942a-5d222ea427b6', 'authenticated', 'authenticated', 'oyasordaniel@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Daniel Oyasor"}', '2026-02-17 19:05:00.53366+00', '2026-04-03 17:36:44.482+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '8798340d-7df4-4160-942a-5d222ea427b6', 'oyasordaniel@gmail.com', 'Daniel Oyasor', 'doyasor', 
    'student', 'University of Ibadan', 'https://res.cloudinary.com/dh5odmxyi/image/fetch/f_auto,q_auto/https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/8798340d-7df4-4160-942a-5d222ea427b6/avatar_1772547754739.jpg', 
    'https://res.cloudinary.com/dh5odmxyi/image/fetch/f_auto,q_auto/https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/backgrounds/8798340d-7df4-4160-942a-5d222ea427b6_1772547778830.jpg', 'FOUNDER@UNILINK', 'Ibadan, Nigeria', 
    'Building the future of student connectivity and campus life across Nigeria', '["Web development","Time Series Analysis","Wordpress"]', '[]', 
    NULL, 'https://github.com/syntaxdrive', NULL, 
    'https://www.instagram.com/oyasordaniel25?igsh=cm42ZHJlZHNobHM=', NULL, 'https://www.facebook.com/profile.php?id=61578518180128',
    NULL, NULL, NULL,
    1249, true, true, 
    '2026-02-17 19:05:00.53366+00', '2026-04-03 17:36:44.482+00', 
    245, 3,
    '[]', '[]', '2027', 'C414FF38'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '8816b218-a543-4bd2-be20-d9817f69993d', 'authenticated', 'authenticated', 'joeladeleye129@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Joel Adeniji"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '8816b218-a543-4bd2-be20-d9817f69993d', 'joeladeleye129@gmail.com', 'Joel Adeniji', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIY2JzadiYP5_f2Q7DXuAX4WyZ-wxphkoF3kqb6r94DlegK5_oZ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'C3CXBA5B'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '8830cfc3-363b-4b21-ad54-596bb64fe2d4', 'authenticated', 'authenticated', 'solagbadeesther00@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Solagbade Esther"}', '2026-03-05 18:31:04.550253+00', '2026-03-05 18:31:04.550253+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '8830cfc3-363b-4b21-ad54-596bb64fe2d4', 'solagbadeesther00@gmail.com', 'Solagbade Esther', 'berry', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJaqwKtSiajsfqIzBIE4JF4GyNHG93KXLvgPzDqP-ebEAYmzPc=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 18:31:04.550253+00', '2026-03-05 18:31:04.550253+00', 
    0, 1,
    '[]', '[]', NULL, '64D382DX'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '8855d858-5bee-41b4-a217-adb9869f542d', 'authenticated', 'authenticated', 'osigbe12@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Godson Godwin"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '8855d858-5bee-41b4-a217-adb9869f542d', 'osigbe12@gmail.com', 'Godson Godwin', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJJrj78vtB9tsmVecRXbd4a3uhe0K96_YrYPYJl6oOuXHqxX5QB=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'E243822E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '88e8804b-e217-4884-983d-70c7e78f5061', 'authenticated', 'authenticated', 'adisafundz04@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "ADISA FUNDZ"}', '2026-03-14 04:26:52.951392+00', '2026-03-14 04:26:52.951392+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '88e8804b-e217-4884-983d-70c7e78f5061', 'adisafundz04@gmail.com', 'ADISA FUNDZ', 'faruqo4', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKkbtQJB9Yg2iEX3il6wBVCR0uMY6XZT1_EN3cAv82arol8OA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-14 04:26:52.951392+00', '2026-03-14 04:26:52.951392+00', 
    0, 1,
    '[]', '[]', NULL, '5C2DC7E4'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '894623e6-ecee-4159-b5a8-a2bf37380b99', 'authenticated', 'authenticated', 'kolzsticks1@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Akolade Bode-Ajayi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '894623e6-ecee-4159-b5a8-a2bf37380b99', 'kolzsticks1@gmail.com', 'Akolade Bode-Ajayi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJPm5pxiMdLPvf5ivCndmi07b_q9FLqmhNwUGXy7n7FzlmJ-osT=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'EB64FE82'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '8acc22d1-ab3d-422f-b74e-6614205e75f6', 'authenticated', 'authenticated', 'jimohkhalilulaholamilekan@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Jimoh Khalilulah olamilekan"}', '2026-03-26 18:51:03.764141+00', '2026-03-26 18:51:03.764141+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '8acc22d1-ab3d-422f-b74e-6614205e75f6', 'jimohkhalilulaholamilekan@gmail.com', 'Jimoh Khalilulah olamilekan', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocINSNrhO7tLrAAppvVlF-EpGbD2QIuPTaAnblTTpwChJlsGNQc=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-26 18:51:03.764141+00', '2026-03-26 18:51:03.764141+00', 
    0, 1,
    '[]', '[]', NULL, '5FDX3F7E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '8c0357d6-6976-4cf0-8aef-69ff657392d1', 'authenticated', 'authenticated', 'adelowoadeyemi111@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adeyemi Adelowo"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '8c0357d6-6976-4cf0-8aef-69ff657392d1', 'adelowoadeyemi111@gmail.com', 'Adeyemi Adelowo', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLej9MQVO1EOtxJvr0BrMz6m9fzqYyc2wZ5pOspofoBiWN_iw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'BX3DE2B3'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '8cf3f6b0-abac-4a90-99fe-931f786ab703', 'authenticated', 'authenticated', 'ifeoluwaamure4@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "ifeoluwa amure"}', '2026-03-07 12:54:21.815193+00', '2026-03-07 12:54:21.815193+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '8cf3f6b0-abac-4a90-99fe-931f786ab703', 'ifeoluwaamure4@gmail.com', 'ifeoluwa amure', 'ifeoluwa', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJAe3rhnWDWbHe1bsD3tz_jZvEZmLXd5za20XScdtJ3HXcoMQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 12:54:21.815193+00', '2026-03-07 12:54:21.815193+00', 
    0, 1,
    '[]', '[]', NULL, '4XE417F2'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '8e1d27c4-f95e-4daa-81c2-c759368d7da5', 'authenticated', 'authenticated', 'umorusolomon4321@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Solomon Umoru"}', '2026-03-11 14:09:44.924052+00', '2026-03-11 14:09:44.924052+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '8e1d27c4-f95e-4daa-81c2-c759368d7da5', 'umorusolomon4321@gmail.com', 'Solomon Umoru', 'jaydan', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocK7XPcSZI2tujNHYSdNJscBWIhU6EvdOIeHzUPvt_SVQupho9HQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    15, false, false, 
    '2026-03-11 14:09:44.924052+00', '2026-03-11 14:09:44.924052+00', 
    0, 1,
    '[]', '[]', NULL, 'FD597574'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '90b100ef-ff0a-43d4-959b-0413af879a5a', 'authenticated', 'authenticated', 'oyasordaniel25@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Daniel Oyasor"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '90b100ef-ff0a-43d4-959b-0413af879a5a', 'oyasordaniel25@gmail.com', 'Daniel Oyasor', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKLB7XYRvyFJI0opzNmWEnlH8-OO3DvMzZcOZ4wEqhimyozHw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '8EAAC33C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '913c0902-b3e3-463f-83bf-042383a5a0ab', 'authenticated', 'authenticated', 'joshbuk4002@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Joshua Olasunkanmi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '913c0902-b3e3-463f-83bf-042383a5a0ab', 'joshbuk4002@gmail.com', 'Joshua Olasunkanmi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocILFzRZ7qY2wCIXaqgKV_7qn0GDsdxquS18bBGWGuO3U91Z8g=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'DXD19DC4'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '93b891f2-10b5-407d-bbeb-65cc76784985', 'authenticated', 'authenticated', 'jegedeferanmi109@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Jegede Feranmi"}', '2026-03-07 14:56:52.015392+00', '2026-03-07 14:56:52.015392+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '93b891f2-10b5-407d-bbeb-65cc76784985', 'jegedeferanmi109@gmail.com', 'Jegede Feranmi', 'renjer', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKnu7jFLLkeZt6nS13P0w8wSYOTSqJgMiKH53YMQut5txlT=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 14:56:52.015392+00', '2026-03-07 14:56:52.015392+00', 
    0, 1,
    '[]', '[]', NULL, 'BX576X3E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '9628ab6c-bcb7-4d5c-800c-f13e41844fcc', 'authenticated', 'authenticated', 'adeyemojomiloju5@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adeyemo Jomiloju"}', '2026-03-07 13:32:57.037901+00', '2026-03-07 13:32:57.037901+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '9628ab6c-bcb7-4d5c-800c-f13e41844fcc', 'adeyemojomiloju5@gmail.com', 'Adeyemo Jomiloju', 'slimzy', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJHwq9eGm4XPt9Ull9E_beplOU6DdAg3phKvB852SPm6xao1A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:32:57.037901+00', '2026-03-07 13:32:57.037901+00', 
    0, 1,
    '[]', '[]', NULL, '526FFD9A'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '962b3343-7806-4e09-bfe2-1f18d1e666ee', 'authenticated', 'authenticated', 'dominionjoshua89@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Dominion Joshua"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '962b3343-7806-4e09-bfe2-1f18d1e666ee', 'dominionjoshua89@gmail.com', 'Dominion Joshua', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocK9wQX4s6zncEw8bdkZfG_WUwX6y3oCV7VUxDqBljZjW8RNxw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'E6B623F8'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '96d25037-a90c-44c4-901a-a911b47bdc25', 'authenticated', 'authenticated', 'winneriyiola@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Winner Iyiola"}', '2026-03-07 13:48:13.323149+00', '2026-03-07 13:48:13.323149+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '96d25037-a90c-44c4-901a-a911b47bdc25', 'winneriyiola@gmail.com', 'Winner Iyiola', 'winner', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIuzfO8Mq8KwQdk091Tny7PyfpJ0fPPk0Z1kFP4Ck98A9Os2A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:48:13.323149+00', '2026-03-07 13:48:13.323149+00', 
    0, 1,
    '[]', '[]', NULL, 'ECE8F283'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '96f082e2-148e-4677-95f8-0f6ef5e88012', 'authenticated', 'authenticated', 'olawunioluwadamilola7@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oluwadamilola Olawuni"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '96f082e2-148e-4677-95f8-0f6ef5e88012', 'olawunioluwadamilola7@gmail.com', 'Oluwadamilola Olawuni', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLOd7onTG8eVihEd_TxS8AhJKipC7nXTxVpMqBbRoSPiJ2imA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'AF416E19'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '970b30f6-583f-4cad-8f7e-ebe5175bdb0e', 'authenticated', 'authenticated', 'harrisonfaith027@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Harrison Faith"}', '2026-03-05 21:06:42.78948+00', '2026-03-05 21:44:20.479+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '970b30f6-583f-4cad-8f7e-ebe5175bdb0e', 'harrisonfaith027@gmail.com', 'Harrison Faith', 'harrisonfaith', 
    'student', 'University of Port Harcourt ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/970b30f6-583f-4cad-8f7e-ebe5175bdb0e/avatar_1772747042301.jpg', 
    NULL, 'Chemical Engineer ', 'Rivers, Nigeria ', 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 21:06:42.78948+00', '2026-03-05 21:44:20.479+00', 
    0, 1,
    '[]', '[]', '2026', '117XFX19'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '97894499-5520-42dd-bff1-4742a1d337e0', 'authenticated', 'authenticated', 'efolarin07@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Enioluwa Folarin"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '97894499-5520-42dd-bff1-4742a1d337e0', 'efolarin07@gmail.com', 'Enioluwa Folarin', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKxyjPDUp9NfWQi2t06dC5yCCPsj-svnqEaTC6SMPrvMn_Rzvdm=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '3D1361AE'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '9988b701-3a3e-4942-aaf6-059c68e5aa26', 'authenticated', 'authenticated', '08112789454i@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adamu Ibrahim"}', '2026-03-05 18:30:04.126531+00', '2026-03-05 18:30:04.126531+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '9988b701-3a3e-4942-aaf6-059c68e5aa26', '08112789454i@gmail.com', 'Adamu Ibrahim', 'nurseibrahim', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIqky0S3em8ncU4y5Z546sKL_QKM67Z6oyNk4mu7b3sO_9TaQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 18:30:04.126531+00', '2026-03-05 18:30:04.126531+00', 
    0, 1,
    '[]', '[]', NULL, 'E99714XD'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '9ad622f5-12de-4d65-a570-c9c3a547f36c', 'authenticated', 'authenticated', 'harunatomijeje2000@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Haruna Tomiwa"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '9ad622f5-12de-4d65-a570-c9c3a547f36c', 'harunatomijeje2000@gmail.com', 'Haruna Tomiwa', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocI5J-xdfJq5l-6-bNXidhQJDFZlNuFRWCre0pfdV7ZH2CUKTQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'C866F563'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '9ae1db1c-04f8-4b56-8d95-2981e6d7aa04', 'authenticated', 'authenticated', 'estheranu02@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Esther Ayoola"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '9ae1db1c-04f8-4b56-8d95-2981e6d7aa04', 'estheranu02@gmail.com', 'Esther Ayoola', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKjPuSSnHQ9-ZXwU2ors8R8oqNkn5XzvsrMbIbmOGtZ11a2nA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'X74A89X6'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '9b077789-2fae-4979-82ae-7537804d9f1d', 'authenticated', 'authenticated', 'queenhadassah593@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "O.E OLANIYI (QueenDassah)"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '9b077789-2fae-4979-82ae-7537804d9f1d', 'queenhadassah593@gmail.com', 'O.E OLANIYI (QueenDassah)', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLfoEa9a6sgRGPc6ZMvDxpem79l7maCe5sWtA2BMkZkE9opKd4=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '774X9A94'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '9ce864d1-2a10-429b-b57d-a3220620dae2', 'authenticated', 'authenticated', 'aomole251219@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Aderinsola Omole"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '9ce864d1-2a10-429b-b57d-a3220620dae2', 'aomole251219@stu.ui.edu.ng', 'Aderinsola Omole', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKl8Cz6rjf74UEYnjEN3VbRiyX3sRNXXcY8VNos0YGq1ilACQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'DAD9415X'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '9d176351-142b-4355-9828-340fc2250b97', 'authenticated', 'authenticated', 'imranhaleemah476@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Imran Haleemah"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '9d176351-142b-4355-9828-340fc2250b97', 'imranhaleemah476@gmail.com', 'Imran Haleemah', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKLUPPMdbsR45fxazJ_JiuWnJpzIyr8OeG0oVMna0sVj2p7gVwf=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'C112C26A'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '9ef59e65-b448-4e41-b0c5-cbca525d8277', 'authenticated', 'authenticated', 'abimifoluwasamuel2004@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Abimifoluwa Samuel"}', '2026-03-03 20:52:35.69926+00', '2026-03-03 20:52:35.69926+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '9ef59e65-b448-4e41-b0c5-cbca525d8277', 'abimifoluwasamuel2004@gmail.com', 'Abimifoluwa Samuel', 'theonlyabimi', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKfQrpIQMcEUi_0DeXdBLmc4wTwo110wot-RQ0inFk0kZyZCg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-03 20:52:35.69926+00', '2026-03-03 20:52:35.69926+00', 
    0, 1,
    '[]', '[]', NULL, '2EX2DX96'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '9f3f9a5c-968f-4049-aa61-552dd5966922', 'authenticated', 'authenticated', 'mustophaabiodun19@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Mustopha Abiodun"}', '2026-03-07 16:09:14.964889+00', '2026-03-07 16:09:14.964889+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '9f3f9a5c-968f-4049-aa61-552dd5966922', 'mustophaabiodun19@gmail.com', 'Mustopha Abiodun', 'musty007', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJXgtlp-_rgnKZTDaXd9q4024rvAJ8e9C7GvRZvwWPiHjHPbA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 16:09:14.964889+00', '2026-03-07 16:09:14.964889+00', 
    0, 1,
    '[]', '[]', NULL, 'A266BEBB'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    '9f8c97ff-3404-48e6-97ad-04cef525d7b4', 'authenticated', 'authenticated', 'chikwenduchiamaka4@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Titi the dazzler"}', '2026-03-05 16:54:24.470112+00', '2026-03-05 16:54:24.470112+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    '9f8c97ff-3404-48e6-97ad-04cef525d7b4', 'chikwenduchiamaka4@gmail.com', 'Titi the dazzler', 'titi', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKmxGm4QfxbPx7ZPhJLG5Wce1YSzqBzYkKOUr5OryaYbwi3LaTJ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 16:54:24.470112+00', '2026-03-05 16:54:24.470112+00', 
    0, 1,
    '[]', '[]', NULL, 'F5DX81A4'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a016d26c-04f6-4c93-ab7c-28a031139de6', 'authenticated', 'authenticated', 'akeledivine1@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Akele Divine|| Co-founder "}', '2026-02-18 11:35:46.135436+00', '2026-03-04 05:45:48.562+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a016d26c-04f6-4c93-ab7c-28a031139de6', 'akeledivine1@gmail.com', 'Akele Divine|| Co-founder ', 'divine_akele', 
    'student', 'University of Ibadan', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/a016d26c-04f6-4c93-ab7c-28a031139de6/avatar_1773613324263.jpg', 
    'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/backgrounds/a016d26c-04f6-4c93-ab7c-28a031139de6_1773613175151.jpg', 'Graphics designer ', 'Lagos, Nigeria.', 
    'I am an undergraduate student of The Department of Economics, University of Ibadan.', '[]', '[]', 
    NULL, NULL, NULL, 
    'https://localhost/app/profile/divine_akele', 'https://x.com/Hon_Divine?t=dmFK30BLf22PZr_DLbOZiw&s=09', NULL,
    NULL, NULL, NULL,
    348, true, true, 
    '2026-02-18 11:35:46.135436+00', '2026-03-04 05:45:48.562+00', 
    2, 1,
    '[]', '[]', NULL, 'F27A8X8X'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a079517d-3850-46ea-ad95-00d41d3e4f81', 'authenticated', 'authenticated', 'akeledivine20@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Divine"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a079517d-3850-46ea-ad95-00d41d3e4f81', 'akeledivine20@gmail.com', 'Divine', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIv0v7M5RnzadgYeaRoWELAYA5oeOzkVDSVU81ZgtJmNR7p9w=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '267BD743'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a1a49f59-c0a4-4d5d-a092-eab8310ff5bb', 'authenticated', 'authenticated', 'alabiadewole97@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adewole Alabi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a1a49f59-c0a4-4d5d-a092-eab8310ff5bb', 'alabiadewole97@gmail.com', 'Adewole Alabi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJvblcFfMdiat4leEZkD7gn_Hl_TS8IkKrn-tWRmGM214Gegg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'F11C9FB1'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a3882000-bccf-4a83-9cd3-4c5122879f94', 'authenticated', 'authenticated', 'sarafaadeniyi2019@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Olasunkanmi Adeniyi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a3882000-bccf-4a83-9cd3-4c5122879f94', 'sarafaadeniyi2019@gmail.com', 'Olasunkanmi Adeniyi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocILV7B__EESwojoomPY5ZtTloV8mE7sdfS20vWQSjo1y4Au_A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'F3CCA1XA'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a400eb8a-f7ed-4964-bdaa-4bad8d9718b6', 'authenticated', 'authenticated', 'adeagbohammed09021@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Hammed Adeagbo"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a400eb8a-f7ed-4964-bdaa-4bad8d9718b6', 'adeagbohammed09021@gmail.com', 'Hammed Adeagbo', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKeegH81-FVuBDAAFYJIY3iAebJ4FNBCyTrKbnDYWG-uIQuyg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'EE4AXE17'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a4e90129-0310-4f86-a776-4aa592f23e89', 'authenticated', 'authenticated', 'arinolaisaac008@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Arinola Isaac"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a4e90129-0310-4f86-a776-4aa592f23e89', 'arinolaisaac008@gmail.com', 'Arinola Isaac', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLAY7HCcBOsdCcyXK-5Stvfioy4fbNjjj2FETIhHdCwphyBwMo=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '85CA46A5'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a55be48a-38f3-4334-9eff-c6594c27be6a', 'authenticated', 'authenticated', 'princessvictory709@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Princess"}', '2026-03-07 15:19:13.56911+00', '2026-03-07 15:19:13.56911+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a55be48a-38f3-4334-9eff-c6594c27be6a', 'princessvictory709@gmail.com', 'Princess', 'goldenseal', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocL2NJE2VTGNpX5H8OVryWAIxtbHoMHLGv43mpVWdBV8XinxqA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 15:19:13.56911+00', '2026-03-07 15:19:13.56911+00', 
    1, 1,
    '[]', '[]', NULL, '6EBDCA89'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a5824f99-6027-474f-931a-397c379f9be1', 'authenticated', 'authenticated', 'gloryolatide12345@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Damilola Glory Olatide"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a5824f99-6027-474f-931a-397c379f9be1', 'gloryolatide12345@gmail.com', 'Damilola Glory Olatide', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJgEhdBunaTzLMLkDNLK2AkeIaKHKXQEeVhd72FZcEN-CDTe0K1=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '77AE6141'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a5fe7e2c-d146-4756-800f-99d55266b2eb', 'authenticated', 'authenticated', 'mueladerin@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Aderinola Temitope"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a5fe7e2c-d146-4756-800f-99d55266b2eb', 'mueladerin@gmail.com', 'Aderinola Temitope', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocK1B0qN0DrRQurUsSD5-UhGsIG8TLUkJnUW8GRMJK5a4NWkGw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'A481X449'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a645c58b-de18-42b4-b78d-7b829692bf6d', 'authenticated', 'authenticated', 'olugbadeayomide0@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "olugbade Ayomide"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a645c58b-de18-42b4-b78d-7b829692bf6d', 'olugbadeayomide0@gmail.com', 'olugbade Ayomide', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIU9U1K3hML-a9v5RrKKIKtcZL7mmv8AQh-1_iLAXgWHVgcZZ4=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'X3D87174'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a656c738-f2b9-4493-81d6-d0414cf4634a', 'authenticated', 'authenticated', 'ekwebelemfortune@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Fortune"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a656c738-f2b9-4493-81d6-d0414cf4634a', 'ekwebelemfortune@gmail.com', 'Fortune', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocK-hH8wk_ViH5ML5Bz2RuuYSf3_JZeCNsllD56wT8Pt7RoY2A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'D3CA9373'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a68689c1-dd51-4307-a0ba-730e7f589391', 'authenticated', 'authenticated', 'tamiloreonanuga0@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Tamilore Onanuga"}', '2026-03-23 14:30:16.487222+00', '2026-04-05 05:47:25.309+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a68689c1-dd51-4307-a0ba-730e7f589391', 'tamiloreonanuga0@gmail.com', 'Tamilore Onanuga', 'tamilore', 
    'student', 'University of Ibadan ', 'https://lh3.googleusercontent.com/a/ACg8ocIrekMnjNGhc0TwwAFs0c1v22ijHcaIIn0UoT1erTT4-vf0xw=s96-c', 
    NULL, NULL, 'Ogun, Nigeria', 
    'Year 3 student, Economics ', NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    20, false, false, 
    '2026-03-23 14:30:16.487222+00', '2026-04-05 05:47:25.309+00', 
    0, 1,
    '[]', '[]', '2027', '5B1B572C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a77ef7e3-ce30-4154-a9bf-bea99e0e0b58', 'authenticated', 'authenticated', 'agonomonday1111@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Agono Monday"}', '2026-03-07 15:00:35.398315+00', '2026-03-07 15:00:35.398315+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a77ef7e3-ce30-4154-a9bf-bea99e0e0b58', 'agonomonday1111@gmail.com', 'Agono Monday', 'agnoz', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKOheAb2VNzforXS6EzV5eyyzBI8qHgxwkePDS2MK9ijP_tGA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 15:00:35.398315+00', '2026-03-07 15:00:35.398315+00', 
    0, 1,
    '[]', '[]', NULL, '24B68846'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a9279bce-742e-4ca5-a993-a820b18830d7', 'authenticated', 'authenticated', 'pamilerinilebiyi@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Pamilerin Ilebiyi"}', '2026-03-07 15:17:21.602634+00', '2026-03-07 15:17:21.602634+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a9279bce-742e-4ca5-a993-a820b18830d7', 'pamilerinilebiyi@gmail.com', 'Pamilerin Ilebiyi', 'emmynice', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIs9ffZrWhvrC4L4BOqRKl_esKWwf3lX7psQ8Ch15QwOlJNZw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    15, false, false, 
    '2026-03-07 15:17:21.602634+00', '2026-03-07 15:17:21.602634+00', 
    1, 2,
    '[]', '[]', NULL, 'A3456DA1'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'a93cfba5-ca81-49da-84ee-465d310b7833', 'authenticated', 'authenticated', 'akadrimoyosoluwa2019@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Moyosoluwa Akadri"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'a93cfba5-ca81-49da-84ee-465d310b7833', 'akadrimoyosoluwa2019@gmail.com', 'Moyosoluwa Akadri', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLQXIlb3cLK8HOVWhymvswUc6fZbKaKCglo1o_PirNEVYifAg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'A3XB8575'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'aa79a01d-8d67-41f4-ac51-a2e3ab97aff9', 'authenticated', 'authenticated', 'oyindamolaadeyemi247@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oyindamola Adeyemi"}', '2026-03-15 17:49:38.064135+00', '2026-03-15 17:49:38.064135+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'aa79a01d-8d67-41f4-ac51-a2e3ab97aff9', 'oyindamolaadeyemi247@gmail.com', 'Oyindamola Adeyemi', 'oyindamola', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKcmnos28fMuRht8OR6HVoZtWFgyuXeAkGfRjuxHRogbdJm4g=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-15 17:49:38.064135+00', '2026-03-15 17:49:38.064135+00', 
    0, 1,
    '[]', '[]', NULL, '21F99911'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'aba7d285-ba5e-4ad3-9cad-741c4589183b', 'authenticated', 'authenticated', 'oluwagbemisolasalami48@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oluwagbemisola Salami"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'aba7d285-ba5e-4ad3-9cad-741c4589183b', 'oluwagbemisolasalami48@gmail.com', 'Oluwagbemisola Salami', 'cathy', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLYzaCvItfa7NCzKvdUh6V-pPmuqpSihJUHD9Qjkmfzx4hcPXzS=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '752D79DB'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ac00a6cc-7f36-44d1-824f-4259e6bd0c6f', 'authenticated', 'authenticated', 'oputegloria09@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Opute Gloria"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ac00a6cc-7f36-44d1-824f-4259e6bd0c6f', 'oputegloria09@gmail.com', 'Opute Gloria', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJeSOOqoDnKM3Bv1U6uIogkLzyaNL7KmiGBXDwNq2euyjoCEg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'C799F998'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ad96a972-5b3e-4b5d-b291-19876fba23bf', 'authenticated', 'authenticated', 'toriolaoluwadarasimi@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "toriola oluwadarasimi"}', '2026-03-07 15:45:25.579649+00', '2026-03-07 15:45:25.579649+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ad96a972-5b3e-4b5d-b291-19876fba23bf', 'toriolaoluwadarasimi@gmail.com', 'toriola oluwadarasimi', 'oluwadarasimi', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKrODcz0XObQsnoMbf7SYjoxrLacBGEC-Hn48DnCtCYcRpJnA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 15:45:25.579649+00', '2026-03-07 15:45:25.579649+00', 
    0, 1,
    '[]', '[]', NULL, 'AXD681EF'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ada16da7-a4e9-4628-8dd7-f8fc52a116ac', 'authenticated', 'authenticated', 'jhanidu250661@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Jubril Hanidu"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ada16da7-a4e9-4628-8dd7-f8fc52a116ac', 'jhanidu250661@stu.ui.edu.ng', 'Jubril Hanidu', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLzYbbu4_GvlJQmT0ZKJZQwmet1V2uD6jOv3i0TFwNmANrj9g=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'E7D47FCD'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'aead7890-394b-484d-b818-df3158038b8b', 'authenticated', 'authenticated', 'adedayomicheal22@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adedayo Micheal"}', '2026-03-05 18:14:15.221785+00', '2026-03-05 18:14:15.221785+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'aead7890-394b-484d-b818-df3158038b8b', 'adedayomicheal22@gmail.com', 'Adedayo Micheal', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLNvhx-jYGMMGSGKktgjm1XExlXqm02mdFWejkcu8C9znRzRUXU=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 18:14:15.221785+00', '2026-03-05 18:14:15.221785+00', 
    0, 1,
    '[]', '[]', NULL, '453BF5A6'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'aef21606-7d01-449c-bbfc-d7dd298cc371', 'authenticated', 'authenticated', 'ogundijomary50@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ogundijo Mary"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'aef21606-7d01-449c-bbfc-d7dd298cc371', 'ogundijomary50@gmail.com', 'Ogundijo Mary', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJORMyI32Of3zcs-ovIzbQ2oE6LUAZ9beE60Yjnnf5alkTLRg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '5A5EE4E5'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'aff161ee-9e6d-4053-8d20-5c875787ca62', 'authenticated', 'authenticated', 'joshadeleke111@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Boluwatife Adeleke"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'aff161ee-9e6d-4053-8d20-5c875787ca62', 'joshadeleke111@gmail.com', 'Boluwatife Adeleke', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIJwGzX5wWHa2l7S8shzgjJbDIQG5DczXJPWkYq91KZF81zBw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'BC35XC99'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'b16bfcd2-3b0f-4220-92d4-da067dbb0ce7', 'authenticated', 'authenticated', 'manueljae04@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Manuel Jae"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'b16bfcd2-3b0f-4220-92d4-da067dbb0ce7', 'manueljae04@gmail.com', 'Manuel Jae', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKJwVdIQwZ5wOXuBrgpmFJzlICiWEK_HeS6xngoZDB4PBEw8A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '6D85288E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'b1ecd046-8040-4299-a98f-040422e15b78', 'authenticated', 'authenticated', 'gloryofgodjohnson@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Glory Gabriel"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'b1ecd046-8040-4299-a98f-040422e15b78', 'gloryofgodjohnson@gmail.com', 'Glory Gabriel', 'glory', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIEbU3QjTAh2EFkM8XJ2S-17mv4_ke4NRlrxtDGwPXmSvpXdg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '8XB3484F'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', 'authenticated', 'authenticated', 'adigunb652@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "adigun bamidele"}', '2026-04-02 09:13:58.597955+00', '2026-04-02 09:15:30.008+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'b3f87c94-b18f-459a-a1c7-079ce4c0c78e', 'adigunb652@gmail.com', 'adigun bamidele', 'adigun_bamidele', 
    'student', 'University of Ibadan', 'https://lh3.googleusercontent.com/a/ACg8ocJP79sithDtSGwmrxzLccGSjmY4WGcN8wxp3x875mvQq9M1sQ=s96-c', 
    NULL, 'Web designer visual designer', 'Ibadan', 
    'Year 1 student, Psychology ', NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    50, false, false, 
    '2026-04-02 09:13:58.597955+00', '2026-04-02 09:15:30.008+00', 
    0, 1,
    '[]', '[]', '2030', '65ECEE46'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'b4a663dc-59a7-49ce-8022-707e339f05a4', 'authenticated', 'authenticated', 'www.mosopesoluwa20@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Sha Ff"}', '2026-03-07 13:38:34.685325+00', '2026-03-07 13:38:34.685325+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'b4a663dc-59a7-49ce-8022-707e339f05a4', 'www.mosopesoluwa20@gmail.com', 'Sha Ff', 'kolade56', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKc1CaJ4PjHfC0Vsd-GIdQ1mW6OXUH_CesYyN90pe4PCZiP3g=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:38:34.685325+00', '2026-03-07 13:38:34.685325+00', 
    0, 1,
    '[]', '[]', NULL, '9663D8A7'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'b564969a-bbf5-47cd-bb2e-404854045f70', 'authenticated', 'authenticated', 'biobaktobi15@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Tobilola Biobaku"}', '2026-03-15 15:21:26.452248+00', '2026-03-15 15:21:26.452248+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'b564969a-bbf5-47cd-bb2e-404854045f70', 'biobaktobi15@gmail.com', 'Tobilola Biobaku', 'justtim', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocK2qH1MQ0Bzi0zoTrr2sbKXgCt0z5jVNN8zmAnFrmQoDotPBIs=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-15 15:21:26.452248+00', '2026-03-15 15:21:26.452248+00', 
    0, 1,
    '[]', '[]', NULL, '49X9CA5C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'b676ab3c-a175-4767-9cf8-c658efdd074d', 'authenticated', 'authenticated', 'oadeyemi242150@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oyindamola Adeyemi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'b676ab3c-a175-4767-9cf8-c658efdd074d', 'oadeyemi242150@stu.ui.edu.ng', 'Oyindamola Adeyemi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJNs2PfBbtgS22juWWUgYUEafpjmX6uoidJ54oQgQRryF5JpQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '43D16E72'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'b76e30c2-39b7-434a-bcd9-4d5b94309dbf', 'authenticated', 'authenticated', 'olunugaenoch@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Olunuga Enoch"}', '2026-03-07 15:38:55.573381+00', '2026-03-07 15:38:55.573381+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'b76e30c2-39b7-434a-bcd9-4d5b94309dbf', 'olunugaenoch@gmail.com', 'Olunuga Enoch', 'cipher6508', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLqE7xOafIG5A0JaFXW9OWNVCG8kLGlVPNMbJPe2C1TpDhEGm0=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 15:38:55.573381+00', '2026-03-07 15:38:55.573381+00', 
    0, 1,
    '[]', '[]', NULL, '7825DCC6'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'b897e998-4058-4516-b467-68f38eb2b3d1', 'authenticated', 'authenticated', 'crumbalumbal@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Crumba"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'b897e998-4058-4516-b467-68f38eb2b3d1', 'crumbalumbal@gmail.com', 'Crumba', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKkDx64iKVpPErXQuIYNF4UFOPkMUoHsbon3h2_esF_jsAd=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '76X55C86'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'bb0d3c8f-9e67-4797-b20e-5f403080603d', 'authenticated', 'authenticated', 'destinymedianets@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Destiny"}', '2026-03-31 11:30:47.893643+00', '2026-03-31 11:33:37.537+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'bb0d3c8f-9e67-4797-b20e-5f403080603d', 'destinymedianets@gmail.com', 'Destiny', 'destiny_', 
    'student', 'University of Ibadan ', 'https://lh3.googleusercontent.com/a/ACg8ocKFLlks3K8Vw5P25ft3-MfFJlR1FsH2J1X0EwT2tmii8EB8b_w=s96-c', 
    NULL, 'Lover 💕', 'Lagos', 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-31 11:30:47.893643+00', '2026-03-31 11:33:37.537+00', 
    0, 1,
    '[]', '[]', NULL, 'CF149AX4'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'bb72ff51-9748-407b-adff-dab092b2f6a4', 'authenticated', 'authenticated', 'oyewolemichael400@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Michael Oyewole"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'bb72ff51-9748-407b-adff-dab092b2f6a4', 'oyewolemichael400@gmail.com', 'Michael Oyewole', 'meekmike', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLkxmOfz2AAKm8LX6sayLCN_-21BmzMfkrd5Dh1VPnLsesikw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'DC347888'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'bbc1380b-1360-4e62-88d6-c3800aef9a79', 'authenticated', 'authenticated', 'aliuolalekankolawole2016@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Aliu Olalekan Kolawole"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'bbc1380b-1360-4e62-88d6-c3800aef9a79', 'aliuolalekankolawole2016@gmail.com', 'Aliu Olalekan Kolawole', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLtZ4FKmnOFpVsr6RI3AYJo1ZnhEN1dQswPhqXvRvGBahzj7Q=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'AAC5A974'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'bbeaa920-b0a8-403f-8954-03751f843d47', 'authenticated', 'authenticated', 'olamideabiose2@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "ABIOSE HAWAU"}', '2026-03-05 17:29:31.594173+00', '2026-03-05 17:29:31.594173+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'bbeaa920-b0a8-403f-8954-03751f843d47', 'olamideabiose2@gmail.com', 'ABIOSE HAWAU', 'hawau', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLQiROaHeaLgDHw7nlSNOsGTDrZo6IPS1QZy-ZzBdm8toPtyA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 17:29:31.594173+00', '2026-03-05 17:29:31.594173+00', 
    0, 1,
    '[]', '[]', NULL, 'F26796AB'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'bdd55426-5305-40de-88e1-0ce5302214dc', 'authenticated', 'authenticated', 'aliyahkanyinsola14@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Aliyah Kanyinsola"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'bdd55426-5305-40de-88e1-0ce5302214dc', 'aliyahkanyinsola14@gmail.com', 'Aliyah Kanyinsola', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLTIhRDubScmVOJzhAFYkXhh9nm9WWOyEeuzJl493pMCSa6gg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '9BAA17D4'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'bde86b98-c09b-4624-a32e-49345a64839f', 'authenticated', 'authenticated', 'ayoadepeter080@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ayoade Peter"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'bde86b98-c09b-4624-a32e-49345a64839f', 'ayoadepeter080@gmail.com', 'Ayoade Peter', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJOtlagVIRlElYoywOJHmZp7Foc9dyvxqZ4glFAqbwqovvMUFOv=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '65XFE291'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'bf80083b-1347-4c82-ac37-6568c17405c5', 'authenticated', 'authenticated', 'sahirah648@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Khaerat Hamzat"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'bf80083b-1347-4c82-ac37-6568c17405c5', 'sahirah648@gmail.com', 'Khaerat Hamzat', NULL, 
    'student', NULL, 'https://ui-avatars.com/api/?name=Khaerat%20Hamzat%20&background=10b981&color=fff', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'C28DCBX9'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c03b2ec9-3169-4060-9220-683a6e439bb4', 'authenticated', 'authenticated', 'ayoagboola20@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ayodeji Agboola"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c03b2ec9-3169-4060-9220-683a6e439bb4', 'ayoagboola20@gmail.com', 'Ayodeji Agboola', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLWk9Y2F-B5Z8qee-KW9N1_Nw6S6yS0aFiVINMljANwhOJPFg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'CB6C365X'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c04bcc9b-4df1-4f63-b9cc-ac20bf3eb38f', 'authenticated', 'authenticated', 'ajibolablessing111@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ajibola Blessing Eniola"}', '2026-02-21 11:36:56.862439+00', '2026-03-30 22:30:40.45+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c04bcc9b-4df1-4f63-b9cc-ac20bf3eb38f', 'ajibolablessing111@gmail.com', 'Ajibola Blessing Eniola', 'ajibola_blessing', 
    'student', 'University of Ibadan ', 'https://lh3.googleusercontent.com/a/ACg8ocLDCXnR2UFR5J6qP16DSvAUIukpStuHmFMmGAH-473EW1n6JuS-=s96-c', 
    NULL, 'Fashion designer| Administrative Virtual Assistant', 'Ibadan, Nigeria', 
    'Year alumni student, Arts and Social Sciences Education', NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-03-30 22:30:40.45+00', 
    0, 1,
    '[]', '[]', '2026', '61841DC8'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c0d7e813-8597-4a7a-a0bd-c5ed846bd875', 'authenticated', 'authenticated', 'praiseadams101@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Praise Adams"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c0d7e813-8597-4a7a-a0bd-c5ed846bd875', 'praiseadams101@gmail.com', 'Praise Adams', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLAYFZCamlwVYSl7fFSH4C5yXXmzMd38J4LD2Dud9iJDLNDWg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'C9416CC7'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c2c732ef-0bec-4e6a-b5c8-77855c55539f', 'authenticated', 'authenticated', 'arowolofatimah1@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Arowolo Fatimah"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c2c732ef-0bec-4e6a-b5c8-77855c55539f', 'arowolofatimah1@gmail.com', 'Arowolo Fatimah', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLSiEKP4DtP_wkFRwlFJeu4FwjQNnsll2XU8dflsdqJ8UKp6Q=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '82E5XCDX'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c53f28cf-182e-468d-8683-3b58b8e7aa59', 'authenticated', 'authenticated', 'boluwatifealli061@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Precious Boluwatife Alli"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c53f28cf-182e-468d-8683-3b58b8e7aa59', 'boluwatifealli061@gmail.com', 'Precious Boluwatife Alli', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLPop7a7NyIgf5gGC26jfO_ZYYYyT1bVzxy9_fM31EG5Xtl21E=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '6C42XX1F'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c55f2cd0-6432-40cb-95f8-475f190e10db', 'authenticated', 'authenticated', 'oyeniranstephen42@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oyeniran Stephen"}', '2026-03-03 11:26:57.013285+00', '2026-03-03 11:26:57.013285+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c55f2cd0-6432-40cb-95f8-475f190e10db', 'oyeniranstephen42@gmail.com', 'Oyeniran Stephen', 'theruler', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocI2j4Ml8RpDHBcJ0ljbdhCSWcSXf-qKmw6TzkLmPm8r27h61w=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-03 11:26:57.013285+00', '2026-03-03 11:26:57.013285+00', 
    0, 1,
    '[]', '[]', NULL, '89A79712'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c64e6cd0-244d-4e6b-b01e-837f0afe254a', 'authenticated', 'authenticated', 'dakele242157@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Divine Akele"}', '2026-02-18 11:46:20.587897+00', '2026-02-18 19:15:30.352539+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c64e6cd0-244d-4e6b-b01e-837f0afe254a', 'dakele242157@stu.ui.edu.ng', 'Divine Akele', 'sarafina', 
    'student', 'Adamawa State Polytechnic, Yola', 'https://lh3.googleusercontent.com/a/ACg8ocKlcZCAFjl8NrKsUg1Oh0lLWmR0PDeYuVQa0cDH95kmnPGCwA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    34, false, false, 
    '2026-02-18 11:46:20.587897+00', '2026-02-18 19:15:30.352539+00', 
    0, 1,
    '[]', '[]', NULL, 'AED88C3C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c696ff19-7724-4478-a0cb-4014f3c0c7cf', 'authenticated', 'authenticated', 'michaelbrainny842@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Israel Atilola"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c696ff19-7724-4478-a0cb-4014f3c0c7cf', 'michaelbrainny842@gmail.com', 'Israel Atilola', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLuJUH3UKgUd3K4N4QAzNRFQfS8Qi-3AXEP-KQdAFgpU5VjEA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '7XFA2CXX'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c99bdf1f-fec5-4d1a-a04d-5249c4e81746', 'authenticated', 'authenticated', 'modinatadunni1180@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Modina Adunni"}', '2026-03-07 12:57:46.867552+00', '2026-03-07 12:57:46.867552+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c99bdf1f-fec5-4d1a-a04d-5249c4e81746', 'modinatadunni1180@gmail.com', 'Modina Adunni', 'ayanfe', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIBAKfftWDfcDYsKgfX1zevXxT4qlk6-KJuA1ArQoV7TuWSTQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 12:57:46.867552+00', '2026-03-07 12:57:46.867552+00', 
    0, 1,
    '[]', '[]', NULL, '44AFE118'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c9d67cca-fe18-4cb4-97d9-6ec2cf0dcb7e', 'authenticated', 'authenticated', 'ebenezerola30@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ebenezer Ola"}', '2026-03-19 20:33:34.048386+00', '2026-03-19 20:33:34.048386+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c9d67cca-fe18-4cb4-97d9-6ec2cf0dcb7e', 'ebenezerola30@gmail.com', 'Ebenezer Ola', 'hebb', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLFDfgCO_XbNVL4WHYebIPkzzsY9w_1WF6j5KsbQ-txs-NJgQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-19 20:33:34.048386+00', '2026-03-19 20:33:34.048386+00', 
    0, 1,
    '[]', '[]', NULL, 'XADADBB7'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'c9e1da3c-42f3-40d0-a980-b9281cd89dfc', 'authenticated', 'authenticated', 'abiodunoke042@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oke Abiodun"}', '2026-03-05 16:58:15.81688+00', '2026-03-05 17:00:48.465+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'c9e1da3c-42f3-40d0-a980-b9281cd89dfc', 'abiodunoke042@gmail.com', 'Oke Abiodun', 'eyimofe36', 
    'student', 'Ladoke Akintola University of technology ', 'https://lh3.googleusercontent.com/a/ACg8ocIL6B1KOa3YrggLVfM_omjiBfE2m9dHjX31HotcUWqbyV8Uug=s96-c', 
    NULL, NULL, 'Oyo State ', 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 16:58:15.81688+00', '2026-03-05 17:00:48.465+00', 
    0, 1,
    '[]', '[]', NULL, '2CED8FB5'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'cbdf616e-d0ee-417c-a6c0-ae6f471c487c', 'authenticated', 'authenticated', 'elizabeth55gg@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Elizabeth Eneh"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'cbdf616e-d0ee-417c-a6c0-ae6f471c487c', 'elizabeth55gg@gmail.com', 'Elizabeth Eneh', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIucZen7aHuoIJ0eI3sLNL_PLxAeGuMAsmBTFjS9L3I94muEPyrEQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '9D7DC24B'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ccbb49f8-195c-453f-96f7-a498f9e409f1', 'authenticated', 'authenticated', 'monioluwafarotimi@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "monioluwa"}', '2026-03-13 20:00:22.934729+00', '2026-03-13 20:00:22.934729+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ccbb49f8-195c-453f-96f7-a498f9e409f1', 'monioluwafarotimi@gmail.com', 'monioluwa', 'anioluwa', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLXc_a9hgS21ojYZ-9r92U7BRhJXtpYtKmp3Yv-x6s16UgUHmU=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    45, false, false, 
    '2026-03-13 20:00:22.934729+00', '2026-03-13 20:00:22.934729+00', 
    0, 1,
    '[]', '[]', NULL, 'C9D28A84'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ce9d51e2-b69f-4bb9-88bb-2d3c6a85696c', 'authenticated', 'authenticated', 'chinonsoali2005@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Justin Chinonso"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ce9d51e2-b69f-4bb9-88bb-2d3c6a85696c', 'chinonsoali2005@gmail.com', 'Justin Chinonso', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLwfxW2Ck6VdjOiYPpLc9MWZYbJ9mWvkI2eTT44i3NGPngOV6_G=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '94AAE162'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ceb9be04-6648-4050-bf51-6eef782af33a', 'authenticated', 'authenticated', 'oluwaseunadeyemi240@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oluwaseun Adeyemi"}', '2026-03-31 11:41:14.8733+00', '2026-03-31 11:42:30.908+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ceb9be04-6648-4050-bf51-6eef782af33a', 'oluwaseunadeyemi240@gmail.com', 'Oluwaseun Adeyemi', 'oluwaseun_adeyemi', 
    'student', 'University of Ibadan ', 'https://lh3.googleusercontent.com/a/ACg8ocJrOjs1i0g-qLQfNFJVEDr3xa5wQ7--gwKIaEu6Fo8YRJaBEw=s96-c', 
    NULL, 'Entrepreneur/Leadership and Politics', 'Ibadan', 
    'Year 4 student, Law', NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-31 11:41:14.8733+00', '2026-03-31 11:42:30.908+00', 
    0, 1,
    '[]', '[]', '2027', 'E23E51X5'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'd1052957-4249-4871-9d03-fb33ac19a806', 'authenticated', 'authenticated', 'awodarey2511@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Awotide Emmanuel"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'd1052957-4249-4871-9d03-fb33ac19a806', 'awodarey2511@gmail.com', 'Awotide Emmanuel', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIqKKmgkeWJ1ru4sEY6rTXZfCcOVAS5ScrqThcfyFbRZpmcUg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'D61642EC'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'd1c82f20-96a0-46c6-b68f-dc3f6c161b0d', 'authenticated', 'authenticated', 'adigundavid811@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adigun \u201cAdigun3803\u201d David"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'd1c82f20-96a0-46c6-b68f-dc3f6c161b0d', 'adigundavid811@gmail.com', 'Adigun “Adigun3803” David', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJBxniC7fjxBaIFZDAz9bShn1K6sxBcgrq_3W90T3QgKQl3CQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'X48DFX1B'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'd21ac845-bec4-420e-b284-6aad2ae0a314', 'authenticated', 'authenticated', 'luwelandia123@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "David Adebayo"}', '2026-03-07 16:11:54.347454+00', '2026-03-07 16:11:54.347454+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'd21ac845-bec4-420e-b284-6aad2ae0a314', 'luwelandia123@gmail.com', 'David Adebayo', 'davidadebayo17', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKz0dV-sNPYN3clQJicV5ziGt95Re8Nynuxyq7PehNx2z1QWW0=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 16:11:54.347454+00', '2026-03-07 16:11:54.347454+00', 
    0, 1,
    '[]', '[]', NULL, 'EC51CE78'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'd364bb68-e2e4-4752-9ed6-88b53ead0c54', 'authenticated', 'authenticated', 'ezegordon7@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Gordon Eze"}', '2026-02-21 11:36:56.862439+00', '2026-04-02 18:53:15.503143+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'd364bb68-e2e4-4752-9ed6-88b53ead0c54', 'ezegordon7@gmail.com', 'Gordon Eze', 'yesitsgordon', 
    'student', 'University of Ibadan', 'https://lh3.googleusercontent.com/a/ACg8ocIcj73wFv_fDnX61imcWu9NutF5YEBYrOTkHkDMLM9z54x3dg=s96-c', 
    NULL, 'I am a lot of things.', NULL, 
    'Year 3 student, Psychology ', NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    25, true, false, 
    '2026-02-21 11:36:56.862439+00', '2026-04-02 18:53:15.503143+00', 
    0, 1,
    '[]', '[]', '2027', '2135DA31'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'd48e3524-c04c-46ac-8cac-4eb33d09696a', 'authenticated', 'authenticated', 'fathiaalidu@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Fathia Alidu"}', '2026-03-07 13:22:47.345212+00', '2026-03-07 13:22:47.345212+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'd48e3524-c04c-46ac-8cac-4eb33d09696a', 'fathiaalidu@gmail.com', 'Fathia Alidu', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ7S2o9s8sykFmGWo7LXemvMwfQoJc2fckAiNLNSr_NyzQpNw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:22:47.345212+00', '2026-03-07 13:22:47.345212+00', 
    0, 1,
    '[]', '[]', NULL, 'A3BD52X3'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'd5f4070e-2aa3-47d8-8310-ce0e3579a2ed', 'authenticated', 'authenticated', 'ifejesuaderibigbe07@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Aderibigbe Ifejesu"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'd5f4070e-2aa3-47d8-8310-ce0e3579a2ed', 'ifejesuaderibigbe07@gmail.com', 'Aderibigbe Ifejesu', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIoJoBrFSCgUhn8FvGbbAicQh9Cwvfn9zJaTJvc4IcfbeGcEQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '3ECXE458'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'd8484a31-77d6-49c3-b433-98614c8a71a0', 'authenticated', 'authenticated', 'thaeconomictimes@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "The Economic Digest"}', '2026-02-21 11:36:56.862439+00', '2026-03-03 15:08:12.944+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'd8484a31-77d6-49c3-b433-98614c8a71a0', 'thaeconomictimes@gmail.com', 'The Economic Digest', 'ledger', 
    'student', 'University of Ibadan ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/avatars/d8484a31-77d6-49c3-b433-98614c8a71a0/avatar_1772550479163.jpg', 
    'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/backgrounds/d8484a31-77d6-49c3-b433-98614c8a71a0_1772550341314.jpg', 'Economic News Around the World', 'Ibadan, Nigeria', 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    114, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-03-03 15:08:12.944+00', 
    0, 1,
    '[]', '[]', NULL, '7F79A59C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'd9144849-e3d0-4d9d-995f-e13ec3f2ee5f', 'authenticated', 'authenticated', 'umuazeez1@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Umu Azeez"}', '2026-03-07 13:11:30.81723+00', '2026-03-08 04:28:49.624+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'd9144849-e3d0-4d9d-995f-e13ec3f2ee5f', 'umuazeez1@gmail.com', 'Umu Azeez', 'aramide', 
    'student', 'University of Ibadan ', 'https://lh3.googleusercontent.com/a/ACg8ocLubrwoVD_YZsd9LME-_Vwue8oa7fK4BO7OYCh4NfA5KJ8-eQ=s96-c', 
    NULL, NULL, 'Ibadan ', 
    NULL, '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:11:30.81723+00', '2026-03-08 04:28:49.624+00', 
    0, 1,
    '[]', '[]', NULL, 'C714AE4X'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'd99d2063-2a63-4e8e-8b88-da3397efc4c3', 'authenticated', 'authenticated', 'dagundurodavidopeyemi04@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "David Dagunduro"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'd99d2063-2a63-4e8e-8b88-da3397efc4c3', 'dagundurodavidopeyemi04@gmail.com', 'David Dagunduro', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocL9S7zX3WR-wUxLCoIr4kTyIUnW4MA4dj7lb_w_F50J106fLGuw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '1D53167C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'da89cfec-79da-4a65-8989-86dcd9bb828c', 'authenticated', 'authenticated', 'cenyinda664@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Chimzi Enyinda"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'da89cfec-79da-4a65-8989-86dcd9bb828c', 'cenyinda664@stu.ui.edu.ng', 'Chimzi Enyinda', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIPQc5rLhXcdTUmJp3mlRE_c44I3c1zIGSOIBdt2TIW9A-n0A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'FE75F3F6'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'da9725eb-45ca-4e63-8023-1b656e74361c', 'authenticated', 'authenticated', 'gerald010421@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Charbel Agajimah"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'da9725eb-45ca-4e63-8023-1b656e74361c', 'gerald010421@gmail.com', 'Charbel Agajimah', 'charbel', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKvNB0XkUb6OYLF0jr9CRA-DZf8P5udzfp7vPXKzKaDPOHArN2F=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'E7881BFF'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'dd83d059-a99d-4569-a65d-60d763fa29b7', 'authenticated', 'authenticated', 'aransioladivine07@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Aransiola Divibe"}', '2026-03-07 16:10:20.355445+00', '2026-03-07 16:10:20.355445+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'dd83d059-a99d-4569-a65d-60d763fa29b7', 'aransioladivine07@gmail.com', 'Aransiola Divibe', 'divinethegpt', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocINpz1lrWFGl15ZlYeK9Uus5TpaWtj7pTXwyuzI-gL0VJMebA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 16:10:20.355445+00', '2026-03-07 16:10:20.355445+00', 
    0, 1,
    '[]', '[]', NULL, '84A8EX64'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'dfa38af7-12ab-4bd3-8a9e-87e71287c3b6', 'authenticated', 'authenticated', 'regdassahtobi@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "IBUKUNOLUWA AKINWANDE"}', '2026-03-04 12:13:56.283962+00', '2026-03-04 12:13:56.283962+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'dfa38af7-12ab-4bd3-8a9e-87e71287c3b6', 'regdassahtobi@gmail.com', 'IBUKUNOLUWA AKINWANDE', 'ibukunoluwasegullah', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKygG0WYnJbhunm0R-284ERMevkPi4CKmBxbsyXPC0VY_TLT4A=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-04 12:13:56.283962+00', '2026-03-04 12:13:56.283962+00', 
    0, 1,
    '[]', '[]', NULL, '2X94FX5D'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'e12579c2-4737-42f3-8cbe-93dc14601452', 'authenticated', 'authenticated', 'okikioluogundoyin@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ogundoyin Okikiolu"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'e12579c2-4737-42f3-8cbe-93dc14601452', 'okikioluogundoyin@gmail.com', 'Ogundoyin Okikiolu', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ5JsLiTT0G67dKQJj88YkNBHqmU0YA7I70nq08EaUcAn8dIg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '8D15DXE6'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'e16707da-3f96-4cf3-a1ca-5696ac25d4ab', 'authenticated', 'authenticated', 'muizzraji2@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Muizz Raji"}', '2026-03-07 13:37:30.57642+00', '2026-03-07 13:37:30.57642+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'e16707da-3f96-4cf3-a1ca-5696ac25d4ab', 'muizzraji2@gmail.com', 'Muizz Raji', 'mraj', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ-24tqwINJCQttzmLP4edWf_xQ2m4z533RyLZkJphGTmFypA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 13:37:30.57642+00', '2026-03-07 13:37:30.57642+00', 
    0, 1,
    '[]', '[]', NULL, '5XC571AC'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'e43bb3b8-53c8-4748-87d6-b84c84c7e88c', 'authenticated', 'authenticated', 'divineokwudiri444@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Divine Okwudiri"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'e43bb3b8-53c8-4748-87d6-b84c84c7e88c', 'divineokwudiri444@gmail.com', 'Divine Okwudiri', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIj4HjqRSWX9BzxmQaZ-pwLd3pQi4Jzm4Ywzlz9Go5QXcQ29w=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'BE351XC3'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'e619eaa4-5bcf-4a3e-bce5-ba966d18df45', 'authenticated', 'authenticated', 'anuoluwapoopeyemi451@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Opeyemi anuoluwapo"}', '2026-03-04 06:55:28.912881+00', '2026-03-04 06:55:28.912881+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'e619eaa4-5bcf-4a3e-bce5-ba966d18df45', 'anuoluwapoopeyemi451@gmail.com', 'Opeyemi anuoluwapo', 'lizabeth', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLLmaNVCi9APiUGkx8_vhLzt1SaS5GK0fNpP7WkMfKIDy4CCA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-04 06:55:28.912881+00', '2026-03-04 06:55:28.912881+00', 
    0, 1,
    '[]', '[]', NULL, 'AD151D9F'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'e6311d64-8576-4653-b93a-c99ba55d3a75', 'authenticated', 'authenticated', 'koladebabalola111@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Shogbola Kolade"}', '2026-03-05 21:14:43.232797+00', '2026-03-05 21:14:43.232797+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'e6311d64-8576-4653-b93a-c99ba55d3a75', 'koladebabalola111@gmail.com', 'Shogbola Kolade', 'kolade', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocI9Vg6MbjFw9NCmljZzNKD9NUhGoyFrh_uDc5hSZn0vr9wYaok=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 21:14:43.232797+00', '2026-03-05 21:14:43.232797+00', 
    0, 1,
    '[]', '[]', NULL, '158DDF24'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'e6b4d085-54fe-470a-8e26-4bf4bb5da32c', 'authenticated', 'authenticated', 'alasaoghelehappiness@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Alasa Oghele Happiness"}', '2026-03-30 21:48:52.972452+00', '2026-03-30 21:48:52.972452+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'e6b4d085-54fe-470a-8e26-4bf4bb5da32c', 'alasaoghelehappiness@gmail.com', 'Alasa Oghele Happiness', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIBjGFRcC1zIDTOa3WFcqrz7OYtQ-N1cWiwgVy1-6w_ggWxQZ2t=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-30 21:48:52.972452+00', '2026-03-30 21:48:52.972452+00', 
    0, 1,
    '[]', '[]', NULL, '9DEBAX9E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'e6ea1ee5-4ccb-4dd5-a0c6-4e0f629a3b66', 'authenticated', 'authenticated', 'olumuyiwaobanijesu@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Obanijesu Olumuyiwa"}', '2026-04-01 08:17:02.300971+00', '2026-04-01 08:18:12.833+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'e6ea1ee5-4ccb-4dd5-a0c6-4e0f629a3b66', 'olumuyiwaobanijesu@gmail.com', 'Obanijesu Olumuyiwa', 'obanijesu_olumuyiwa', 
    'student', 'University of Ibadan', 'https://lh3.googleusercontent.com/a/ACg8ocIrGhiL2yoFOFrWMxX_PzNNakeZEQltZU9vJLW9t41vjGgPew=s96-c', 
    NULL, 'Student', 'Ibadan', 
    'Year 3 student, Economics ', NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-04-01 08:17:02.300971+00', '2026-04-01 08:18:12.833+00', 
    0, 1,
    '[]', '[]', '2028', '9B121F6X'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'e89d2960-f719-4c9a-b210-f6408253207f', 'authenticated', 'authenticated', 'immaculatee87@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Emmanuel Akinbusuyi"}', '2026-03-03 21:10:04.238988+00', '2026-03-03 21:10:04.238988+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'e89d2960-f719-4c9a-b210-f6408253207f', 'immaculatee87@gmail.com', 'Emmanuel Akinbusuyi', 'statesman', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIksaNr5jhmGUrbOCr92adIpKf55utswcvc9qxrHAFSWoRALs94=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-03 21:10:04.238988+00', '2026-03-03 21:10:04.238988+00', 
    0, 1,
    '[]', '[]', NULL, 'F9E23729'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ea0d5bfb-3cba-427c-badb-f3cdba97c70f', 'authenticated', 'authenticated', 'oguntoyinbokehindeayomide@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oguntoyinbo Kehinde"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ea0d5bfb-3cba-427c-badb-f3cdba97c70f', 'oguntoyinbokehindeayomide@gmail.com', 'Oguntoyinbo Kehinde', 'kenny', 
    'student', NULL, 'https://ui-avatars.com/api/?name=Oguntoyinbo%20Kehinde%20&background=10b981&color=fff', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '3E2556B8'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ebf1e36e-d680-456d-bd80-e27a8d8143cf', 'authenticated', 'authenticated', 'adegbuledamilola32@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Adegbule Damilola"}', '2026-03-07 14:58:10.984096+00', '2026-03-07 14:58:10.984096+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ebf1e36e-d680-456d-bd80-e27a8d8143cf', 'adegbuledamilola32@gmail.com', 'Adegbule Damilola', 'oluwadamilola', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIL9n27rpwaBn8l5-1U74S1JphMdn-gIp9-yhph8OdRdoTD4g=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 14:58:10.984096+00', '2026-03-07 14:58:10.984096+00', 
    0, 1,
    '[]', '[]', NULL, 'EFBDBC66'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'eca7b629-32d7-4d1d-ae94-3383c21f742c', 'authenticated', 'authenticated', 'olajideerioluwa@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Olajide Opeyemi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'eca7b629-32d7-4d1d-ae94-3383c21f742c', 'olajideerioluwa@gmail.com', 'Olajide Opeyemi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIHMdnK_5fpGMQR5S6HVRL2AZOShrGtykGcfj9fGuO4m8S3E70=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '747BC81C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ece3b844-bd7e-49d3-9a2f-628f099a66b9', 'authenticated', 'authenticated', 'gbadegesindaniel77@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Daniel Gbadegesin"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ece3b844-bd7e-49d3-9a2f-628f099a66b9', 'gbadegesindaniel77@gmail.com', 'Daniel Gbadegesin', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKibrPnOJoqGO5QB8sv9tAIwX0fuuw_2dOUGtJ371P1tWnHdpH7=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '8F57528E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ed620056-c5d6-4ed6-8540-c50c159d64fe', 'authenticated', 'authenticated', 'adesopekodiri5@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "ADESOPE QADEER"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ed620056-c5d6-4ed6-8540-c50c159d64fe', 'adesopekodiri5@gmail.com', 'ADESOPE QADEER', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKxDH149e6W0bCPVrxQYQoDbeypUle9XCADD9ZOb3PZ6JAVX5hn=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '32956145'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'edc229c9-10e5-4721-8733-e8b74103ddcc', 'authenticated', 'authenticated', 'faudaai99@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "AI Fauda"}', '2026-03-05 17:44:16.179264+00', '2026-03-05 17:44:16.179264+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'edc229c9-10e5-4721-8733-e8b74103ddcc', 'faudaai99@gmail.com', 'AI Fauda', 'fauda', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLm8sF0f7PT5hcWix28Fvoyl5uGUXvnPN0wPypqxaAprwissw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 17:44:16.179264+00', '2026-03-05 17:44:16.179264+00', 
    0, 1,
    '[]', '[]', NULL, '439ACCXE'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ee09fe2f-eef3-4042-9d0d-c7be02aa2bd5', 'authenticated', 'authenticated', 'oluwaseunoluwaseyi963@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "oluwaseun oluwaseyi"}', '2026-03-05 17:46:23.237682+00', '2026-03-05 18:03:14.773+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ee09fe2f-eef3-4042-9d0d-c7be02aa2bd5', 'oluwaseunoluwaseyi963@gmail.com', 'oluwaseun oluwaseyi', 'oluwaseunseyi', 
    'student', 'Tai Solarin Federal University of Education, Ijagun, Ogun State. ', 'https://lh3.googleusercontent.com/a/ACg8ocJdUGiuUeVKUv_AgEm2RFrxqbMdyM6fVGcPN9h0Amoue6hRIGk=s96-c', 
    NULL, 'Graphic designer/ Educational consultant ', 'Ogun State, Nigeria ', 
    'Well reserved, disciplined and God fearing individual ', '[]', '[]', 
    NULL, NULL, NULL, 
    NULL, 'https://x.com/SeyiLaw1960', 'https://www.fb.com/l/6lp1kJRRR',
    NULL, NULL, '+2349017107838',
    15, false, false, 
    '2026-03-05 17:46:23.237682+00', '2026-03-05 18:03:14.773+00', 
    0, 1,
    '[]', '[]', NULL, 'FEBADDC5'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ef9a5041-bff0-4588-9868-fd34ec58c6aa', 'authenticated', 'authenticated', 'ajayiesther2403@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Ajayi Esther"}', '2026-03-07 01:34:01.250569+00', '2026-03-07 01:34:01.250569+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ef9a5041-bff0-4588-9868-fd34ec58c6aa', 'ajayiesther2403@gmail.com', 'Ajayi Esther', 'renuan_esther', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJpNJHhpaJFNeezdyvhzfaf-b3ARgk8zvnQOJiBfnecCpnGNQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 01:34:01.250569+00', '2026-03-07 01:34:01.250569+00', 
    0, 1,
    '[]', '[]', NULL, '87FE2DBE'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'f041fd37-280d-4e78-935b-b27193a493ad', 'authenticated', 'authenticated', 'sulaimanwahabtheone@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Gamelord"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'f041fd37-280d-4e78-935b-b27193a493ad', 'sulaimanwahabtheone@gmail.com', 'Gamelord', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLEP1j-Uee09xqTUmiKdcnH648y6Rx_-3AeiWXzneLj16RcDPv2=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '326C26A1'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'f0440981-1974-4b21-867b-b808c7f4c704', 'authenticated', 'authenticated', 'hephzibahademoye@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Hephzibah Ademoye"}', '2026-03-31 17:35:58.69391+00', '2026-03-31 17:36:50.411+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'f0440981-1974-4b21-867b-b808c7f4c704', 'hephzibahademoye@gmail.com', 'Hephzibah Ademoye', 'hephzibah_ademoye', 
    'student', 'University of Ibadan', 'https://lh3.googleusercontent.com/a/ACg8ocKRfbJRMz5NPFfd-zHlA6PgrbzLZeNjk4if-9VRgDfBtHRp0kM=s96-c', 
    NULL, NULL, 'Ibadan, Nigeria', 
    'Year 1 student, Industrial and production engineering ', NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-31 17:35:58.69391+00', '2026-03-31 17:36:50.411+00', 
    0, 1,
    '[]', '[]', '2026', '362F353B'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'f3a3a0ad-8885-47e9-bebf-b82aa759f2a1', 'authenticated', 'authenticated', 'adebiyivictoria03@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Victoria Adebiyi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'f3a3a0ad-8885-47e9-bebf-b82aa759f2a1', 'adebiyivictoria03@gmail.com', 'Victoria Adebiyi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLZeoKddJoKtml-skgJZE4YHwgCapUCGEZcQL18gGKjhGsTPQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '633D557E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'f4926ff6-b964-44bc-be06-f6d9cc91b705', 'authenticated', 'authenticated', 'oyasormichael87@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Oyasor Michael"}', '2026-02-21 11:36:56.862439+00', '2026-04-06 16:09:48.285+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'f4926ff6-b964-44bc-be06-f6d9cc91b705', 'oyasormichael87@gmail.com', 'Oyasor Michael', 'hero', 
    'student', 'Obafemi Awolowo University', 'https://lh3.googleusercontent.com/a/ACg8ocJEmLtTFvUgOvXbdDoA3l61woTEHP2nR3-VDQzkjAlzBLMs_Q=s96-c', 
    NULL, '3d Environment artist | Prop Artist | Creative', 'Ibadan, Nigeria', 
    'Year 2 student, Mechanical engineering ', NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    25, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-04-06 16:09:48.285+00', 
    1, 1,
    '[]', '[]', '2029', '6E879X1E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'f67b78c5-2aa8-44c3-9ffb-6c689160dd9e', 'authenticated', 'authenticated', 'petertimileyin18403@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Peter Oluwatimileyin"}', '2026-03-05 17:17:09.795873+00', '2026-03-05 17:17:09.795873+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'f67b78c5-2aa8-44c3-9ffb-6c689160dd9e', 'petertimileyin18403@gmail.com', 'Peter Oluwatimileyin', 'peter', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIvYkg6YV0vmRZ_qg7TlPU8ars7T7ODP3rQrwngG0gn2Nfm4Q=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-05 17:17:09.795873+00', '2026-03-05 17:17:09.795873+00', 
    0, 1,
    '[]', '[]', NULL, 'B9F83437'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'f77dc384-0f4a-4d78-95ab-0da3f8670c22', 'authenticated', 'authenticated', 'ssunday553@stu.ui.edu.ng', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Samuel Sunday"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'f77dc384-0f4a-4d78-95ab-0da3f8670c22', 'ssunday553@stu.ui.edu.ng', 'Samuel Sunday', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIUCua-G3yhtxs4i1CIE2DWMC1FOmWQiGTt6b9hzxEn52JTpLM=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'C3C65BBA'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'f93f8c25-80c5-4316-8083-abb99f5501f2', 'authenticated', 'authenticated', 'sowunmibalikis3@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Sowunmi balikis"}', '2026-03-07 15:19:02.398505+00', '2026-03-07 15:19:02.398505+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'f93f8c25-80c5-4316-8083-abb99f5501f2', 'sowunmibalikis3@gmail.com', 'Sowunmi balikis', 'kimlabake', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJRRQLslOXeiVaMP5BQP3AiLJHvwIsbjJHClmLUXAdRWE02Ng=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 15:19:02.398505+00', '2026-03-07 15:19:02.398505+00', 
    0, 1,
    '[]', '[]', NULL, 'X71F12CB'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'fa29637a-a747-468b-ad51-111789aa32d7', 'authenticated', 'authenticated', 'victoriaoluremi30@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Victoria Oluremi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'fa29637a-a747-468b-ad51-111789aa32d7', 'victoriaoluremi30@gmail.com', 'Victoria Oluremi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLA6keCpJlGUberSz7CPAX1VZ5504YgISbbB_hGvblwcxP6mQ=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '1C2AF51C'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'fa884ab4-d398-4405-a7f3-985b4484e69b', 'authenticated', 'authenticated', 'akintoluoluwabukunmi@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Akintolu Oluwabukunmi"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'fa884ab4-d398-4405-a7f3-985b4484e69b', 'akintoluoluwabukunmi@gmail.com', 'Akintolu Oluwabukunmi', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLZc90ugmZPBDgSodxfLZ9hWiJ14oiOom9CAA26-BCb-4_fhw=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, '11X98B8E'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'fc9d4ad0-dc79-4a3f-a2bb-a857ff706c46', 'authenticated', 'authenticated', 'olayiwolamary1701@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "MARY OLAYIWOLA"}', '2026-03-03 20:47:52.818178+00', '2026-03-03 20:47:52.818178+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'fc9d4ad0-dc79-4a3f-a2bb-a857ff706c46', 'olayiwolamary1701@gmail.com', 'MARY OLAYIWOLA', 'mary', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocI5p_p4TGYMXwFR-XRatRB0nh6jXyJb9Ijk343o4j13-4gMrg=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    15, false, false, 
    '2026-03-03 20:47:52.818178+00', '2026-03-03 20:47:52.818178+00', 
    0, 1,
    '[]', '[]', NULL, 'F93EF6XC'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'fdecde5f-d43b-4fd1-a9c0-cca8fbe07db7', 'authenticated', 'authenticated', 'sarahayedun0571@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Sarah Anuoluwapo"}', '2026-03-07 12:57:10.543691+00', '2026-03-07 12:57:10.543691+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'fdecde5f-d43b-4fd1-a9c0-cca8fbe07db7', 'sarahayedun0571@gmail.com', 'Sarah Anuoluwapo', 'anuoluwapo', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocITM-5Vn0FBj3d57550pFRcCZnaOuFN0OfuClYc2kSTxxSpXA=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    0, false, false, 
    '2026-03-07 12:57:10.543691+00', '2026-03-07 12:57:10.543691+00', 
    0, 1,
    '[]', '[]', NULL, '3547B283'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ff960257-521e-47dd-bc20-b15b94f6f742', 'authenticated', 'authenticated', 'ifeoluwasamwell25@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Samuel Ifeoluwa"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ff960257-521e-47dd-bc20-b15b94f6f742', 'ifeoluwasamwell25@gmail.com', 'Samuel Ifeoluwa', NULL, 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ4qD1g3STWDLRRJJ1a1G1yaG-j9JjxW-p8cByAx15fOC-P-Q=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'EB2XA122'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    'ffdc5d9c-1a4d-4ae5-9c17-e08d7251846b', 'authenticated', 'authenticated', 'jadesolakajeyale@gmail.com', 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    '{"provider": "google", "providers": ["google"]}', '{"full_name": "Jadesola Kajeyale"}', '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    'ffdc5d9c-1a4d-4ae5-9c17-e08d7251846b', 'jadesolakajeyale@gmail.com', 'Jadesola Kajeyale', 'jade', 
    'student', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocLLkfX0-7rGb42rXdy9a9LFJdg5SNCygjmmImbJRKpC45VjFFh1=s96-c', 
    NULL, NULL, NULL, 
    NULL, NULL, '[]', 
    NULL, NULL, NULL, 
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    10, false, false, 
    '2026-02-21 11:36:56.862439+00', '2026-02-21 11:36:56.862439+00', 
    0, 1,
    '[]', '[]', NULL, 'D4XBBD23'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;
COMMIT;