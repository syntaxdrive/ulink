-- Repost Feature Database Migration
-- Run this SQL in your Supabase SQL Editor

-- Add repost columns to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS repost_comment TEXT,
ADD COLUMN IF NOT EXISTS reposts_count INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_original_post_id ON posts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_repost ON posts(is_repost);

-- Make content nullable to support reposts
ALTER TABLE posts ALTER COLUMN content DROP NOT NULL;

-- Update existing posts to have reposts_count = 0 if null
UPDATE posts SET reposts_count = 0 WHERE reposts_count IS NULL;

-- Success message
SELECT 'Repost feature migration completed successfully!' as message;
