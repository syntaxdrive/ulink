-- ============================================
-- GOLD TICK VERIFICATION (Founders/Co-founders)
-- ============================================
-- Users in this list get GOLD verification badges

-- Create a simple table to track gold tick users
CREATE TABLE IF NOT EXISTS public.gold_verified_users (
    email text PRIMARY KEY,
    added_at timestamp DEFAULT now()
);

-- Add emails to gold tick list
INSERT INTO public.gold_verified_users (email)
VALUES
    ('founder@example.com')  -- Replace with actual founder email
    -- Add more founder emails below (comma-separated)
    -- ('cofounder@example.com'),
    -- ('another-founder@example.com')
ON CONFLICT (email) DO NOTHING;

-- Also mark them as verified in profiles
UPDATE public.profiles
SET is_verified = true
WHERE email IN (SELECT email FROM public.gold_verified_users);

-- Show all gold tick users
SELECT p.id, p.name, p.email, g.added_at
FROM public.profiles p
JOIN public.gold_verified_users g ON p.email = g.email
ORDER BY p.name;
