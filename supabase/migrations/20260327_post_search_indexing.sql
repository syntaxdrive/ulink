-- Add Full-Text Search indexing to posts for faster and better discovery
-- This allows users to search by keywords, hashtags, and phrases with high performance

-- 1. Add the tsvector column to the posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Create a GIN index for the search_vector
CREATE INDEX IF NOT EXISTS posts_search_idx ON public.posts USING GIN (search_vector);

-- 3. Create a function to update the search_vector
CREATE OR REPLACE FUNCTION posts_search_trigger_fn() RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.content, '')), 'A');
  return new;
end
$$ LANGUAGE plpgsql;

-- 4. Create the trigger
DROP TRIGGER IF EXISTS posts_search_trigger ON public.posts;
CREATE TRIGGER posts_search_trigger
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION posts_search_trigger_fn();

-- 5. Backfill existing posts
UPDATE public.posts SET search_vector = 
  setweight(to_tsvector('english', coalesce(content, '')), 'A');
