-- Create Admin Account for receiving reports and moderation
-- This account will receive all reports and have special privileges

-- First, you need to create the admin user in Supabase Auth dashboard
-- Then run this SQL to set up their profile

-- Replace 'admin@unilink.ng' with the actual admin email
-- Replace 'ADMIN_USER_ID' with the actual user ID from auth.users

UPDATE public.profiles
SET 
    role_type = 'admin',
    is_verified = true,
    name = 'UniLink Admin',
    university = 'UniLink HQ'
WHERE email = 'admin@unilink.ng';  -- Replace with actual admin email

-- OR if you know the user ID:
-- UPDATE public.profiles
-- SET role_type = 'admin', is_verified = true
-- WHERE id = 'ADMIN_USER_ID';

-- Verify admin account
SELECT id, name, email, role_type, is_verified
FROM public.profiles
WHERE role_type = 'admin';

-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Invite User" or "Add User"
-- 3. Create user with email: admin@unilink.ng (or your chosen email)
-- 4. Set a strong password
-- 5. Copy the user ID
-- 6. Run this SQL with the correct email/ID
