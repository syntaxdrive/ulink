-- Migration: Add Referral System
-- Description: Adds referral codes and tracking to profiles

-- 1. Add columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- 2. Update points_history activity types
ALTER TABLE public.points_history
DROP CONSTRAINT IF EXISTS points_history_activity_type_check;

ALTER TABLE public.points_history
ADD CONSTRAINT points_history_activity_type_check 
CHECK (activity_type IN (
    'post_created',
    'post_liked',
    'comment_created',
    'connection_made',
    'profile_completed',
    'referral_success'
));

-- 3. Function to generate random referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN := FALSE;
BEGIN
    WHILE NOT done LOOP
        -- Generate 8-char random alphanumeric code
        new_code := upper(substring(replace(replace(replace(cast(gen_random_uuid() as text), '-', ''), '0', 'X'), 'O', 'Y') from 1 for 8));
        
        -- Check if it exists
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$;

-- 4. Trigger to unique referral code for new users
CREATE OR REPLACE FUNCTION public.trigger_generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := public.generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS generate_referral_code_on_signup ON public.profiles;
CREATE TRIGGER generate_referral_code_on_signup
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_referral_code();

-- 5. Function to process referral (award points)
CREATE OR REPLACE FUNCTION public.process_referral(
    p_referred_user_id UUID,
    p_referral_code TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referrer_id UUID;
BEGIN
    -- Find referrer
    SELECT id INTO referrer_id 
    FROM public.profiles 
    WHERE referral_code = p_referral_code;

    IF referrer_id IS NOT NULL AND referrer_id != p_referred_user_id THEN
        -- Link the user
        UPDATE public.profiles
        SET referred_by = referrer_id
        WHERE id = p_referred_user_id;

        -- Award points to referrer (+50)
        PERFORM public.award_points(
            referrer_id,
            'referral_success',
            50,
            p_referred_user_id
        );

        -- Award points to referred user (+20)
        PERFORM public.award_points(
            p_referred_user_id,
            'referral_success',
            20,
            referrer_id
        );
    END IF;
END;
$$;
