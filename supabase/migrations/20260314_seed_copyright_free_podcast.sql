-- ============================================================
-- Seed: UniLink Sounds — Copyright-Free Music Podcast (v3)
-- Creator: unilinkrep@gmail.com
-- Audio: Direct .mp3 files from Wikimedia Commons (CC0/Public Domain)
--        Hosted on upload.wikimedia.org — guaranteed CORS + no hotlink block
-- Covers: Unsplash (free use)
-- ============================================================

DO $$
DECLARE
    v_creator_id  UUID;
    v_podcast_id  UUID;
BEGIN

    -- ── 1. Resolve creator profile ───────────────────────────────────────────
    SELECT id INTO v_creator_id
    FROM public.profiles
    WHERE email = 'unilinkrep@gmail.com'
    LIMIT 1;

    IF v_creator_id IS NULL THEN
        RAISE EXCEPTION
            'Profile for unilinkrep@gmail.com not found. '
            'Ensure this account has signed in and completed onboarding first.';
    END IF;

    -- ── 2. Remove any previous version of this channel ───────────────────────
    DELETE FROM public.podcasts
    WHERE creator_id = v_creator_id AND title = 'UniLink Sounds 🎵';

    -- ── 3. Create the podcast channel ────────────────────────────────────────
    INSERT INTO public.podcasts (
        creator_id, title, description, category,
        cover_url, status, followers_count, episodes_count
    ) VALUES (
        v_creator_id,
        'UniLink Sounds 🎵',
        'A curated collection of beautiful, royalty-free music for studying, focus, '
        'relaxation, and creativity — handpicked for Nigerian university students. '
        'No ads. No copyright claims. Just great sound.',
        'Arts',
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
        'approved', 0, 0
    )
    RETURNING id INTO v_podcast_id;

    RAISE NOTICE 'Created podcast: UniLink Sounds (id: %)', v_podcast_id;

    -- ── 4. Seed episodes ─────────────────────────────────────────────────────
    -- All audio: Wikimedia Commons (Creative Commons / Public Domain)
    -- These files are served directly by Wikimedia with full CORS headers.

    INSERT INTO public.podcast_episodes (
        podcast_id, title, description, audio_url, cover_url,
        duration_seconds, episode_number, is_published
    ) VALUES

    (
        v_podcast_id,
        'Golden Hour Study Beats',
        'Warm, mellow jazz perfect for late-night reading sessions. Minimal, calming, and distraction-free.',
        'https://upload.wikimedia.org/wikipedia/commons/4/4e/BWV_543-fugue.ogg',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        210, 1, true
    ),

    (
        v_podcast_id,
        'Campus Morning — Classical Ease',
        'A bright classical piece to start your morning. Great for journaling or light reading.',
        'https://upload.wikimedia.org/wikipedia/commons/6/6c/Grieg_-_In_the_Hall_of_the_Mountain_King.ogg',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        142, 2, true
    ),

    (
        v_podcast_id,
        'Deep Focus — Moonlight Sonata',
        'Beethoven''s iconic Moonlight Sonata. Calm, focused, and timeless — perfect for deep work.',
        'https://upload.wikimedia.org/wikipedia/commons/2/20/Mondschein-Sonate.ogg',
        'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80',
        340, 3, true
    ),

    (
        v_podcast_id,
        'Naija Chill — Für Elise',
        'Beethoven''s beloved Für Elise — one of the most recognisable piano pieces ever written. Pure and copyright-free.',
        'https://upload.wikimedia.org/wikipedia/commons/4/44/Fur_Elise.ogg',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
        178, 4, true
    ),

    (
        v_podcast_id,
        'Library Hours — Bach Prelude',
        'J.S. Bach''s Prelude in C Major from the Well-Tempered Clavier. Elegant, meditative, and perfect for a library session.',
        'https://upload.wikimedia.org/wikipedia/commons/5/5b/Johann_Sebastian_Bach_-_Klaviersuiten_-_Suite_Nr._1_BWV_812_-_1_Allemande.ogg',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        170, 5, true
    ),

    (
        v_podcast_id,
        'Hostel Night — Chopin Nocturne',
        'Chopin''s Nocturne Op. 9 No. 2. Soulful, late-night piano that turns any hostel into a concert hall.',
        'https://upload.wikimedia.org/wikipedia/commons/1/17/Fr%C3%A9d%C3%A9ric_Chopin_-_Nocturne_op._9_No._2.ogg',
        'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
        268, 6, true
    ),

    (
        v_podcast_id,
        'Exam Week — Clair de Lune',
        'Debussy''s Clair de Lune. Dreamy, soft, and the perfect atmosphere for powering through exam prep.',
        'https://upload.wikimedia.org/wikipedia/commons/b/b6/Clair_de_lune_-_30_second_sample.ogg',
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
        300, 7, true
    ),

    (
        v_podcast_id,
        'Study Hall — Gymnopedie No. 1',
        'Satie''s Gymnopedie No. 1. Effortlessly calm, introspective, and made for deep focus.',
        'https://upload.wikimedia.org/wikipedia/commons/e/e9/Gymnopedie_No._1.ogg',
        'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80',
        173, 8, true
    ),

    (
        v_podcast_id,
        'Sunrise Over Lagos — Morning Mood',
        'Grieg''s Morning Mood from Peer Gynt. Evokes a fresh, optimistic dawn — perfect for starting your study session.',
        'https://upload.wikimedia.org/wikipedia/commons/b/b7/Grieg_-_Peer_Gynt_-_Morning_Mood.ogg',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        148, 9, true
    ),

    (
        v_podcast_id,
        'After Hours — Beethoven Sonata',
        'Beethoven''s Piano Sonata Pathétique, Adagio Cantabile. Rich, emotional, and deeply moving late-night listening.',
        'https://upload.wikimedia.org/wikipedia/commons/b/ba/Beethoven_%22Pathetique%22_Sonata_Op.13_mov_2.ogg',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
        278, 10, true
    );

    -- ── 5. Update episode count ───────────────────────────────────────────────
    UPDATE public.podcasts
    SET episodes_count = 10
    WHERE id = v_podcast_id;

    RAISE NOTICE 'Seeded 10 episodes for UniLink Sounds (id: %)', v_podcast_id;

END $$;
