-- Migration to add sticker/image support to comments
-- Adds sticker_url and type to comments table

-- 1. Add columns
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS sticker_url TEXT,
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('text', 'sticker', 'image')) DEFAULT 'text';

-- 2. Make content nullable (required for sticker-only comments)
ALTER TABLE public.comments ALTER COLUMN content DROP NOT NULL;

-- 3. Add constraint to ensure either content or sticker_url is present
ALTER TABLE public.comments 
ADD CONSTRAINT comments_content_or_sticker_check 
CHECK (content IS NOT NULL OR sticker_url IS NOT NULL);

-- 4. Verify columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'comments'
  AND column_name IN ('sticker_url', 'type', 'content');
