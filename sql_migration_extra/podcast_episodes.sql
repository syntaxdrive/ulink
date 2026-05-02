-- Fully-Provisioned Migration for public.podcast_episodes
BEGIN;
CREATE TABLE IF NOT EXISTS public.podcasts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.podcast_episodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    duration INTEGER,
    plays_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('2ec13c87-861d-4019-b615-efa078634607', 'ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', 'Hostel Night — Chopin Nocturne', 'Chopin''s Nocturne Op. 9 No. 2. Soulful, late-night piano that turns any hostel into a concert hall.', 'https://upload.wikimedia.org/wikipedia/commons/1/17/Fr%C3%A9d%C3%A9ric_Chopin_-_Nocturne_op._9_No._2.ogg', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('35e6ec3c-4ba9-4b9c-a27b-e9c6d3e99c0f', 'ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', 'Golden Hour Study Beats', 'Warm, mellow jazz perfect for late-night reading sessions. Minimal, calming, and distraction-free.', 'https://upload.wikimedia.org/wikipedia/commons/4/4e/BWV_543-fugue.ogg', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('4b033d7c-9aa4-415b-9f6e-c230aa494b95', 'ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', 'Naija Chill — Für Elise', 'Beethoven''s beloved Für Elise — one of the most recognisable piano pieces ever written. Pure and copyright-free.', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Fur_Elise.ogg', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('74ee5b61-0633-4a0f-8901-f9422ed8d107', 'edb1a6c3-ef7e-4f10-9550-8c1ca8985aa0', 'the jazzy cast 1', NULL, 'https://res.cloudinary.com/dh5odmxyi/raw/upload/v1773169317/ulink/podcasts/audio/solas__1691511908_ug41cq.m4a', '2026-03-10 19:02:14.378664+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('77ddd59b-a363-4bff-bfc3-6507608bdcd0', 'ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', 'Campus Morning — Classical Ease', 'A bright classical piece to start your morning. Great for journaling or light reading.', 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Grieg_-_In_the_Hall_of_the_Mountain_King.ogg', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('7b7c2030-1e7d-4e6a-aa6d-39aab020c221', 'ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', 'After Hours — Beethoven Sonata', 'Beethoven''s Piano Sonata Pathétique, Adagio Cantabile. Rich, emotional, and deeply moving late-night listening.', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Beethoven_%22Pathetique%22_Sonata_Op.13_mov_2.ogg', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('7fd08e94-cff2-4c70-b6a0-ae81a14b1623', 'ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', 'Sunrise Over Lagos — Morning Mood', 'Grieg''s Morning Mood from Peer Gynt. Evokes a fresh, optimistic dawn — perfect for starting your study session.', 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Grieg_-_Peer_Gynt_-_Morning_Mood.ogg', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('84060472-96b1-42b2-9bc4-cceb721b2edc', 'edb1a6c3-ef7e-4f10-9550-8c1ca8985aa0', 'Wonder by Arelius', NULL, 'https://res.cloudinary.com/dh5odmxyi/raw/upload/v1773222952/ulink/podcasts/audio/SpotiDown.App_-_Wonder_-_Arelius_cbolwo.mp3', '2026-03-11 09:55:55.424616+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('c560eb75-33dd-4864-a52d-282d0ae9b219', 'ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', 'Library Hours — Bach Prelude', 'J.S. Bach''s Prelude in C Major from the Well-Tempered Clavier. Elegant, meditative, and perfect for a library session.', 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Johann_Sebastian_Bach_-_Klaviersuiten_-_Suite_Nr._1_BWV_812_-_1_Allemande.ogg', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('d4bc51d1-6a48-4aba-93be-432b1bdc2056', 'ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', 'Deep Focus — Moonlight Sonata', 'Beethoven''s iconic Moonlight Sonata. Calm, focused, and timeless — perfect for deep work.', 'https://upload.wikimedia.org/wikipedia/commons/2/20/Mondschein-Sonate.ogg', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('d92036f7-2347-4950-af05-549be59af8e5', 'ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', 'Exam Week — Clair de Lune', 'Debussy''s Clair de Lune. Dreamy, soft, and the perfect atmosphere for powering through exam prep.', 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Clair_de_lune_-_30_second_sample.ogg', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('e6b5dac9-4bac-4d87-873c-9519e1344b8b', 'ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', 'Study Hall — Gymnopedie No. 1', 'Satie''s Gymnopedie No. 1. Effortlessly calm, introspective, and made for deep focus.', 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Gymnopedie_No._1.ogg', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcast_episodes (id, podcast_id, title, description, audio_url, created_at) VALUES ('e81c3f7d-a555-427c-88be-fca29ea9ef29', 'edb1a6c3-ef7e-4f10-9550-8c1ca8985aa0', 'New Home by Austin farwell', NULL, 'https://res.cloudinary.com/dh5odmxyi/raw/upload/v1773222778/ulink/podcasts/audio/SpotiDown.App_-_New_Home__Slowed__-_Austin_Farwell_wqo1bx.mp3', '2026-03-11 09:53:02.501496+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
COMMIT;