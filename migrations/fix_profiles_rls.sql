-- ============================================================
-- EMERGENCY FIX: Restore profile visibility
-- The previous migration broke profile reads for all users.
-- This restores the correct, open read policy so the feed
-- and all other features can see user profiles again.
-- ============================================================

-- Step 1: Drop the overly restrictive policy we added
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Step 2: Ensure authenticated users can read ALL profiles
-- (This is the standard Supabase social app pattern)
-- Drop any conflicting policies first, then create the correct one.
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read all profiles" ON profiles;

CREATE POLICY "Allow authenticated users to read all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);  -- Any authenticated user can read any profile

-- Step 3: Ensure users can still only update/insert their OWN profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Step 4: Ensure anon/public users can ALSO read profiles 
-- (needed for public post/feed viewing without login)
DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;
CREATE POLICY "Profiles are publicly readable"
ON profiles
FOR SELECT
TO anon
USING (true);
