-- ============================================
-- SIMPLE LIST - All Verified Users
-- ============================================

-- Combined list with badge type
SELECT 
    CASE 
        WHEN g.email IS NOT NULL THEN '🟡 Gold'
        WHEN p.is_verified = true THEN '🔵 Blue'
        ELSE 'None'
    END as badge,
    p.name,
    p.email,
    p.university,
    p.role
FROM public.profiles p
LEFT JOIN public.gold_verified_users g ON p.email = g.email
WHERE p.is_verified = true OR g.email IS NOT NULL
ORDER BY 
    CASE 
        WHEN g.email IS NOT NULL THEN 1  -- Gold first
        WHEN p.is_verified = true THEN 2  -- Blue second
    END,
    p.name;
