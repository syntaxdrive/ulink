-- Create Resume Reviews Table
CREATE TABLE IF NOT EXISTS public.resume_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_text TEXT NOT NULL,
    analysis_result JSONB, -- { score: number, summary: string, strengths: string[], weaknesses: string[], suggestions: string[] }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.resume_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own reviews" 
ON public.resume_reviews FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews" 
ON public.resume_reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.resume_reviews FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
