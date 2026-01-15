-- ============================================
-- BLUE TICK VERIFICATION
-- ============================================
-- Users in this list get BLUE verification badges

UPDATE public.profiles
SET is_verified = true
WHERE email IN (
    -- ADD EMAIL ADDRESSES HERE (one per line, comma-separated)
    'adetolaadeyinka2@gmail.com',
    'oluwadamisi012@gmail.com',
    'amarachimunachi37@gmail.com',
    'sahirah648@gmail.com',
    'oguntoyinboesther3@gmail.com',
    'olayiwolamary1710@gmail.com'
    -- Add more emails above this line
);

-- Show all blue tick users
SELECT id, name, email, is_verified
FROM public.profiles
WHERE is_verified = true
ORDER BY name;
