-- Create Communities Table
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, -- For pretty URLs (e.g., /c/coding)
    description TEXT,
    icon_url TEXT,
    cover_image_url TEXT,
    privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'restricted')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Community Members Table (Join Table)
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(community_id, user_id) -- User can only join once
);

-- Update Posts Table to support Communities
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_communities_slug ON public.communities(slug);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Post Policies (Update Existing or Add New)
-- We need to ensure community posts are readable if the community is public or user is a member
-- (This might require updating existing post policies, but for now we'll add a specific one for community logic if possible, 
-- or rely on the simpler "public" read policy if we want all posts public for now to keep it simple).

-- Communities Policies
CREATE POLICY "Communities are viewable by everyone" 
ON public.communities FOR SELECT 
USING (privacy = 'public' OR (
    privacy = 'private' AND EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = communities.id AND user_id = auth.uid()
    )
));

CREATE POLICY "Authenticated users can create communities" 
ON public.communities FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Owners and admins can update communities" 
ON public.communities FOR UPDATE 
USING (
    auth.uid() = created_by OR 
    EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = communities.id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
);

-- Community Members Policies
CREATE POLICY "Memberships are viewable by everyone" 
ON public.community_members FOR SELECT 
USING (true);

CREATE POLICY "Users can join public communities" 
ON public.community_members FOR INSERT 
TO authenticated 
WITH CHECK (
    auth.uid() = user_id AND -- Can only add self
    EXISTS (
        SELECT 1 FROM public.communities 
        WHERE id = community_id AND privacy = 'public'
    )
);

CREATE POLICY "Users can leave communities" 
ON public.community_members FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger to auto-add creator as owner
CREATE OR REPLACE FUNCTION public.handle_new_community() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.community_members (community_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_community_created ON public.communities;
CREATE TRIGGER on_community_created
    AFTER INSERT ON public.communities
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_community();
