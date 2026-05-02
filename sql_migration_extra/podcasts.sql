-- Fully-Provisioned Migration for public.podcasts
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

DO $$ 
BEGIN
    INSERT INTO public.podcasts (id, creator_id, title, description, cover_url, category, created_at) VALUES ('138f0207-8016-4ed2-8dd6-ee11112b4c0e', '27d1ad60-6d73-439d-b4b2-4a1827371c24', 'The Mandela Effect', NULL, 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/podcast-covers/1775209580027-mjs7jx1zmnf.jpg', 'Education', '2026-04-03 09:46:36.86806+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcasts (id, creator_id, title, description, cover_url, category, created_at) VALUES ('ed31f1c6-ed6a-4d8e-ae09-2703f8c1295b', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'UniLink Sounds 🎵', 'A curated collection of beautiful, royalty-free music for studying, focus, relaxation, and creativity — handpicked for Nigerian university students. No ads. No copyright claims. Just great sound.', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80', 'Arts', '2026-03-14 22:28:18.611239+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.podcasts (id, creator_id, title, description, cover_url, category, created_at) VALUES ('edb1a6c3-ef7e-4f10-9550-8c1ca8985aa0', '8798340d-7df4-4160-942a-5d222ea427b6', 'THE BLISSFUL CAST', 'start your day beautifully', 'https://res.cloudinary.com/dh5odmxyi/image/upload/v1773171556/ulink/podcasts/covers/istockphoto-1040334020-612x612_r5xcly.webp', 'Other', '2026-03-10 18:29:26.522949+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
COMMIT;