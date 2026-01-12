-- Enable UUID extension
create extension if not exists "uuid-ossp";

--------------------------------------------------------------------------------
-- DROP EVERYTHING (CASCADE ensures all dependencies are gone)
--------------------------------------------------------------------------------
-- Drop child tables first or use cascade
drop table if exists public.comments cascade;
drop table if exists public.likes cascade;
drop table if exists public.messages cascade;
drop table if exists public.connections cascade;
drop table if exists public.jobs cascade;
drop table if exists public.posts cascade;
-- We are dropping profiles too to ensure schema correctness
drop table if exists public.profiles cascade;

--------------------------------------------------------------------------------
-- 1. PROFILES
--------------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text unique not null,
  name text,
  role text check (role in ('student', 'org')),
  university text,
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- TRIGGER FOR NEW USERS
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, university, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'role',
    new.raw_user_meta_data ->> 'university',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


--------------------------------------------------------------------------------
-- 2. CORE TABLES
--------------------------------------------------------------------------------

-- CONNECTIONS
create table public.connections (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.profiles(id) not null,
  recipient_id uuid references public.profiles(id) not null,
  status text check (status in ('pending', 'accepted')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(requester_id, recipient_id)
);
alter table public.connections enable row level security;

create policy "Users can view their own connections." on connections for select
  using ( auth.uid() = requester_id or auth.uid() = recipient_id );

create policy "Users can create connection requests." on connections for insert
  with check ( auth.uid() = requester_id );

create policy "Recipient can update connection status." on connections for update
  using ( auth.uid() = recipient_id );


-- MESSAGES
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) not null,
  recipient_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.messages enable row level security;

create policy "Users can view their own messages." on messages for select
  using ( auth.uid() = sender_id or auth.uid() = recipient_id );

create policy "Users can send messages." on messages for insert
  with check ( auth.uid() = sender_id );


-- JOBS
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  company text not null,
  type text check (type in ('Internship', 'Entry Level', 'Full Time')),
  description text,
  application_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.jobs enable row level security;

create policy "Jobs are viewable by everyone." on jobs for select using ( true );
create policy "Organizations can create jobs." on jobs for insert
  with check ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'org'
    )
  );


--------------------------------------------------------------------------------
-- 3. FEED & INTERACTION TABLES
--------------------------------------------------------------------------------

-- POSTS
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) not null,
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.posts enable row level security;

create policy "Posts are viewable by everyone." on posts for select using ( true );
create policy "Users can create posts." on posts for insert with check ( auth.uid() = author_id );


-- LIKES
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);
alter table public.likes enable row level security;

create policy "Likes are viewable by everyone." on likes for select using ( true );
create policy "Users can like posts." on likes for insert with check ( auth.uid() = user_id );
create policy "Users can unlike posts." on likes for delete using ( auth.uid() = user_id );


-- COMMENTS
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.comments enable row level security;

create policy "Comments are viewable by everyone." on comments for select using ( true );
create policy "Users can comment on posts." on comments for insert with check ( auth.uid() = author_id );
create policy "Users can delete their own comments." on comments for delete using ( auth.uid() = author_id );
