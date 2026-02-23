-- ============================================================
-- MARK SEED/TEST USERS — HIDE FROM ALL QUERIES
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add the column (safe to run multiple times)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_test_user boolean DEFAULT false;

-- 2. Mark the 12 seeded fake accounts
-- Primary: match by username (stored directly in profiles — most reliable)
UPDATE public.profiles
SET is_test_user = true
WHERE username IN (
    'chidi_okonkwo', 'amara_writes', 'tunde_codes', 'ngozi_builders',
    'emekatech', 'fatima_finance', 'davidosei_art', 'blessings_med',
    'ibrahim_econ', 'adaeze_fashion', 'seun_sports', 'chisom_biz'
);

-- Also match via auth.users email join (catches any that have a different username)
UPDATE public.profiles p
SET is_test_user = true
FROM auth.users u
WHERE p.id = u.id
  AND u.email IN (
    'chidiokonkwo@gmail.com', 'amaraeze@gmail.com', 'tundeadeyemi@gmail.com',
    'ngoziobi@gmail.com', 'emekanwosu@gmail.com', 'fatimabello@gmail.com',
    'davidosei@gmail.com', 'blessingpeter@gmail.com', 'ibrahimmusa@gmail.com',
    'adaezenwofor@gmail.com', 'seunadesanya@gmail.com', 'chisomokeke@gmail.com'
);

-- Also match directly on profiles.email
UPDATE public.profiles
SET is_test_user = true
WHERE email IN (
    'chidiokonkwo@gmail.com', 'amaraeze@gmail.com', 'tundeadeyemi@gmail.com',
    'ngoziobi@gmail.com', 'emekanwosu@gmail.com', 'fatimabello@gmail.com',
    'davidosei@gmail.com', 'blessingpeter@gmail.com', 'ibrahimmusa@gmail.com',
    'adaezenwofor@gmail.com', 'seunadesanya@gmail.com', 'chisomokeke@gmail.com'
);

-- 3. get_suggested_connections — exclude test users
DROP FUNCTION IF EXISTS public.get_suggested_connections(uuid);
CREATE FUNCTION public.get_suggested_connections(current_user_id uuid)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT * FROM public.profiles
    WHERE id != current_user_id
    AND COALESCE(is_test_user, false) = false
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

-- 4. search_all_users — exclude test users
DROP FUNCTION IF EXISTS public.search_all_users(uuid, text);
CREATE FUNCTION public.search_all_users(
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
    AND COALESCE(is_test_user, false) = false
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

-- 5. get_suggested_orgs — exclude test users
CREATE OR REPLACE FUNCTION public.get_suggested_orgs(current_user_id uuid)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
AS $$
    SELECT * FROM public.profiles
    WHERE role = 'org'
    AND id != current_user_id
    AND COALESCE(is_test_user, false) = false
    AND id NOT IN (
        SELECT recipient_id FROM public.connections WHERE requester_id = current_user_id
        UNION
        SELECT requester_id FROM public.connections WHERE recipient_id = current_user_id
    )
    ORDER BY
        CASE WHEN is_verified = true THEN 0 ELSE 1 END,
        random()
    LIMIT 10;
$$;

-- 6. search_talent — exclude test users
CREATE OR REPLACE FUNCTION public.search_talent(search_query text)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
AS $$
    SELECT * FROM public.profiles
    WHERE role = 'student'
    AND COALESCE(is_test_user, false) = false
    AND (
        name ILIKE '%' || search_query || '%'
        OR headline ILIKE '%' || search_query || '%'
        OR EXISTS (SELECT 1 FROM unnest(skills) s WHERE s ILIKE '%' || search_query || '%')
    )
    ORDER BY
        CASE WHEN is_verified = true THEN 0 ELSE 1 END,
        name ASC
    LIMIT 50;
$$;

-- 7. get_smart_feed — exclude posts authored by test users
CREATE OR REPLACE FUNCTION public.get_smart_feed(
    current_user_id uuid,
    limit_count int DEFAULT 20,
    offset_count int DEFAULT 0
)
RETURNS SETOF public.posts
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    my_uni text;
BEGIN
    SELECT university INTO my_uni FROM public.profiles WHERE id = current_user_id;

    RETURN QUERY
    SELECT p.* FROM public.posts p
    JOIN public.profiles author ON p.author_id = author.id
    WHERE
        COALESCE(author.is_test_user, false) = false
        AND (
            -- Condition A: Is my Connection
            p.author_id IN (
                SELECT requester_id FROM connections WHERE recipient_id = current_user_id AND status = 'accepted'
                UNION
                SELECT recipient_id FROM connections WHERE requester_id = current_user_id AND status = 'accepted'
            )
            OR
            -- Condition B: From my University
            (my_uni IS NOT NULL AND author.university = my_uni)
            OR
            -- Condition C: Global Verified Discovery (recent only)
            (author.is_verified = true AND p.created_at > (now() - interval '7 days'))
            OR
            -- Condition D: Own posts
            p.author_id = current_user_id
        )
    ORDER BY p.created_at DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION public.get_suggested_connections(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_all_users(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_suggested_orgs(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_talent(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_smart_feed(uuid, int, int) TO authenticated;

-- 8. Verify — should show is_test_user = true for all 12
SELECT p.name, u.email, p.is_test_user
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN (
    'chidiokonkwo@gmail.com', 'amaraeze@gmail.com', 'tundeadeyemi@gmail.com',
    'ngoziobi@gmail.com', 'emekanwosu@gmail.com', 'fatimabello@gmail.com',
    'davidosei@gmail.com', 'blessingpeter@gmail.com', 'ibrahimmusa@gmail.com',
    'adaezenwofor@gmail.com', 'seunadesanya@gmail.com', 'chisomokeke@gmail.com'
);
