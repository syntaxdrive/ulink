-- COMPLETE DATABASE WIPE SCRIPT
-- This safely removes all tables, functions, triggers, and policies from public schema
-- Auth schema (auth.users) is preserved
-- Run this in Supabase SQL Editor before deploying clean migrations

DO $$ 
DECLARE 
    r RECORD;
    func_drop_stmt TEXT;
BEGIN
    RAISE NOTICE 'Starting database cleanup...';
    
    --------------------------------------------------------------------------------
    -- 1. DROP ALL TABLES (with CASCADE to remove dependent objects)
    --------------------------------------------------------------------------------
    RAISE NOTICE 'Dropping all tables...';
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        BEGIN
            EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
            RAISE NOTICE '  ✓ Dropped table: %', r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ⚠ Failed to drop table %: %', r.tablename, SQLERRM;
        END;
    END LOOP;
    
    --------------------------------------------------------------------------------
    -- 2. DROP ALL FUNCTIONS (with full signature to handle overloading)
    --------------------------------------------------------------------------------
    RAISE NOTICE 'Dropping all functions...';
    FOR r IN (
        SELECT 
            routine_name,
            string_agg(
                parameter_mode || ' ' || 
                COALESCE(parameter_name, '') || ' ' || 
                COALESCE(parameters.data_type, ''), 
                ', ' ORDER BY ordinal_position
            ) AS args
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters 
            ON routines.specific_name = parameters.specific_name
        WHERE routine_schema = 'public'
            AND routine_type = 'FUNCTION'
        GROUP BY routine_name, routines.specific_name
    ) LOOP
        BEGIN
            -- Build DROP statement with argument list
            IF r.args IS NOT NULL AND r.args != '' THEN
                func_drop_stmt := 'DROP FUNCTION IF EXISTS public.' || 
                                 quote_ident(r.routine_name) || 
                                 '(' || r.args || ') CASCADE';
            ELSE
                func_drop_stmt := 'DROP FUNCTION IF EXISTS public.' || 
                                 quote_ident(r.routine_name) || '() CASCADE';
            END IF;
            
            EXECUTE func_drop_stmt;
            RAISE NOTICE '  ✓ Dropped function: %()', r.routine_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ⚠ Failed to drop function %: %', r.routine_name, SQLERRM;
        END;
    END LOOP;
    
    --------------------------------------------------------------------------------
    -- 3. DROP ALL SEQUENCES
    --------------------------------------------------------------------------------
    RAISE NOTICE 'Dropping all sequences...';
    FOR r IN (
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    ) LOOP
        BEGIN
            EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequencename) || ' CASCADE';
            RAISE NOTICE '  ✓ Dropped sequence: %', r.sequencename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ⚠ Failed to drop sequence %: %', r.sequencename, SQLERRM;
        END;
    END LOOP;
    
    --------------------------------------------------------------------------------
    -- 4. DROP ALL VIEWS
    --------------------------------------------------------------------------------
    RAISE NOTICE 'Dropping all views...';
    FOR r IN (
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    ) LOOP
        BEGIN
            EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
            RAISE NOTICE '  ✓ Dropped view: %', r.viewname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ⚠ Failed to drop view %: %', r.viewname, SQLERRM;
        END;
    END LOOP;
    
    --------------------------------------------------------------------------------
    -- 5. DROP ALL TYPES
    --------------------------------------------------------------------------------
    RAISE NOTICE 'Dropping all custom types...';
    FOR r IN (
        SELECT typname 
        FROM pg_type 
        WHERE typnamespace = 'public'::regnamespace 
            AND typtype = 'e'  -- enum types
    ) LOOP
        BEGIN
            EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
            RAISE NOTICE '  ✓ Dropped type: %', r.typname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ⚠ Failed to drop type %: %', r.typname, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'Database cleanup complete!';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Enable UUID extension: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";';
    RAISE NOTICE '2. Run migration 001_foundation_profiles_auth.sql';
    RAISE NOTICE '3. Run migrations 002-010 in order';
    RAISE NOTICE '';
END $$;
