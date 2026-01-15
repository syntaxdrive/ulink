-- 1. ENSURE NECESSARY COLUMNS EXIST
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'skills') then
    alter table public.profiles add column skills text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'headline') then
    alter table public.profiles add column headline text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'about') then
    alter table public.profiles add column about text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_verified') then
    alter table public.profiles add column is_verified boolean default false;
  end if;
end $$;

-- 2. NETWORK ALGORITHM (Suggested Connections)
-- Goal: Growth for Verified Users & Relevant Peer Discovery
-- Logic:
-- 1. Verified Students (Boosted to help them gain connections/popularity)
-- 2. Same University (Relevance)
-- 3. Random others
create or replace function public.get_suggested_connections(current_user_id uuid)
returns setof public.profiles
language sql
stable
as $$
  select * from public.profiles
  where id != current_user_id
  and role = 'student'
  and id not in (
    select recipient_id from public.connections where requester_id = current_user_id
    union
    select requester_id from public.connections where recipient_id = current_user_id
  )
  order by 
    case when is_verified = true then 0 else 1 end, -- Priority 1: Verified (Growth Engine)
    case when university = (select university from profiles where id = current_user_id) then 0 else 1 end, -- Priority 2: Relevance
    random() -- Priority 3: Freshness
  limit 20;
$$;


-- 3. ORGANIZATIONS ALGORITHM (Discover Orgs)
create or replace function public.get_suggested_orgs(current_user_id uuid)
returns setof public.profiles
language sql
stable
as $$
  select * from public.profiles
  where role = 'org'
  and id != current_user_id
  and id not in (
    select recipient_id from public.connections where requester_id = current_user_id
    union
    select requester_id from public.connections where recipient_id = current_user_id
  )
  order by 
    case when is_verified = true then 0 else 1 end, -- Verified Orgs first
    random()
  limit 10;
$$;


-- 4. FEED ALGORITHM (Smart Feed)
-- Logic:
-- 1. Connections (Always show)
-- 2. University Peers (Always show)
-- 3. Verified Users (Show "from time to time" - specifically recent high-quality posts)
-- Constraint: Verified posts only show if < 7 days old to prevent clutter (Not "overly imposing")
create or replace function public.get_smart_feed(current_user_id uuid, limit_count int default 20, offset_count int default 0)
returns setof public.posts
language plpgsql
stable
as $$
declare
  my_uni text;
begin
  select university into my_uni from public.profiles where id = current_user_id;

  return query
  select p.* from public.posts p
  join public.profiles author on p.author_id = author.id
  where 
    -- Condition A: Is my Connection
    p.author_id in (
        select requester_id from connections where recipient_id = current_user_id and status = 'accepted'
        union
        select recipient_id from connections where requester_id = current_user_id and status = 'accepted'
    )
    OR
    -- Condition B: Is from my University
    (my_uni is not null and author.university = my_uni)
    OR
    -- Condition C: Global Verified Discovery (Algorithm for Popularity)
    -- Only recent posts (< 7 days) to keep it fresh and not annoying
    (author.is_verified = true and p.created_at > (now() - interval '7 days'))
    OR
    -- Condition D: Is my own post
    p.author_id = current_user_id
  order by p.created_at desc
  limit limit_count offset offset_count;
end;
$$;


-- 5. TALENT ALGORITHM (Search for Orgs)
create or replace function public.search_talent(search_query text)
returns setof public.profiles
language sql
stable
as $$
  select * from public.profiles
  where role = 'student'
  and (
    name ilike '%' || search_query || '%'
    or headline ilike '%' || search_query || '%'
    or exists (select 1 from unnest(skills) s where s ilike '%' || search_query || '%')
  )
  order by 
    case when is_verified = true then 0 else 1 end, -- Verified talent top priority
    name asc
  limit 50;
$$;
