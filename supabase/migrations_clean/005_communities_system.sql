-- Migration 005: Communities System
-- Description: Topic-based communities with membership roles
-- Dependencies: 001_foundation_profiles_auth.sql, 004_feed_posts_engagement.sql
-- Generated: 2026-02-17

--------------------------------------------------------------------------------
-- 1. COMMUNITIES TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.communities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    cover_image_url TEXT,
    privacy TEXT CHECK (privacy IN ('public', 'private', 'restricted')) DEFAULT 'public' NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON public.communities;
CREATE POLICY "Communities are viewable by everyone"
    ON public.communities FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
CREATE POLICY "Authenticated users can create communities"
    ON public.communities FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Note: Update policy will be added after community_members table is created

DROP POLICY IF EXISTS "Owners can delete communities" ON public.communities;
CREATE POLICY "Owners can delete communities"
    ON public.communities FOR DELETE
    USING (auth.uid() = created_by);

-- Indexes
CREATE INDEX IF NOT EXISTS communities_slug_idx ON public.communities(slug);
CREATE INDEX IF NOT EXISTS communities_created_by_idx ON public.communities(created_by);
CREATE INDEX IF NOT EXISTS communities_created_at_idx ON public.communities(created_at DESC);

--------------------------------------------------------------------------------
-- 2. COMMUNITY MEMBERS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('owner', 'admin', 'moderator', 'member')) DEFAULT 'member' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(community_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Community members are viewable by everyone" ON public.community_members;
CREATE POLICY "Community members are viewable by everyone"
    ON public.community_members FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can join public communities" ON public.community_members;
CREATE POLICY "Users can join public communities"
    ON public.community_members FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        (
            -- Allow 'member' role for public communities
            (role = 'member' AND EXISTS (
                SELECT 1 FROM public.communities
                WHERE communities.id = community_id
                    AND communities.privacy = 'public'
            ))
            OR
            -- Allow 'owner' role when user is the community creator (for trigger)
            (role = 'owner' AND EXISTS (
                SELECT 1 FROM public.communities
                WHERE communities.id = community_id
                    AND communities.created_by = auth.uid()
            ))
        )
    );

DROP POLICY IF EXISTS "Members can leave communities" ON public.community_members;
CREATE POLICY "Members can leave communities"
    ON public.community_members FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update member roles" ON public.community_members;
CREATE POLICY "Admins can update member roles"
    ON public.community_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.community_members AS cm
            WHERE cm.community_id = community_members.community_id
                AND cm.user_id = auth.uid()
                AND cm.role IN ('admin', 'owner')
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS community_members_community_id_idx ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS community_members_user_id_idx ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS community_members_role_idx ON public.community_members(role);

--------------------------------------------------------------------------------
-- 3. ADD MISSING COMMUNITIES UPDATE POLICY (now that community_members exists)
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins and owners can update communities" ON public.communities;
CREATE POLICY "Admins and owners can update communities"
    ON public.communities FOR UPDATE
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.community_members
            WHERE community_members.community_id = communities.id
                AND community_members.user_id = auth.uid()
                AND community_members.role IN ('admin', 'owner')
        )
    );

--------------------------------------------------------------------------------
-- 4. UPDATE POSTS TABLE - Add foreign key to communities
--------------------------------------------------------------------------------

-- Add foreign key constraint if not already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'posts_community_id_fkey'
    ) THEN
        ALTER TABLE public.posts
        ADD CONSTRAINT posts_community_id_fkey
        FOREIGN KEY (community_id)
        REFERENCES public.communities(id)
        ON DELETE SET NULL; -- Keep posts but orphan them if community is deleted
    END IF;
END $$;

--------------------------------------------------------------------------------
-- 5. AUTO-ADD CREATOR AS OWNER TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_community()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Automatically add creator as owner
    INSERT INTO public.community_members (community_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_community_created ON public.communities;
CREATE TRIGGER on_community_created
    AFTER INSERT ON public.communities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_community();

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'communities'
    ), 'communities table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'community_members'
    ), 'community_members table was not created';
    
    RAISE NOTICE 'Migration 005 completed successfully';
END $$;
