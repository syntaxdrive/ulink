-- Remove emails from gold tick list
DELETE FROM public.gold_verified_users
WHERE email IN (
    -- ADD EMAIL ADDRESSES HERE to remove gold ticks
    'user@example.com'
);

-- Show remaining gold tick users
SELECT 
    '🟡 GOLD TICK' as badge,
    p.name,
    p.email
FROM public.profiles p
JOIN public.gold_verified_users g ON p.email = g.email
ORDER BY p.name;
