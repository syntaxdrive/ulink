-- Migration: Private Community Join Requests
-- Description: Adds status to community_members and updates RLS to allow join requests

-- 1. Add status column to community_members
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_members' AND column_name = 'status') THEN
        ALTER TABLE public.community_members ADD COLUMN status TEXT CHECK (status IN ('active', 'pending', 'rejected')) DEFAULT 'active' NOT NULL;
    END IF;
END $$;

-- 2. Update RLS for community_members INSERT
-- We need to allow users to insert themselves as 'pending' if the community is NOT public.
DROP POLICY IF EXISTS "Users can join public communities" ON public.community_members;

CREATE POLICY "Users can join communities"
    ON public.community_members FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        (
            -- Public: can join as 'active' (member)
            (EXISTS (
                SELECT 1 FROM public.communities
                WHERE communities.id = community_id
                    AND communities.privacy = 'public'
            ) AND status = 'active' AND role = 'member')
            OR
            -- Private: can join as 'pending'
            (EXISTS (
                SELECT 1 FROM public.communities
                WHERE communities.id = community_id
                    AND communities.privacy = 'private'
            ) AND status = 'pending' AND role = 'member')
            OR
            -- Creator/Owner (always active)
            (role = 'owner' AND EXISTS (
                SELECT 1 FROM public.communities
                WHERE communities.id = community_id
                    AND communities.created_by = auth.uid()
            ))
        )
    );

-- 3. Update SELECT policy to hide pending members from public
DROP POLICY IF EXISTS "Community members are viewable by everyone" ON public.community_members;
CREATE POLICY "Community members visibility"
    ON public.community_members FOR SELECT
    USING (
        status = 'active' -- Everyone can see active members
        OR 
        auth.uid() = user_id -- Users can see their own status
        OR
        EXISTS ( -- Admins can see everyone (including pending)
            SELECT 1 FROM public.community_members AS admin_check
            WHERE admin_check.community_id = community_members.community_id
                AND admin_check.user_id = auth.uid()
                AND admin_check.role IN ('admin', 'owner')
                AND admin_check.status = 'active'
        )
    );

-- 4. Update UPDATE policy for approval
DROP POLICY IF EXISTS "Admins can update member roles" ON public.community_members;
CREATE POLICY "Admins can update member roles and status"
    ON public.community_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.community_members AS admin_check
            WHERE admin_check.community_id = community_members.community_id
                AND admin_check.user_id = auth.uid()
                AND admin_check.role IN ('admin', 'owner')
                AND admin_check.status = 'active'
        )
    );
