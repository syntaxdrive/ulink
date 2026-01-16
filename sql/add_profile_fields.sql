-- Add background_image_url and social links to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS background_image_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS twitter_url text;
