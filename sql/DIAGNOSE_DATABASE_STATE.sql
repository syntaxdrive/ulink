-- =====================================================
-- DIAGNOSTIC: Check Current Database State for Points System
-- =====================================================
-- Run this to figure out what's actually in your database
-- Copy/paste the results to determine next steps

-- =====================================================
-- 1. CHECK IF POINTS_HISTORY TABLE EXISTS
-- =====================================================
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'points_history'
        ) THEN '✅ points_history table EXISTS'
        ELSE '❌ points_history table DOES NOT EXIST'
    END as table_status;

-- =====================================================
-- 2. IF TABLE EXISTS: CHECK COLUMN STRUCTURE
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'points_history'
ORDER BY ordinal_position;

-- Expected columns:
-- ✓ id (uuid)
-- ✓ user_id (uuid)
-- ✓ action_type (text)
-- ✓ points_earned (integer) ← CHECK IF THIS EXISTS
-- ✓ reference_id (uuid)     ← CHECK IF THIS EXISTS  
-- ✓ created_at (timestamp)

-- =====================================================
-- 3. CHECK IF POINTS COLUMN EXISTS IN PROFILES
-- =====================================================
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_name = 'profiles' 
            AND column_name = 'points'
        ) THEN '✅ profiles.points column EXISTS'
        ELSE '❌ profiles.points column DOES NOT EXIST'
    END as points_column_status;

-- =====================================================
-- 4. CHECK POINTS DISTRIBUTION
-- =====================================================
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN points IS NOT NULL AND points > 0 THEN 1 END) as users_with_points,
    MAX(COALESCE(points, 0)) as max_points,
    AVG(COALESCE(points, 0))::INTEGER as avg_points
FROM profiles 
WHERE role = 'student';

-- =====================================================
-- 5. CHECK IF AWARD_POINTS FUNCTION EXISTS
-- =====================================================
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_proc 
            WHERE proname = 'award_points'
        ) THEN '✅ award_points() function EXISTS'
        ELSE '❌ award_points() function DOES NOT EXIST'
    END as function_status;

-- =====================================================
-- 6. CHECK IF GET_LEADERBOARD FUNCTION EXISTS
-- =====================================================
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_proc 
            WHERE proname = 'get_leaderboard'
        ) THEN '✅ get_leaderboard() function EXISTS'
        ELSE '❌ get_leaderboard() function DOES NOT EXIST'
    END as leaderboard_function_status;

-- =====================================================
-- 7. CHECK IF POINTS TRIGGERS ARE ACTIVE
-- =====================================================
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_timing,
    event_manipulation as trigger_event
FROM information_schema.triggers
WHERE trigger_name LIKE '%points%'
ORDER BY event_object_table;

-- Expected triggers:
-- ✓ points_on_new_post (on posts table)
-- ✓ points_on_post_liked (on likes table)
-- ✓ points_on_new_comment (on comments table)
-- ✓ points_on_connection_accepted (on connections table)

-- =====================================================
-- INTERPRETATION GUIDE
-- =====================================================
-- 
-- SCENARIO A: points_history table missing or points_earned column missing
--   → Run: sql/fix_points_history.sql
--
-- SCENARIO B: points_history correct but profiles.points missing
--   → Run full: supabase/migrations/20260216_points_and_leaderboard.sql
--
-- SCENARIO C: Everything exists but no points data
--   → Run: sql/calculate_historical_points.sql
--
-- SCENARIO D: Functions or triggers missing
--   → Run full migration again
--
-- =====================================================
