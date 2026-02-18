-- Migration 001: Foundation - Core Extensions and Auth Setup
-- Description: Enable required PostgreSQL extensions and set up authentication trigger
-- Dependencies: None
-- Generated: 2026-02-17

--------------------------------------------------------------------------------
-- 1. ENABLE EXTENSIONS
--------------------------------------------------------------------------------

-- UUID support for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pg_trgm for fuzzy text search (user search functionality)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

--------------------------------------------------------------------------------
-- 2. CREATE PROFILES TABLE (Core User Data)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    username TEXT UNIQUE,
    role TEXT CHECK (role IN ('student', 'org')) NOT NULL,
    university TEXT,
    avatar_url TEXT,
    background_image_url TEXT,
    headline TEXT,
    location TEXT,
    about TEXT,
    skills TEXT[],
    experience JSONB DEFAULT '[]'::jsonb,
project JSONB DEFAULT '[]'::jsonb,
    website TEXT,
    website_url TEXT, -- Note: Duplicate field, can be consolidated later
    github_url TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    facebook_url TEXT,
    industry TEXT, -- for organizations
    resume_url TEXT,
    points INTEGER DEFAULT 0 NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_points_idx ON public.profiles(points DESC);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_university_idx ON public.profiles(university);

-- Full-text search index for user discovery
CREATE INDEX IF NOT EXISTS profiles_name_trgm_idx ON public.profiles USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_headline_trgm_idx ON public.profiles USING gin (headline gin_trgm_ops);

--------------------------------------------------------------------------------
-- 3. AUTH TRIGGER - Auto-create profile for new users
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, university, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NEW.raw_user_meta_data->>'university',
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------------
-- 4. SECURITY TRIGGER - Protect privileged columns
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_privileged_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only admins can change is_admin and is_verified
    IF (NEW.is_admin IS DISTINCT FROM OLD.is_admin OR 
        NEW.is_verified IS DISTINCT FROM OLD.is_verified) THEN
        
        -- Check if current user is admin
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        ) THEN
            RAISE EXCEPTION 'Only admins can modify verification status';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_privileges ON public.profiles;
CREATE TRIGGER protect_profile_privileges
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_privileged_profile_columns();

--------------------------------------------------------------------------------
-- 5. UTILITY FUNCTIONS
--------------------------------------------------------------------------------

-- Function to update last_seen timestamp
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET last_seen = NOW()
    WHERE id = auth.uid();
END;
$$;

-- Function to toggle verification (admin only)
CREATE OR REPLACE FUNCTION admin_toggle_verify(
    target_id UUID,
    should_verify BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    ) THEN
        RAISE EXCEPTION 'Only admins can verify users';
    END IF;
    
    -- Update verification status
    UPDATE public.profiles
    SET is_verified = should_verify,
        updated_at = NOW()
    WHERE id = target_id;
END;
$$;

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

-- Verify table exists
DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ), 'profiles table was not created';
    
    RAISE NOTICE 'Migration 001 completed successfully';
END $$;
