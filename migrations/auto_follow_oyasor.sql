-- Migration: Auto-follow oyasordaniel@gmail.com for all current and future users
-- This makes the account an "Official/Admin" account followed by everyone by default.

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Get the ID for oyasordaniel@gmail.com
    SELECT id INTO target_user_id FROM profiles WHERE email = 'oyasordaniel@gmail.com' LIMIT 1;

    IF target_user_id IS NOT NULL THEN
        -- 2. Create the auto-follow trigger function
        CREATE OR REPLACE FUNCTION public.handle_auto_follow_oyasor()
        RETURNS TRIGGER AS $trigger$
        BEGIN
            -- Make the new user follow Daniel
            INSERT INTO public.follows (follower_id, following_id)
            VALUES (NEW.id, target_user_id)
            ON CONFLICT (follower_id, following_id) DO NOTHING;
            
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
        SELECT id, target_user_id FROM public.profiles
        WHERE id != target_user_id
        ON CONFLICT (follower_id, following_id) DO NOTHING;

        RAISE NOTICE 'Auto-follow system established for Daniel (ID: %)', target_user_id;
    ELSE
        RAISE NOTICE 'User oyasordaniel@gmail.com not found. Trigger not created.';
    END IF;
END $$;
