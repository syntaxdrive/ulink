-- Drop table to reset schema and policies
DROP TABLE IF EXISTS reports CASCADE;

-- Create table for user reports
-- We reference 'profiles' instead of 'auth.users' to ensure easier frontend joining
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, resolved, dismissed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reporters can view own reports" ON reports FOR SELECT 
USING (auth.uid() = reporter_id);

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

-- Explicitly allow the reporter to select their own inserted rows
CREATE POLICY "Reporters can select inserted reports" ON reports FOR SELECT
USING (auth.uid() = reporter_id);

-- Grant access
GRANT ALL ON reports TO authenticated;
