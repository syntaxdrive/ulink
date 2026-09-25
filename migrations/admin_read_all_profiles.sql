-- ============================================================
-- Migration: Admin Read All Profiles (Fix stuck user count)
-- Purpose:   Allow admin users to read ALL profiles via RLS
--            so that user counts and analytics are accurate.
-- ============================================================

-- Step 1: Check existing policies on profiles (optional, for debugging)
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';

-- Step 2: Create a policy that allows admins to read all profiles
-- (Skip if a policy with this name already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Admins can read all profiles'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Admins can read all profiles"
            ON profiles
            FOR SELECT
            USING (
                -- Allow if the requesting user is an admin
                EXISTS (
                    SELECT 1 FROM profiles AS p
                    WHERE p.id = auth.uid()
                    AND p.is_admin = true
                )
                OR
                -- Also allow users to read their own profile (preserves existing access)
                id = auth.uid()
            );
        $policy$;
        RAISE NOTICE 'Policy "Admins can read all profiles" created successfully.';
    ELSE
        RAISE NOTICE 'Policy already exists — skipping creation.';
    END IF;
END;
$$;

-- Step 3: Drop and recreate get_admin_stats with SECURITY DEFINER
-- so it bypasses RLS entirely for accurate counts.
-- DROP is required because we are changing the return type to JSON.
DROP FUNCTION IF EXISTS get_admin_stats();
CREATE FUNCTION get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs as the function owner (bypasses RLS)
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users',              (SELECT COUNT(*) FROM profiles),
        'total_verified',           (SELECT COUNT(*) FROM profiles WHERE is_verified = true),
        'total_orgs',               (SELECT COUNT(*) FROM profiles WHERE role = 'org'),
        'total_posts',              (SELECT COUNT(*) FROM posts),
        'total_communities',        (SELECT COUNT(*) FROM communities),
        'total_jobs',               (SELECT COUNT(*) FROM jobs),
        'total_courses',            (SELECT COUNT(*) FROM courses),
        'pending_reports',          (SELECT COUNT(*) FROM reports WHERE status = 'pending'),
        'active_sponsored_posts',   (SELECT COUNT(*) FROM sponsored_posts WHERE is_active = true),
        'total_revenue',            0
    ) INTO result;

    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
-- (AdminPage.tsx calls this via supabase.rpc — the calling user must be authenticated)
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;
