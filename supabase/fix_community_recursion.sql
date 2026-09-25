-- Fix infinite recursion for community_members RLS policies
CREATE OR REPLACE FUNCTION public.is_community_admin(p_community_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.community_members
        WHERE community_id = p_community_id
          AND user_id = p_user_id
          AND role IN ('admin', 'owner')
          AND status = 'active'
    );
$$;

DROP POLICY IF EXISTS "Community members visibility" ON public.community_members;
CREATE POLICY "Community members visibility"
    ON public.community_members FOR SELECT
    USING (
        status = 'active'
        OR auth.uid() = user_id
        OR public.is_community_admin(community_id, auth.uid())
    );

DROP POLICY IF EXISTS "Admins can update member roles and status" ON public.community_members;
CREATE POLICY "Admins can update member roles and status"
    ON public.community_members FOR UPDATE
    USING (
        public.is_community_admin(community_id, auth.uid())
    );
