-- Add Poll Support to Posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS poll_options JSONB DEFAULT NULL, -- Array of strings ["Yes", "No"]
ADD COLUMN IF NOT EXISTS poll_counts JSONB DEFAULT NULL;   -- Array of counts [10, 5]

-- Create Poll Votes table (One vote per user per post)
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL, -- 0 for first option, 1 for second...
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure user can only vote once per post
    CONSTRAINT unique_poll_vote UNIQUE (post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" 
ON public.poll_votes FOR SELECT 
USING (true);

CREATE POLICY "Users can vote" 
ON public.poll_votes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change vote" 
ON public.poll_votes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Function to maintain poll counts on the post itself (High Performance)
CREATE OR REPLACE FUNCTION public.update_poll_counts() RETURNS TRIGGER AS $$
DECLARE
    current_counts JSONB;
    new_counts INTEGER[];
    i INTEGER;
BEGIN
    -- Get current counts from post
    SELECT poll_counts INTO current_counts FROM public.posts WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    
    -- If null, init array based on options length or just start empty
    IF current_counts IS NULL THEN
        -- We assume options exist if votes are coming in, but safe default
        current_counts := '[0, 0, 0, 0, 0]'; 
    END IF;

    -- Convert JSONB array to Int Array for manipulation
    SELECT ARRAY(SELECT jsonb_array_elements_text(current_counts)::INT) INTO new_counts;

    IF TG_OP = 'INSERT' THEN
        -- Increment the specific index
        new_counts[NEW.option_index + 1] := COALESCE(new_counts[NEW.option_index + 1], 0) + 1;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement
        new_counts[OLD.option_index + 1] := GREATEST(COALESCE(new_counts[OLD.option_index + 1], 0) - 1, 0);

    ELSIF TG_OP = 'UPDATE' THEN
        -- Decrement OLD index, Increment NEW index
        new_counts[OLD.option_index + 1] := GREATEST(COALESCE(new_counts[OLD.option_index + 1], 0) - 1, 0);
        new_counts[NEW.option_index + 1] := COALESCE(new_counts[NEW.option_index + 1], 0) + 1;
    END IF;

    -- Update the post
    UPDATE public.posts 
    SET poll_counts = to_jsonb(new_counts)
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_poll_vote ON public.poll_votes;
CREATE TRIGGER on_poll_vote
    AFTER INSERT OR UPDATE OR DELETE ON public.poll_votes
    FOR EACH ROW EXECUTE FUNCTION public.update_poll_counts();
