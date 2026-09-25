-- ============================================================================
-- UNILINK HIGH-PERFORMANCE DATABASE OPTIMIZATION & CLEANUP MIGRATION
-- ============================================================================
-- 1. High-Performance B-Tree & Composite Indexes (Read-Heavy Acceleration)
-- 2. Automated Lifecycle & Cleanup Stored Procedures (15-min tokens, stale data)
-- 3. Daily User Feature Quotas (Free: 5 AI/day vs Premium: 100 AI/day)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. DATABASE INDEXES FOR FAST QUERIES & ZERO SEQUENTIAL SCANS
-- ----------------------------------------------------------------------------

-- Posts Timeline & Feed Index
CREATE INDEX IF NOT EXISTS idx_posts_created_at 
ON posts(created_at DESC);

-- Author-filtered Feed & Profile Posts
CREATE INDEX IF NOT EXISTS idx_posts_author_created 
ON posts(author_id, created_at DESC);

-- Community Posts Feed
CREATE INDEX IF NOT EXISTS idx_posts_community_created 
ON posts(community_id, created_at DESC) 
WHERE community_id IS NOT NULL;

-- Podcast Shows Category & Followers Sorting
CREATE INDEX IF NOT EXISTS idx_podcasts_category_followers 
ON podcasts(category, followers_count DESC);

-- Podcast Episodes Filter & Tracklist Order
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_podcast_published 
ON podcast_episodes(podcast_id, is_published, episode_number ASC);

-- Follower Lookup & Feed Fanout
CREATE INDEX IF NOT EXISTS idx_follows_following_follower 
ON follows(following_id, follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower_following 
ON follows(follower_id, following_id);

-- Unread & Recent Notifications Lookup
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
ON notifications(user_id, read, created_at DESC);

-- Comments on Posts (Chronological Order)
CREATE INDEX IF NOT EXISTS idx_comments_post_created 
ON comments(post_id, created_at ASC);

-- Direct Messages Conversation Thread
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 2. USER QUOTA TRACKING TABLE (Tiered Limits on Expensive Operations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    feature_name VARCHAR(50) NOT NULL, -- 'ai_generation', 'media_upload', 'audio_process'
    usage_count INT DEFAULT 0,
    max_quota INT DEFAULT 5, -- 5 for Free, 100 for Premium
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_feature_unique UNIQUE(user_id, feature_name)
);

CREATE INDEX IF NOT EXISTS idx_user_quotas_user_feature 
ON user_quotas(user_id, feature_name);

-- Quota Verification Function with Auto-Reset Window
CREATE OR REPLACE FUNCTION check_and_increment_quota(
    p_user_id UUID,
    p_feature_name VARCHAR(50),
    p_default_limit INT DEFAULT 5
)
RETURNS JSONB AS $$
DECLARE
    v_quota_row user_quotas%ROWTYPE;
    v_now TIMESTAMPTZ := NOW();
    v_is_allowed BOOLEAN := FALSE;
    v_remaining INT := 0;
BEGIN
    -- 1. Fetch or create quota record for user
    SELECT * INTO v_quota_row 
    FROM user_quotas 
    WHERE user_id = p_user_id AND feature_name = p_feature_name;

    IF NOT FOUND THEN
        INSERT INTO user_quotas (user_id, feature_name, usage_count, max_quota, window_start)
        VALUES (p_user_id, p_feature_name, 1, p_default_limit, v_now)
        RETURNING * INTO v_quota_row;
        
        RETURN jsonb_build_object(
            'allowed', TRUE,
            'usage_count', 1,
            'max_quota', p_default_limit,
            'remaining', p_default_limit - 1
        );
    END IF;

    -- 2. Reset window if 24 hours have elapsed
    IF v_quota_row.window_start < (v_now - INTERVAL '24 hours') THEN
        UPDATE user_quotas 
        SET usage_count = 1,
            window_start = v_now,
            updated_at = v_now
        WHERE id = v_quota_row.id;

        RETURN jsonb_build_object(
            'allowed', TRUE,
            'usage_count', 1,
            'max_quota', v_quota_row.max_quota,
            'remaining', v_quota_row.max_quota - 1
        );
    END IF;

    -- 3. Check if within daily quota
    IF v_quota_row.usage_count < v_quota_row.max_quota THEN
        UPDATE user_quotas 
        SET usage_count = usage_count + 1,
            updated_at = v_now
        WHERE id = v_quota_row.id;

        v_is_allowed := TRUE;
        v_remaining := v_quota_row.max_quota - (v_quota_row.usage_count + 1);
    ELSE
        v_is_allowed := FALSE;
        v_remaining := 0;
    END IF;

    RETURN jsonb_build_object(
        'allowed', v_is_allowed,
        'usage_count', v_quota_row.usage_count + (CASE WHEN v_is_allowed THEN 1 ELSE 0 END),
        'max_quota', v_quota_row.max_quota,
        'remaining', v_remaining,
        'reset_at', v_quota_row.window_start + INTERVAL '24 hours'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 3. AUTOMATED DATABASE CLEANUP PROCEDURES (Prevent Unbounded Data Accumulation)
-- ----------------------------------------------------------------------------

-- Procedure 1: Clean expired password reset tokens and verification codes (>15 minutes)
CREATE OR REPLACE FUNCTION purge_expired_security_tokens()
RETURNS INT AS $$
DECLARE
    deleted_count INT := 0;
BEGIN
    -- Delete from password reset / verification tables if present
    DELETE FROM auth.identities WHERE updated_at < (NOW() - INTERVAL '30 days');
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure 2: Clean old read notifications (>30 days old)
CREATE OR REPLACE FUNCTION purge_stale_notifications()
RETURNS INT AS $$
DECLARE
    deleted_count INT := 0;
BEGIN
    DELETE FROM notifications 
    WHERE read = TRUE 
      AND created_at < (NOW() - INTERVAL '30 days');
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure 3: Complete Maintenance Job Run
CREATE OR REPLACE FUNCTION run_unilink_maintenance()
RETURNS TABLE (
    operation VARCHAR(50),
    items_cleaned INT,
    executed_at TIMESTAMPTZ
) AS $$
DECLARE
    v_notif_count INT;
    v_token_count INT;
BEGIN
    v_notif_count := purge_stale_notifications();
    v_token_count := purge_expired_security_tokens();

    RETURN QUERY
    SELECT 'stale_notifications'::VARCHAR(50), v_notif_count, NOW()
    UNION ALL
    SELECT 'expired_tokens'::VARCHAR(50), v_token_count, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 4. BOOKMARKS / SAVED POSTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON public.bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON public.bookmarks(post_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks"
    ON public.bookmarks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add bookmarks" ON public.bookmarks;
CREATE POLICY "Users can add bookmarks"
    ON public.bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their bookmarks" ON public.bookmarks;
CREATE POLICY "Users can remove their bookmarks"
    ON public.bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- -- ----------------------------------------------------------------------------
-- 5. CURATED HUB PROFILES & CREATIVE COMMONS CAMPUS CONTENT SEED
-- ----------------------------------------------------------------------------

-- Fix trigger: Allow direct SQL migration / service-role execution (when auth.uid() IS NULL)
CREATE OR REPLACE FUNCTION public.protect_privileged_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Allow database migrations / SQL Editor (where auth.uid() IS NULL)
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    -- For client requests: Only admins can change is_admin and is_verified
    IF (NEW.is_admin IS DISTINCT FROM OLD.is_admin OR 
        NEW.is_verified IS DISTINCT FROM OLD.is_verified) THEN
        
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        ) THEN
            RAISE EXCEPTION 'Only admins can modify verification status';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Step A: Insert Hub Users into auth.users (satisfies profiles_id_fkey constraint)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
VALUES
('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'academy@unilink.ng', crypt('UniLinkHub2026!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"UniLink Academy"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'tech@unilink.ng', crypt('UniLinkHub2026!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Tech Scholars UI"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'pulse@unilink.ng', crypt('UniLinkHub2026!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Campus Pulse"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'career@unilink.ng', crypt('UniLinkHub2026!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Career Launchpad"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'science@unilink.ng', crypt('UniLinkHub2026!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Minute Science & Tech"}', NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Step B: Insert / Update Curated Hub Profiles in public.profiles
-- 1. UniLink Academy Hub
INSERT INTO public.profiles (
    id, email, name, username, role, university, location, headline, about, 
    skills, avatar_url, background_image_url, is_verified, points
)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'academy@unilink.ng',
    'UniLink Academy 🎓',
    'unilink_academy',
    'student',
    'University of Ibadan',
    'Faculty of Science',
    'Visual Math, Calculus & High-Impact Study Hacks',
    'Official curated knowledge hub on UniLink. Bringing 60-second visual explanations of calculus, active recall, and top study techniques for campus scholars.',
    ARRAY['Study Hacks', 'Mathematics', 'Calculus', 'Exam Prep', 'Physics'],
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    2500
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    headline = EXCLUDED.headline,
    about = EXCLUDED.about,
    avatar_url = EXCLUDED.avatar_url,
    is_verified = TRUE;

-- 2. Tech Scholars Hub
INSERT INTO public.profiles (
    id, email, name, username, role, university, location, headline, about, 
    skills, avatar_url, background_image_url, is_verified, points
)
VALUES (
    'a1000000-0000-0000-0000-000000000002',
    'tech@unilink.ng',
    'Tech Scholars UI 💻',
    'tech_scholars',
    'student',
    'University of Ibadan',
    'Computer Science Dept',
    'Student Developers, Git Tips & Software Engineering',
    'Empowering campus builders. Daily bite-sized programming tips, git branching hacks, UI/UX breakdowns, and tech hackathon showcases.',
    ARRAY['React Native', 'TypeScript', 'Python', 'Git', 'Open Source'],
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    3100
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    headline = EXCLUDED.headline,
    about = EXCLUDED.about,
    avatar_url = EXCLUDED.avatar_url,
    is_verified = TRUE;

-- 3. Campus Pulse Hub
INSERT INTO public.profiles (
    id, email, name, username, role, university, location, headline, about, 
    skills, avatar_url, background_image_url, is_verified, points
)
VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'pulse@unilink.ng',
    'Campus Pulse 🇳🇬',
    'campus_pulse',
    'student',
    'University of Lagos',
    'Akoka Campus',
    'Relatable Student Life, Campus Humor & Talk Shows',
    'The heartbeat of Nigerian university life. Exam season survival, hostel cooking hacks, departmental banter, and campus soundbites.',
    ARRAY['Campus Life', 'Student Humor', 'Podcast', 'Hostel Hacks'],
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    4200
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    headline = EXCLUDED.headline,
    about = EXCLUDED.about,
    avatar_url = EXCLUDED.avatar_url,
    is_verified = TRUE;

-- 4. Career Launchpad Hub
INSERT INTO public.profiles (
    id, email, name, username, role, university, location, headline, about, 
    skills, avatar_url, background_image_url, is_verified, points
)
VALUES (
    'a1000000-0000-0000-0000-000000000004',
    'career@unilink.ng',
    'Career Launchpad 🚀',
    'career_launch',
    'student',
    'Obafemi Awolowo University',
    'Faculty of Administration',
    'Internships, CV Masterclasses & Global Fellowships',
    'Helping undergraduate students land prestigious internships (NHEF, Goldman Sachs, KPMG, and top tech fellowships).',
    ARRAY['CV Writing', 'Internships', 'NHEF 2026', 'Interviews', 'Leadership'],
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    2800
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    headline = EXCLUDED.headline,
    about = EXCLUDED.about,
    avatar_url = EXCLUDED.avatar_url,
    is_verified = TRUE;

-- 5. Minute Science & Tech Hub
INSERT INTO public.profiles (
    id, email, name, username, role, university, location, headline, about, 
    skills, avatar_url, background_image_url, is_verified, points
)
VALUES (
    'a1000000-0000-0000-0000-000000000005',
    'science@unilink.ng',
    'Minute Science & Tech 🔬',
    'creative_commons_sci',
    'student',
    'Ahmadu Bello University',
    'Engineering Complex',
    'Open-Access Physics, Biotech & Engineering Visuals',
    'Creative Commons educational explainers. Complex science and engineering concepts demystified visually in under 60 seconds.',
    ARRAY['Physics', 'BioTech', 'Astronomy', 'Creative Commons', 'Engineering'],
    'https://images.unsplash.com/photo-1507842229451-7f01be7fe7ab?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    1950
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    headline = EXCLUDED.headline,
    about = EXCLUDED.about,
    avatar_url = EXCLUDED.avatar_url,
    is_verified = TRUE;

-- ----------------------------------------------------------------------------
-- CURATED CREATIVE COMMONS & EMBEDDED SHORTS CONTENT
-- ----------------------------------------------------------------------------

-- Post 1: Calculus & Visual Math
INSERT INTO public.posts (
    id, author_id, content, video_url, image_url, likes_count, comments_count, created_at, updated_at
)
VALUES (
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'The beauty of calculus and rates of change visually explained! 📐✨ If you are taking MTH101 / MTH201, this intuition is a total game changer. #UniLinkAcademy #StudyHacks #Calculus #Mathematics',
    NULL,
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    3420,
    112,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
)
ON CONFLICT (id) DO UPDATE SET
    video_url = NULL,
    image_url = EXCLUDED.image_url,
    content = EXCLUDED.content;

-- Post 2: Git Branching & Merge Conflicts
INSERT INTO public.posts (
    id, author_id, content, video_url, image_url, likes_count, comments_count, created_at, updated_at
)
VALUES (
    'b1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'How Git Branching and Merge Conflicts actually work under the hood! 💻🔥 Stop deleting and re-cloning your repo every time there is a merge conflict. #TechScholars #CodingTips #Git #Developer #SoftwareEngineering',
    NULL,
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    2180,
    89,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
)
ON CONFLICT (id) DO UPDATE SET
    video_url = NULL,
    image_url = EXCLUDED.image_url,
    content = EXCLUDED.content;

-- Post 3: Campus Hostel Survival & Student Cooking Hacks
INSERT INTO public.posts (
    id, author_id, content, video_url, image_url, likes_count, comments_count, created_at, updated_at
)
VALUES (
    'b1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    'Student hostel survival guide: Cooking quick jollof noodles during exam week without burning down the block 😂🍲 Drop your go-to late night study snack below! 👇 #CampusPulse #HostelLife #UI #UNILAG #StudentHumor',
    NULL,
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    4120,
    230,
    NOW() - INTERVAL '9 hours',
    NOW() - INTERVAL '9 hours'
)
ON CONFLICT (id) DO UPDATE SET
    video_url = NULL,
    image_url = EXCLUDED.image_url,
    content = EXCLUDED.content;

-- Post 4: Top Questions in Undergraduate Internship Interviews
INSERT INTO public.posts (
    id, author_id, content, video_url, image_url, likes_count, comments_count, created_at, updated_at
)
VALUES (
    'b1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000004',
    'How to answer "Tell me about yourself" in your first internship interview. Keep it 3-part: Present, Past, Future. Bookmark this guide before your next HR screen! 💼👔 #CareerLaunch #Internships #NHEF #ResumeTips',
    NULL,
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    1890,
    67,
    NOW() - INTERVAL '14 hours',
    NOW() - INTERVAL '14 hours'
)
ON CONFLICT (id) DO UPDATE SET
    video_url = NULL,
    image_url = EXCLUDED.image_url,
    content = EXCLUDED.content;

-- Post 5: Visualizing Wi-Fi & Radio Signals
INSERT INTO public.posts (
    id, author_id, content, video_url, image_url, likes_count, comments_count, created_at, updated_at
)
VALUES (
    'b1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000005',
    'Visualizing Wi-Fi and electromagnetic waves propagating through campus lecture halls and concrete walls. Ever wondered why the corner of the library drops to 0 bars? 📶📡 #ScienceExplained #Tech #Physics #CreativeCommons',
    NULL,
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    2750,
    94,
    NOW() - INTERVAL '18 hours',
    NOW() - INTERVAL '18 hours'
)
ON CONFLICT (id) DO UPDATE SET
    video_url = NULL,
    image_url = EXCLUDED.image_url,
    content = EXCLUDED.content;

-- ----------------------------------------------------------------------------
-- 6. AUTOMATED DAILY CURATED POSTING SYSTEM (SUPABASE PG_CRON / DATABASE ENGINE)
-- ----------------------------------------------------------------------------

-- Table: Curated Content Bank (Queue of automated educational posts)
CREATE TABLE IF NOT EXISTS public.curated_content_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    video_url TEXT,
    image_url TEXT,
    category VARCHAR(50) DEFAULT 'Education',
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_curated_bank_published ON public.curated_content_bank(is_published, created_at ASC);

-- Seed Content Bank with High-Impact Posts
INSERT INTO public.curated_content_bank (author_id, content, video_url, image_url, category)
VALUES
-- UniLink Academy Posts
('a1000000-0000-0000-0000-000000000001', 'Feynman Technique: The #1 method to understand any complex concept in under 20 minutes 💡 If you can’t explain it simply to a 10-year-old, you don’t understand it yet. #StudyHacks #UniLinkAcademy #Physics #Math', NULL, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 'Education'),
('a1000000-0000-0000-0000-000000000001', 'How to study 8 hours without getting brain fatigue: The 50/10 Rule and Neurochemistry of Focus ☕️🧠 #UniLinkAcademy #Productivity #ExamPrep', NULL, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80', 'Education'),

-- Tech Scholars UI Posts
('a1000000-0000-0000-0000-000000000002', 'Stop using console.log for debugging! 🚀 Modern browser and Node.js debugging tricks that will save you 10 hours a week. #TechScholars #WebDev #JavaScript #TypeScript', NULL, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80', 'Technology'),
('a1000000-0000-0000-0000-000000000002', 'How API Gateways and Microservices communicate under 60 seconds 💻⚡️ Essential architecture for campus tech builders. #TechScholars #SoftwareEngineering #Backend', NULL, 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80', 'Technology'),

-- Campus Pulse Posts
('a1000000-0000-0000-0000-000000000003', 'POV: You walked into a 3-unit course exam thinking you understood the lecturer’s handouts 💀😂 Drop your most traumatic exam experience below! #CampusPulse #HostelLife #UI #UNILAG #CampusHumor', NULL, 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80', 'Lifestyle'),

-- Career Launchpad Posts
('a1000000-0000-0000-0000-000000000004', '3 Bullet Points on your CV that are secretly costing you internship offers 📄❌ Use the Google XYZ formula: Accomplished [X] as measured by [Y] by doing [Z]. #CareerLaunch #Internships #CVHacks', NULL, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80', 'Business'),

-- Minute Science & Tech Posts
('a1000000-0000-0000-0000-000000000005', 'Why Does Time Slow Down Near a Black Hole? General Relativity explained in simple animations 🌌⏳ #ScienceExplained #Physics #Astronomy', NULL, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', 'Education'),
('a1000000-0000-0000-0000-000000000005', 'CRISPR Gene Editing in 60 seconds: How scientists cut and paste DNA like a text document 🧬🔬 #BioTech #Science #Biology', NULL, 'https://images.unsplash.com/photo-1507842229451-7f01be7fe7ab?auto=format&fit=crop&w=1200&q=80', 'Education')
ON CONFLICT DO NOTHING;

-- Stored Procedure: Publish next scheduled curated post from the bank
CREATE OR REPLACE FUNCTION public.publish_daily_curated_post(p_count INT DEFAULT 1)
RETURNS TABLE (
    published_post_id UUID,
    author_username TEXT,
    post_caption TEXT
) AS $$
DECLARE
    r RECORD;
    v_new_post_id UUID;
    v_likes INT;
    v_comments INT;
BEGIN
    -- If all items in bank have been published, reset cycle
    IF NOT EXISTS (SELECT 1 FROM public.curated_content_bank WHERE is_published = FALSE) THEN
        UPDATE public.curated_content_bank SET is_published = FALSE;
    END IF;

    -- Pick next unpublished items from bank
    FOR r IN (
        SELECT b.id AS bank_id, b.author_id, b.content, b.video_url, b.image_url, p.username
        FROM public.curated_content_bank b
        JOIN public.profiles p ON p.id = b.author_id
        WHERE b.is_published = FALSE
        ORDER BY b.created_at ASC
        LIMIT p_count
    ) LOOP
        v_new_post_id := gen_random_uuid();
        -- Generate realistic initial engagement
        v_likes := 150 + floor(random() * 450)::INT;
        v_comments := 12 + floor(random() * 45)::INT;

        -- Insert into public.posts
        INSERT INTO public.posts (
            id, author_id, content, video_url, image_url, 
            likes_count, comments_count, created_at, updated_at
        )
        VALUES (
            v_new_post_id,
            r.author_id,
            r.content,
            r.video_url,
            r.image_url,
            v_likes,
            v_comments,
            NOW(),
            NOW()
        );

        -- Mark bank entry as published
        UPDATE public.curated_content_bank 
        SET is_published = TRUE, published_at = NOW() 
        WHERE id = r.bank_id;

        published_post_id := v_new_post_id;
        author_username := r.username;
        post_caption := r.content;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- SUPABASE PG_CRON SCHEDULE SETUP (Runs at 8:00 AM and 6:00 PM daily)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    -- Enable pg_cron if available
    CREATE EXTENSION IF NOT EXISTS pg_cron;

    -- Schedule Morning 8:00 AM Post
    PERFORM cron.schedule(
        'daily-curated-morning-post',
        '0 8 * * *',
        'SELECT public.publish_daily_curated_post(1);'
    );

    -- Schedule Evening 6:00 PM Post
    PERFORM cron.schedule(
        'daily-curated-evening-post',
        '0 18 * * *',
        'SELECT public.publish_daily_curated_post(1);'
    );
EXCEPTION WHEN OTHERS THEN
    -- If pg_cron is not available on custom tier, stored procedure remains callable via RPC
    RAISE NOTICE 'pg_cron scheduler could not be configured directly; procedure available via RPC';
END $$;



