-- Add verified column
alter table public.profiles 
add column if not exists is_verified boolean default false;

-- Verify specific users
update public.profiles 
set is_verified = true 
where email in ('akeledivine1@gmail.com', 'oyasordaniel@gmail.com');