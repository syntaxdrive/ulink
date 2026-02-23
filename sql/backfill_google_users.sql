-- ============================================================
-- BACKFILL GOOGLE USERS INTO PROFILES
-- Ensures every authenticated user appears in the network,
-- even if they never completed their profile setup.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- 1. Backfill any auth.users who don't yet have a profiles row
INSERT INTO public.profiles (id, email, name, role, avatar_url)
SELECT
    u.id,
    u.email,
    COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
        NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
        split_part(u.email, '@', 1)   -- fallback: use part before @
    ),
    COALESCE(NULLIF(u.raw_user_meta_data->>'role', ''), 'student'),
    COALESCE(
        NULLIF(u.raw_user_meta_data->>'avatar_url', ''),
        NULLIF(u.raw_user_meta_data->>'picture', '')   -- Google OAuth uses 'picture'
    )
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 2. Update the trigger so future Google sign-ups also get name + picture correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, university, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
            NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'student'),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'university'), ''),
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
            NULLIF(NEW.raw_user_meta_data->>'picture', '')   -- Google OAuth
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- 3. Also update get_suggested_connections to NOT filter by role='student',
--    so org accounts and incomplete profiles are still visible
DROP FUNCTION IF EXISTS public.get_suggested_connections(uuid);
CREATE OR REPLACE FUNCTION public.get_suggested_connections(current_user_id uuid)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT * FROM public.profiles
    WHERE id != current_user_id
    AND id NOT IN (
        SELECT recipient_id FROM public.connections WHERE requester_id = current_user_id
        UNION
        SELECT requester_id FROM public.connections WHERE recipient_id = current_user_id
    )
    ORDER BY
        CASE WHEN is_verified = true THEN 0 ELSE 1 END,
        CASE WHEN university = (SELECT university FROM profiles WHERE id = current_user_id) THEN 0 ELSE 1 END,
        random()
    LIMIT 60;
$$;

-- 4. Update search_all_users to also match email prefix (helpful for incomplete profiles)
DROP FUNCTION IF EXISTS public.search_all_users(uuid, text);
CREATE OR REPLACE FUNCTION public.search_all_users(
    current_user_id uuid,
    search_query text
)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT * FROM public.profiles
    WHERE id != current_user_id
    AND (
        name ILIKE '%' || search_query || '%'
        OR email ILIKE '%' || search_query || '%'
        OR university ILIKE '%' || search_query || '%'
        OR headline ILIKE '%' || search_query || '%'
        OR username ILIKE '%' || search_query || '%'
    )
    ORDER BY
        CASE WHEN LOWER(name) = LOWER(search_query) THEN 0 ELSE 1 END,
        CASE WHEN is_verified = true THEN 0 ELSE 1 END,
        CASE WHEN university = (SELECT university FROM profiles WHERE id = current_user_id) THEN 0 ELSE 1 END,
        name ASC
    LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.get_suggested_connections(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_all_users(uuid, text) TO authenticated;
