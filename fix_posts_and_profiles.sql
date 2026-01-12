-- 1. Ensure Profiles Exist (Backfill from Auth)
-- This fixes "Foreign Key Violation" if your user exists in Auth but not in Public schema
INSERT INTO public.profiles (id, email, name, role, university, avatar_url)
SELECT 
  id, 
  email,
  raw_user_meta_data ->> 'name',
  COALESCE(raw_user_meta_data ->> 'role', 'student'),
  raw_user_meta_data ->> 'university',
  raw_user_meta_data ->> 'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Ensure Posts Table Exists and has correct structure
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id uuid REFERENCES public.profiles(id) NOT NULL,
  content text NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Reset RLS for Posts to ensure you can write
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts are viewable by everyone." ON posts;
CREATE POLICY "Posts are viewable by everyone." ON posts FOR SELECT USING ( true );

DROP POLICY IF EXISTS "Users can create posts." ON posts;
CREATE POLICY "Users can create posts." ON posts FOR INSERT WITH CHECK ( auth.uid() = author_id );

-- 4. Cleanup Follows (Per request)
DROP TABLE IF EXISTS public.follows CASCADE;

-- 5. Ensure Connections Count Exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS connections_count INTEGER DEFAULT 0;

-- 6. Recalculate Connections Count
UPDATE public.profiles p
SET connections_count = (
    SELECT count(*) 
    FROM public.connections 
    WHERE status = 'accepted' AND (requester_id = p.id OR recipient_id = p.id)
);
