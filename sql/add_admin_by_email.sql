-- ADD ADMINS BY EMAIL
-- Edit the list of emails below to grant Admin Access

WITH users_to_promote AS (
    SELECT id 
    FROM auth.users 
    WHERE email IN (
        -- ADD EMAILS HERE:
        'example@ulink.com', 
        'another_admin@ulink.com'
    )
)
UPDATE public.profiles
SET 
  is_admin = true,
  is_verified = true  -- Admins get verified automatically
WHERE id IN (SELECT id FROM users_to_promote);

-- Verification Output
SELECT name, email, role, is_admin, is_verified 
FROM public.profiles 
WHERE is_admin = true;
