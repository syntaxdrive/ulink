-- Drop existing constraints if we can guess their names or generic logic
-- We'll try to drop by finding them or just generic 'Modify' statements

-- For Comments
DO $$
DECLARE
    constraint_name_param text;
BEGIN
    SELECT conname INTO constraint_name_param
    FROM pg_constraint
    WHERE conrelid = 'public.comments'::regclass
    AND confrelid = 'public.posts'::regclass
    AND contype = 'f';

    IF constraint_name_param IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.comments DROP CONSTRAINT ' || constraint_name_param;
    END IF;
END $$;

ALTER TABLE public.comments
ADD CONSTRAINT comments_post_id_fkey
FOREIGN KEY (post_id)
REFERENCES public.posts(id)
ON DELETE CASCADE;

-- For Likes
DO $$
DECLARE
    constraint_name_param text;
BEGIN
    SELECT conname INTO constraint_name_param
    FROM pg_constraint
    WHERE conrelid = 'public.likes'::regclass
    AND confrelid = 'public.posts'::regclass
    AND contype = 'f';

    IF constraint_name_param IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.likes DROP CONSTRAINT ' || constraint_name_param;
    END IF;
END $$;

ALTER TABLE public.likes
ADD CONSTRAINT likes_post_id_fkey
FOREIGN KEY (post_id)
REFERENCES public.posts(id)
ON DELETE CASCADE;

-- Verify Delete Policy again
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts"
ON public.posts
FOR DELETE
USING ( auth.uid() = author_id );
