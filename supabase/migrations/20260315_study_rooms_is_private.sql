-- Add is_private column to study_rooms
ALTER TABLE public.study_rooms ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
