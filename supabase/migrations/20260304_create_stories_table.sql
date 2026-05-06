-- Create stories table for choice-based games
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_prompt TEXT, -- for AI images
    genre TEXT,
    theme TEXT DEFAULT 'from-blue-600 to-indigo-800',
    icon TEXT DEFAULT '📖',
    estimated_time TEXT DEFAULT '15-20 min',
    ink_json JSONB NOT NULL,
    is_published BOOLEAN DEFAULT true,
    plays_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view published stories" 
    ON public.stories FOR SELECT 
    USING (is_published = true);

CREATE POLICY "Users can create their own stories" 
    ON public.stories FOR INSERT 
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own stories" 
    ON public.stories FOR UPDATE 
    USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own stories" 
    ON public.stories FOR DELETE 
    USING (auth.uid() = creator_id);

-- Add to search if needed (optional)
