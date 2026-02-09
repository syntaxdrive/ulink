-- Make User Admin by Email
UPDATE profiles
SET is_admin = true
WHERE email = 'amarachimunachi37@gmail.com';

-- Verify the user is now an admin
SELECT id, email, is_admin FROM profiles WHERE email = 'amarachimunachi37@gmail.com';
