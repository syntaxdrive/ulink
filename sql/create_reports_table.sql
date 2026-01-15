-- Create table for user reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, resolved, dismissed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policies
-- Reporters can see their own reports (optional, usually not needed)
CREATE POLICY "Reporters can select own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- Admins can see all reports (This requires an is_admin function or check, for now allow all authenticated for simplicity if admin check is complex in RLS, but better to be safe)
-- Assuming we have a profiles table with is_admin
CREATE POLICY "Admins can view all reports" ON reports FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

CREATE POLICY "Users can create reports" ON reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

-- Explicitly allow the reporter to select their own inserted rows (Supabase sometimes needs this)
CREATE POLICY "Users can view own created reports" ON reports FOR SELECT
USING (auth.uid() = reporter_id);

-- Grant access
GRANT ALL ON reports TO authenticated;
