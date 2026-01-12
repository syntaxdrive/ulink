-- 1. Add 'skills' column to profiles if not exists (assume text array)
alter table public.profiles add column if not exists skills text[];
-- Also add 'department' if not exists, though usually tracked by 'university' + 'headline' or separate field. 
-- Just adding a text field for department to enable the algorithm.
alter table public.profiles add column if not exists department text;

-- 2. Add 'skills_required' to jobs for matching
alter table public.jobs add column if not exists skills_required text[];

-- 3. Add 'trust_score' to profiles
alter table public.profiles add column if not exists trust_score integer default 0;

-- 4. Enable EXTENSIONS for array operations (usually built-in but just in case)
-- (intarray or pg_trgm might be nice but standard array ops work for basic Jaccard)

--------------------------------------------------------------------------------
-- ALGO 1: Classmate & Peer Recommender
--------------------------------------------------------------------------------
create or replace function get_profile_suggestions(p_user_id uuid)
returns table (
  id uuid,
  name text,
  university text,
  avatar_url text,
  headline text,
  relevance_score integer,
  mutual_connections bigint
)
language plpgsql
security definer
as $$
declare
  v_uni text;
  v_dept text;
  v_skills text[];
begin
  -- Get current user details
  select university, department, skills into v_uni, v_dept, v_skills
  from public.profiles where id = p_user_id;

  return query
  select 
    p.id,
    p.name,
    p.university,
    p.avatar_url,
    p.headline,
    (
      -- Scoring Logic
      (case when p.university = v_uni then 50 else 0 end) +
      (case when p.department is not null and p.department = v_dept then 30 else 0 end) +
      (
        -- Skill overlap count * 10
        (select count(*) 
         from unnest(p.skills) s 
         where s = any(v_skills)
        ) * 10
      ) +
      (
        -- Mutual connections * 5
        -- A mutual connection is someone connected to both P_USER and CANDIDATE (p.id)
        -- (Simplified: This query can be heavy, for now we will just estimate or leave at 0 if too complex for RPC,
        --  but let's try a direct subquery)
        (
          select count(*)
          from public.connections c1
          join public.connections c2 on 
            (c1.recipient_id = c2.recipient_id or c1.recipient_id = c2.requester_id or c1.requester_id = c2.recipient_id or c1.requester_id = c2.requester_id)
          where 
            -- c1 is connection for p_user_id
            (c1.requester_id = p_user_id or c1.recipient_id = p_user_id) AND c1.status = 'accepted'
            AND
            -- c2 is connection for p.id (candidate)
            (c2.requester_id = p.id or c2.recipient_id = p.id) AND c2.status = 'accepted'
            AND
            -- The "Friend" is not the user or the candidate
             case 
               when c1.requester_id = p_user_id then c1.recipient_id 
               else c1.requester_id 
             end = 
             case 
               when c2.requester_id = p.id then c2.recipient_id 
               else c2.requester_id 
             end
        ) * 5
      )
    )::integer as relevance_score,
    0::bigint as mutual_connections -- Placeholder if we calculated it inside score
  from public.profiles p
  where p.id != p_user_id
  -- Exclude existing connections
  and not exists (
    select 1 from public.connections c 
    where (c.requester_id = p_user_id and c.recipient_id = p.id) 
       or (c.requester_id = p.id and c.recipient_id = p_user_id)
  )
  order by relevance_score desc
  limit 20;
end;
$$;


--------------------------------------------------------------------------------
-- ALGO 2: Opportunity Matcher
--------------------------------------------------------------------------------
create or replace function get_job_matches(p_user_id uuid)
returns table (
  id uuid,
  title text,
  company text,
  type text,
  description text,
  match_percentage integer,
  skills_required text[]
)
language plpgsql
security definer
as $$
declare
  v_user_skills text[];
begin
  select skills into v_user_skills from public.profiles where id = p_user_id;

  return query
  select 
    j.id,
    j.title,
    j.company,
    j.type,
    j.description,
    (
      case 
        when j.skills_required is null or array_length(j.skills_required, 1) is null then 0
        when v_user_skills is null then 0
        else 
          -- Jaccard Index * 100
          round(
            (
              (select count(*) from unnest(j.skills_required) s where s = any(v_user_skills))::float /
              (
                 (array_length(j.skills_required, 1) + array_length(v_user_skills, 1) - 
                 (select count(*) from unnest(j.skills_required) s where s = any(v_user_skills)))
              )::float
            ) * 100
          )::integer
      end
    ) as match_percentage,
    j.skills_required
  from public.jobs j
  order by match_percentage desc;
end;
$$;


--------------------------------------------------------------------------------
-- ALGO 3: Feed Gravity (Time-Decay Popularity)
--------------------------------------------------------------------------------
create or replace function get_feed_gravity(p_limit integer, p_offset integer)
returns table (
  id uuid,
  content text,
  image_url text,
  created_at timestamp with time zone,
  author_id uuid,
  author_name text,
  author_avatar text,
  likes_count bigint,
  comments_count bigint,
  gravity_score float
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    p.id,
    p.content,
    p.image_url,
    p.created_at,
    p.author_id,
    pr.name as author_name,
    pr.avatar_url as author_avatar,
    coalesce(l.count, 0) as likes_count,
    coalesce(c.count, 0) as comments_count,
    -- Gravity Formula: (Likes + Comments + 1) / (AgeInHours + 2)^1.5
    (
      (coalesce(l.count, 0) + coalesce(c.count, 0) + 1)::float / 
      power((extract(epoch from (now() - p.created_at))/3600 + 2), 1.5)
    ) as gravity_score
  from public.posts p
  join public.profiles pr on p.author_id = pr.id
  left join (select post_id, count(*) as count from public.likes group by post_id) l on l.post_id = p.id
  left join (select post_id, count(*) as count from public.comments group by post_id) c on c.post_id = p.id
  order by gravity_score desc
  limit p_limit offset p_offset;
end;
$$;

--------------------------------------------------------------------------------
-- ALGO 4: Trust Score & Verification
--------------------------------------------------------------------------------
-- This calculates trust score on the fly or updates it. 
-- For performance, better to just have a trigger update it, but here is a getter.
create or replace function calculate_trust_score(p_user_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  score integer := 0;
  v_profile record;
  v_conns integer;
begin
  select * into v_profile from public.profiles where id = p_user_id;
  
  -- Base score for existing
  score := 10;
  
  -- Profile Completeness
  if v_profile.avatar_url is not null then score := score + 10; end if;
  if v_profile.university is not null then score := score + 10; end if;
  if v_profile.headline is not null then score := score + 5; end if;
  if v_profile.about is not null then score := score + 5; end if;
  
  -- Connections Count (Social Proof)
  select count(*) into v_conns from public.connections 
  where (requester_id = p_user_id or recipient_id = p_user_id) 
  and status = 'accepted';
  
  if v_conns > 50 then score := score + 20;
  elsif v_conns > 10 then score := score + 10;
  end if;

  -- Account Age (Anti-Fraud)
  if v_profile.created_at < now() - interval '1 month' then score := score + 10; end if;
  if v_profile.created_at < now() - interval '6 months' then score := score + 20; end if; -- Bonus
  
  -- .edu.ng check (if email ends with it)
  if v_profile.email like '%.edu.ng' then score := score + 50; end if;

  return score;
end;
$$;
