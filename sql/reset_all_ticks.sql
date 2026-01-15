-- ============================================
-- RESET ALL VERIFICATION BADGES
-- ============================================
-- This will clear ALL existing verification badges
-- Run this first to start fresh

-- 1. Clear all gold tick users
DELETE FROM public.gold_verified_users;

-- 2. Remove all verification from profiles
UPDATE public.profiles
SET is_verified = false;

-- 3. Verify everything is cleared
SELECT 'Gold tick users (should be 0):' as status, COUNT(*) as count
FROM public.gold_verified_users
UNION ALL
SELECT 'Verified profiles (should be 0):' as status, COUNT(*) as count
FROM public.profiles
WHERE is_verified = true;

-- Done! Now you can run add_gold_ticks.sql to add fresh gold ticks
