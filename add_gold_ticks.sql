-- ============================================
-- GOLD TICK VERIFICATION
-- ============================================
-- Add any email address here to give them a GOLD verification badge
-- Just add emails to the list and run this script

-- First, ensure the gold_verified_users table exists
CREATE TABLE IF NOT EXISTS public.gold_verified_users (
    email text PRIMARY KEY,
    added_at timestamp DEFAULT now()
);

-- Add emails to gold tick list
INSERT INTO public.gold_verified_users (email)
VALUES
    -- ADD EMAIL ADDRESSES HERE (one per line, comma-separated)
    ('oguntoyinboesther3@gmail.com'),
    ('olayiwolamary1710@gmail.com'),
    ('adetolaadeyinka2@gmail.com'),
    ('amarachimunachi37@gmail.com'),
    ('sahirah648@gmail.com'),
    ('oluwadamisi012@gmail.com'),
    ('akeledivine')
    -- Add more emails above this line
    -- Example: ('newemail@example.com'),
ON CONFLICT (email) DO NOTHING;

-- Also mark them as verified in profiles
UPDATE public.profiles
SET is_verified = true
WHERE email IN (SELECT email FROM public.gold_verified_users);

-- Show all gold tick users
SELECT 
    '🟡 GOLD TICK' as badge,
    p.name,
    p.email,
    p.university,
    g.added_at
FROM public.profiles p
JOIN public.gold_verified_users g ON p.email = g.email
ORDER BY p.name;
