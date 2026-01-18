-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('applied', 'interviewing', 'offer', 'rejected')) DEFAULT 'applied',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications" 
ON public.job_applications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
ON public.job_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.job_applications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications" 
ON public.job_applications FOR DELETE 
USING (auth.uid() = user_id);
