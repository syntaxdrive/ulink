-- ============================================================
-- ADMIN REACTIONS BOARD
-- Run this in Supabase SQL Editor before using the feature.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL CHECK (char_length(content) <= 280),
    color text DEFAULT 'yellow' NOT NULL,   -- yellow | pink | blue | green | purple | orange
    emoji text DEFAULT '📝' NOT NULL,
    reactions jsonb DEFAULT '{}' NOT NULL,  -- { "❤️": ["uid1","uid2"], "🔥": ["uid3"] }
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write
CREATE POLICY "admins_select_notes" ON public.admin_notes
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "admins_insert_notes" ON public.admin_notes
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
        AND author_id = auth.uid()
    );

CREATE POLICY "admins_update_notes" ON public.admin_notes
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "admins_delete_own_notes" ON public.admin_notes
    FOR DELETE TO authenticated
    USING (author_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notes;
