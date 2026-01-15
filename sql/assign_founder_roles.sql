-- 1. Add gold_verified column to profiles for direct UI access
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gold_verified boolean DEFAULT false;

-- 2. Drop the problematic side table (we will use the column directly)
DROP TABLE IF EXISTS public.gold_verified_users CASCADE;


-- 3. Grant Roles and Update Titles using DO block
DO $$
DECLARE
  founder_id uuid;
  cofounder_id uuid;
BEGIN
  -- Find IDs by email
  SELECT id INTO founder_id FROM public.profiles WHERE email = 'oyasordaniel@gmail.com';
  SELECT id INTO cofounder_id FROM public.profiles WHERE email = 'akeledivine1@gmail.com';

  -- Update Daniel (Founder)
  IF founder_id IS NOT NULL THEN
    UPDATE public.profiles SET 
      headline = 'Founder & CEO @ UniLink',
      is_verified = true,
      gold_verified = true,
      is_admin = true
    WHERE id = founder_id;
  END IF;

  -- Update Divine (Co-Founder)
  IF cofounder_id IS NOT NULL THEN
     UPDATE public.profiles SET 
      headline = 'Co-Founder @ UniLink',
      is_verified = true,
      gold_verified = true,
      is_admin = true
    WHERE id = cofounder_id;
  END IF;
END $$;


-- 4. Protect the Title "Founder" with a Trigger
CREATE OR REPLACE FUNCTION public.enforce_founder_title()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if headline contains "Founder" (case insensitive)
  IF (NEW.headline ILIKE '%Founder%') THEN
    -- Allow if user is admin
    IF (OLD.is_admin IS TRUE OR NEW.is_admin IS TRUE) THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'The title "Founder" is reserved for UniLink administrators.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_founder_title ON public.profiles;
CREATE TRIGGER check_founder_title
  BEFORE INSERT OR UPDATE OF headline ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_founder_title();
