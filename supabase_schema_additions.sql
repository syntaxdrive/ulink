-- ... (Previous schema content is assumed to be there, we append new tables) ...

-- LIKES TABLE
create table if not exists public.likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

alter table public.likes enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Likes are viewable by everyone.') then
    create policy "Likes are viewable by everyone." on likes for select using ( true );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can like posts.') then
    create policy "Users can like posts." on likes for insert with check ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can unlike posts.') then
    create policy "Users can unlike posts." on likes for delete using ( auth.uid() = user_id );
  end if;
end
$$;

-- COMMENTS TABLE
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.comments enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Comments are viewable by everyone.') then
    create policy "Comments are viewable by everyone." on comments for select using ( true );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can comment on posts.') then
    create policy "Users can comment on posts." on comments for insert with check ( auth.uid() = author_id );
  end if;
  
  -- Optional: Users can delete their own comments
  if not exists (select 1 from pg_policies where policyname = 'Users can delete their own comments.') then
    create policy "Users can delete their own comments." on comments for delete using ( auth.uid() = author_id );
  end if;
end
$$;
