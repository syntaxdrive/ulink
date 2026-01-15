-- ==============================================================================
-- DATABASE SECURITY HARDENING
-- ==============================================================================
-- This script secures the database by:
-- 1. Enabling RLS on all sensitive tables
-- 2. Adding restrictive policies for data modification
-- 3. Locking down privileged columns (is_admin, is_verified, gold_verified)
-- 4. cleaning up any loose permissions

-- 1. ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES SECURITY
-- ==============================================================================
-- Drop existing policies to start fresh (aggressive but safe for definition)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. PRIVILEGED COLUMN PROTECTION (TRIGGER)
-- ==============================================================================
-- Prevent users from updating their own 'is_admin', 'is_verified', or 'gold_verified' status.
-- They might try to send these fields in an update request. We must ignore or block them.

CREATE OR REPLACE FUNCTION public.protect_privileged_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is NOT an admin/service_role (checking current_setting if possible, or just trusting logic)
  -- Actually, we can check if the value CHANGED. 
  -- Assuming only admins can change these. Normal users via API are 'authenticated'.
  -- "auth.role()" returns 'authenticated'.
  
  -- Logic: If the user is trying to change these sensitive fields, REVERT them to the OLD value.
  -- This allows the update to proceed for other fields (name, bio) but silently rejects privilege escalation.
  
  -- Exception: If the executing user has is_admin=true, allow it? 
  -- But usually RLS prevents modifying others. 
  -- Let's just strict lock: Only service_role can update these.
  -- Or rely on a separate specific admin function.
  
  -- Checking if specific columns are being modified:
  IF (NEW.is_admin IS DISTINCT FROM OLD.is_admin) OR
     (NEW.is_verified IS DISTINCT FROM OLD.is_verified) OR
     (NEW.gold_verified IS DISTINCT FROM OLD.gold_verified) THEN
     
      -- Check context? Hard to distinguish Admin user from Normal user in standard RLS triggers without looking up the user's role in the table itself (which leads to recursion).
      -- SIMPLEST SAFE GUARD: Revert these changes always for standard UPDATEs.
      -- Admins should use a special RPC or Service Key script to update these.
      NEW.is_admin := OLD.is_admin;
      NEW.is_verified := OLD.is_verified;
      NEW.gold_verified := OLD.gold_verified;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_profile_privileges ON public.profiles;
CREATE TRIGGER protect_profile_privileges
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_privileged_profile_columns();


-- 4. JOBS SECURITY
-- ==============================================================================
-- Jobs: Public read, Org-create, Owner-delete
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
DROP POLICY IF EXISTS "Orgs can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can delete own jobs" ON public.jobs;

CREATE POLICY "Jobs are viewable by everyone" 
ON public.jobs FOR SELECT 
USING (true);

CREATE POLICY "Orgs can insert jobs" 
ON public.jobs FOR INSERT 
WITH CHECK (
  auth.uid() = creator_id 
  AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'org')
);

CREATE POLICY "Employers can update own jobs" 
ON public.jobs FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Employers can delete own jobs" 
ON public.jobs FOR DELETE 
USING (auth.uid() = creator_id OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);


-- 5. MESSAGES SECURITY (Private)
-- ==============================================================================
DROP POLICY IF EXISTS "Users can see their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can see their own messages" 
ON public.messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id); 
-- Note: You might want to restrict messaging to connected users only, but that depends on product spec.


-- 6. STORAGE SECURITY (Avatars)
-- ==============================================================================
-- Note: Storage policies are handled in the `storage.buckets` and `storage.objects` tables.
-- Ensured via SQL:

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage (Generic safe defaults)
-- Users can view any avatar
CREATE POLICY "Avatar Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Users can upload their own avatar (folder structure convention: user_id/filename)
CREATE POLICY "Avatar Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update/delete their own avatar
CREATE POLICY "Avatar Update Access"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar Delete Access"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Same for Post Images
CREATE POLICY "Post Image Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'post-images' );

CREATE POLICY "Post Image Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'post-images' AND auth.role() = 'authenticated' );
-- (Post images are harder to restrict by folder without strict naming conventions, allowing authenticated upload is standard for MVPs)

