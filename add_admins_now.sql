-- QUICK ADMIN SETUP
-- Run this in Supabase SQL Editor to grant admin access and gold badges
-- to oyasordaniel@gmail.com, akeledivine1@gmail.com, and amarachimunachi37@gmail.com

-- 1. Grant Admin Status
UPDATE public.profiles
SET is_admin = TRUE
WHERE email IN (
    'oyasordaniel@gmail.com',
    'akeledivine1@gmail.com',
    'amarachimunachi37@gmail.com'
);

-- 2. Grant Gold Verification
INSERT INTO public.gold_verified_users (user_id, verified_by, reason, created_at)
SELECT 
    p.id,
    p.id,
    'System administrator with elevated privileges',
    NOW()
FROM public.profiles p
WHERE p.email IN (
    'oyasordaniel@gmail.com',
    'akeledivine1@gmail.com',
    'amarachimunachi37@gmail.com'
)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Verify Results
SELECT 
    email,
    name,
    is_admin,
    EXISTS (SELECT 1 FROM public.gold_verified_users WHERE user_id = profiles.id) as gold_verified
FROM public.profiles
WHERE email IN (
    'oyasordaniel@gmail.com',
    'akeledivine1@gmail.com',
    'amarachimunachi37@gmail.com'
);
