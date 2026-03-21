-- Migration: Enable Global Realtime
-- This script adds all core tables to the supabase_realtime publication 
-- and sets REPLICA IDENTITY FULL so UPDATE/DELETE events trigger correctly 
-- for row filters (like room_id, user_id).

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    LOOP
        -- 1. Enable REPLICA IDENTITY FULL for detailed UPDATE/DELETE updates
        EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
        RAISE NOTICE 'Set REPLICA IDENTITY FULL for table %', t;

        -- 2. Add table to supabase_realtime publication slot
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
              AND schemaname = 'public' 
              AND tablename = t
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
            RAISE NOTICE 'Added table % to supabase_realtime publication', t;
        END IF;
    END LOOP;
END $$;
