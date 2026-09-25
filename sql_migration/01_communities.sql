-- Pack 1: Communities
BEGIN;

INSERT INTO public.communities (id, name, slug, description, icon_url, banner_url, created_by, created_at)
VALUES ('1806568e-46bb-423a-b1a2-85528d9a9437', 'Google Dev Group', 'google-dev-group', NULL, NULL, NULL, '8798340d-7df4-4160-942a-5d222ea427b6', '2026-02-21 14:14:25.660157+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.communities (id, name, slug, description, icon_url, banner_url, created_by, created_at)
VALUES ('74ce135a-1464-473e-94d7-28cfb2071e32', 'official uniLink', 'official-unilink', 'JOIN THE UNILINK TEAM', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/community-images/community-icons/official-unilink-1772207273974.jpg', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/community-images/community-covers/official-unilink-1772207275406.jpg', '8798340d-7df4-4160-942a-5d222ea427b6', '2026-02-18 11:05:56.258741+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.communities (id, name, slug, description, icon_url, banner_url, created_by, created_at)
VALUES ('c3614a5a-8e67-47a2-868b-d54360025fab', 'JOB SEEKING GRADUATES', 'job-seeking-graduates', 'The name says it all.', NULL, NULL, '839042fd-c42a-47cf-84c8-b0ea72e446bc', '2026-02-24 22:07:00.376068+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.communities (id, name, slug, description, icon_url, banner_url, created_by, created_at)
VALUES ('dbec786b-5de4-4576-a678-0b0541ef15e4', 'unilinkng', 'unilinknigeria', NULL, NULL, NULL, 'd8484a31-77d6-49c3-b433-98614c8a71a0', '2026-02-28 11:32:48.151124+00')
ON CONFLICT (id) DO NOTHING;
COMMIT;