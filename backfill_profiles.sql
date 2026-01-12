-- Run this script to populate the profiles table from existing users
-- This is necessary if you reset the public schema but still have users in auth.users

insert into public.profiles (id, email, name, role, university, avatar_url)
select 
  id, 
  email,
  raw_user_meta_data ->> 'name',
  coalesce(raw_user_meta_data ->> 'role', 'student'),
  raw_user_meta_data ->> 'university',
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;
