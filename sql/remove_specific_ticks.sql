-- Remove blue ticks from specific users
UPDATE public.profiles
SET is_verified = false
WHERE email IN (
    'oyasordaniel@gmail.com',
    'akeledivine1@gmail.com'
);

-- Verify the removal
SELECT id, name, email, is_verified
FROM public.profiles
WHERE email IN (
    'oyasordaniel@gmail.com',
    'akeledivine1@gmail.com'
);
