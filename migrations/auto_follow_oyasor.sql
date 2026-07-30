-- Migration: Auto-follow oyasordaniel@gmail.com for all current and future users
-- Fixes PL/pgSQL variable shadow bug where target_user_id was confused with a profiles column.

DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    -- 1. Get the ID for oyasordaniel@gmail.com
    SELECT id INTO v_admin_id FROM public.profiles WHERE email = 'oyasordaniel@gmail.com' LIMIT 1;

    IF v_admin_id IS NOT NULL THEN
        -- 2. Create the auto-follow trigger function
        CREATE OR REPLACE FUNCTION public.handle_auto_follow_oyasor()
        RETURNS TRIGGER AS $trigger$
        DECLARE
            v_target UUID;
        BEGIN
            SELECT id INTO v_target FROM public.profiles WHERE email = 'oyasordaniel@gmail.com' LIMIT 1;
            IF v_target IS NOT NULL AND NEW.id != v_target THEN
                -- Make the new user follow Daniel
                INSERT INTO public.follows (follower_id, following_id)
                VALUES (NEW.id, v_target)
                ON CONFLICT (follower_id, following_id) DO NOTHING;
            END IF;
            
            RETURN NEW;
        END;
        $trigger$ LANGUAGE plpgsql SECURITY DEFINER;

        -- 3. Attach the trigger to profiles
        DROP TRIGGER IF EXISTS tr_auto_follow_oyasor ON public.profiles;
        CREATE TRIGGER tr_auto_follow_oyasor
        AFTER INSERT ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_auto_follow_oyasor();

        -- 4. One-time follow for all existing users
        INSERT INTO public.follows (follower_id, following_id)
        SELECT p.id, v_admin_id
        FROM public.profiles p
        WHERE p.id != v_admin_id
        ON CONFLICT (follower_id, following_id) DO NOTHING;

        RAISE NOTICE 'Auto-follow system established for Daniel (ID: %)', v_admin_id;
    ELSE
        RAISE NOTICE 'User oyasordaniel@gmail.com not found. Trigger not created.';
    END IF;
END $$;
