-- FIX: Enable Deletion of Users with Associated Data
-- This script adds "ON DELETE CASCADE" to all foreign keys.
-- It ensures that when you delete a User, all their Posts, Messages, and Connections are also deleted.

-- 1. PROFILES -> USERS
-- Ensure Profile is deleted when Auth User is deleted
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users (id)
ON DELETE CASCADE;


-- 2. POSTS -> PROFILES
-- Ensure Posts are deleted when Author Profile is deleted
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

ALTER TABLE public.posts
ADD CONSTRAINT posts_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;


-- 3. CONNECTIONS -> PROFILES
-- Ensure Connections are deleted when either user is deleted
ALTER TABLE public.connections
DROP CONSTRAINT IF EXISTS connections_requester_id_fkey;

ALTER TABLE public.connections
ADD CONSTRAINT connections_requester_id_fkey
FOREIGN KEY (requester_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

ALTER TABLE public.connections
DROP CONSTRAINT IF EXISTS connections_recipient_id_fkey;

ALTER TABLE public.connections
ADD CONSTRAINT connections_recipient_id_fkey
FOREIGN KEY (recipient_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;


-- 4. MESSAGES -> PROFILES
-- Ensure Messages are deleted when either user is deleted
ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;

ALTER TABLE public.messages
ADD CONSTRAINT messages_recipient_id_fkey
FOREIGN KEY (recipient_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;
