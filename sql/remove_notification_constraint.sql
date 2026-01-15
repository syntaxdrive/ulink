-- REMOVE NOTIFICATION TYPE CONSTRAINT COMPLETELY
-- To prevent further issues with adding new notification types

DO $$
BEGIN
    -- 1. Drop all known variations of the constraint
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check1;
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS check_types;
    
    -- 2. Ensure column is just TEXT (removing any potential enum binding)
    ALTER TABLE public.notifications ALTER COLUMN type TYPE text;

    -- 3. Add 'data' column if it doesn't exist (it's useful for extra payload)
    BEGIN
        ALTER TABLE public.notifications ADD COLUMN data jsonb DEFAULT '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN
            NULL; -- Column already exists
    END;

END $$;
