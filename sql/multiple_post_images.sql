-- Add explicit support for multiple images
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Commenting out automatic migration to avoid mass updates during peak
-- UPDATE posts SET image_urls = ARRAY[image_url] WHERE image_url IS NOT NULL AND image_urls IS NULL;
