-- Migration: Backfill Referral Codes
-- Description: Generates referral codes for existing users who don't have one

DO $$
DECLARE
    profile_record RECORD;
BEGIN
    FOR profile_record IN 
        SELECT id FROM public.profiles WHERE referral_code IS NULL
    LOOP
        UPDATE public.profiles 
        SET referral_code = public.generate_referral_code()
        WHERE id = profile_record.id;
    END LOOP;
END $$;
