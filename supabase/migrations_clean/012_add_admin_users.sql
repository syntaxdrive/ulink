-- Migration 012: Add Admin Users and Gold Verification
-- Description: Grant admin access and gold badges to specific users
-- Dependencies: 001_foundation_profiles_auth.sql, 008_points_leaderboard.sql
-- Generated: 2026-02-18

--------------------------------------------------------------------------------
-- 1. SET ADMIN STATUS FOR DESIGNATED USERS
--------------------------------------------------------------------------------

-- Update is_admin flag for admin users
UPDATE public.profiles
SET is_admin = TRUE
WHERE email IN (
    'oyasordaniel@gmail.com',
    'akeledivine1@gmail.com',
    'amarachimunachi37@gmail.com'
);

--------------------------------------------------------------------------------
-- 2. GRANT GOLD VERIFICATION TO ADMIN USERS
--------------------------------------------------------------------------------

-- Insert gold verification records (with conflict handling)
INSERT INTO public.gold_verified_users (user_id, verified_by, reason, created_at)
SELECT 
    p.id,
    p.id, -- Self-verified as system admin
    'System administrator with elevated privileges',
    NOW()
FROM public.profiles p
WHERE p.email IN (
    'oyasordaniel@gmail.com',
    'akeledivine1@gmail.com',
    'amarachimunachi37@gmail.com'
)
ON CONFLICT (user_id) DO NOTHING; -- Skip if already gold verified

--------------------------------------------------------------------------------
-- VERIFICATION
--------------------------------------------------------------------------------

DO $$
BEGIN
    -- Verify admin status was set
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE email IN ('oyasordaniel@gmail.com', 'akeledivine1@gmail.com', 'amarachimunachi37@gmail.com')
        AND is_admin = TRUE
    ) THEN
        RAISE WARNING 'Some admin users may not exist yet. Admin status will be applied when they sign up.';
    ELSE
        RAISE NOTICE 'Admin status granted successfully';
    END IF;

    -- Verify gold verification
    IF EXISTS (
        SELECT 1 FROM public.gold_verified_users gv
        JOIN public.profiles p ON gv.user_id = p.id
        WHERE p.email IN ('oyasordaniel@gmail.com', 'akeledivine1@gmail.com', 'amarachimunachi37@gmail.com')
    ) THEN
        RAISE NOTICE 'Gold verification granted successfully';
    END IF;

    RAISE NOTICE 'Migration 012 completed';
END $$;
