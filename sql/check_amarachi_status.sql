-- Check current status of amarachimunachi37@gmail.com
SELECT 
    p.id,
    p.name,
    p.email,
    p.is_admin,
    p.is_verified,
    p.role_type,
    CASE 
        WHEN g.email IS NOT NULL THEN 'YES - Gold Verified'
        ELSE 'NO - Not in gold_verified_users table'
    END as gold_tick_status
FROM public.profiles p
LEFT JOIN public.gold_verified_users g ON p.email = g.email
WHERE p.email = 'amarachimunachi37@gmail.com';
