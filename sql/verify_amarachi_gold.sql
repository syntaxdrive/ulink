-- ============================================
-- GOLD TICK VERIFICATION + ADMIN ACCESS
-- For: amarachimunachi37@gmail.com
-- ============================================

-- Ensure the gold_verified_users table exists
CREATE TABLE IF NOT EXISTS public.gold_verified_users (
    email text PRIMARY KEY,
    added_at timestamp DEFAULT now()
);

-- Add amarachimunachi37@gmail.com to gold tick list
INSERT INTO public.gold_verified_users (email)
VALUES ('amarachimunachi37@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Grant admin privileges, verification, and gold tick
UPDATE public.profiles
SET 
    is_admin = true,
    is_verified = true
WHERE email = 'amarachimunachi37@gmail.com';

-- Verify the update
SELECT 
    '🟡 GOLD TICK + 👑 ADMIN' as status,
    p.id,
    p.name,
    p.email,
    p.university,
    p.is_admin,
    p.is_verified,
    g.added_at as gold_tick_added
FROM public.profiles p
LEFT JOIN public.gold_verified_users g ON p.email = g.email
WHERE p.email = 'amarachimunachi37@gmail.com';
