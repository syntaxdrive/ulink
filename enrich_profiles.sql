
-- ENRICH PROFILE
alter table public.profiles 
add column if not exists headline text,
add column if not exists location text,
add column if not exists about text,
add column if not exists skills text[] default '{}',
add column if not exists website text,
add column if not exists github_url text,
add column if not exists linkedin_url text,
add column if not exists projects jsonb default '[]'::jsonb;
