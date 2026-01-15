-- Add username column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create an index for faster lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Function to check username availability (optional but useful)
CREATE OR REPLACE FUNCTION check_username_available(requested_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles WHERE username = requested_username
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
