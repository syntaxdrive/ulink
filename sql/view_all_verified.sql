-- ============================================
-- VIEW ALL VERIFIED USERS (Blue & Gold Ticks)
-- ============================================

-- All users with blue ticks (verified but not gold)
SELECT 
    '🔵 BLUE TICK' as badge_type,
    p.name,
    p.email,
    p.university,
    p.created_at
FROM public.profiles p
LEFT JOIN public.gold_verified_users g ON p.email = g.email
WHERE p.is_verified = true 
  AND g.email IS NULL  -- Not in gold list
ORDER BY p.name;

-- Separator
SELECT '---' as separator, '---' as name, '---' as email, '---' as university, null as created_at;

-- All users with gold ticks (founders)
SELECT 
    '🟡 GOLD TICK' as badge_type,
    p.name,
    p.email,
    p.university,
    p.created_at
FROM public.profiles p
JOIN public.gold_verified_users g ON p.email = g.email
ORDER BY p.name;

-- Summary count
SELECT '---' as separator, '---' as name, '---' as email, '---' as university, null as created_at;

SELECT 
    'SUMMARY' as badge_type,
    COUNT(*) FILTER (WHERE g.email IS NULL AND p.is_verified = true) as blue_tick_count,
    COUNT(*) FILTER (WHERE g.email IS NOT NULL) as gold_tick_count,
    COUNT(*) FILTER (WHERE p.is_verified = true OR g.email IS NOT NULL) as total_verified
FROM public.profiles p
LEFT JOIN public.gold_verified_users g ON p.email = g.email;
