-- Add audio_url to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS audio_url TEXT;
