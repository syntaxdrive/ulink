
-- Create story_plays table for granular analytics
CREATE TABLE IF NOT EXISTS public.story_plays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on story_plays
ALTER TABLE public.story_plays ENABLE ROW LEVEL SECURITY;

-- Policies for story_plays
CREATE POLICY "Creators can view their own story analytics" 
    ON public.story_plays FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.stories 
            WHERE stories.id = story_plays.story_id 
            AND stories.creator_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can log a play" 
    ON public.story_plays FOR INSERT 
    WITH CHECK (true);

-- Function to record a story play and increment the main counter
CREATE OR REPLACE FUNCTION public.record_story_play(s_id UUID)
RETURNS void AS $$
BEGIN
    -- 1. Insert into logs for analytics
    INSERT INTO public.story_plays (story_id, viewer_id)
    VALUES (s_id, auth.uid());

    -- 2. Increment the main counter for quick display
    UPDATE public.stories 
    SET plays_count = plays_count + 1
    WHERE id = s_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
