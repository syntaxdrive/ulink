-- Create a table to store whiteboard state
create table public.whiteboards (
  id uuid default gen_random_uuid() primary key,
  name text not null default 'Main Board',
  snapshot jsonb, -- Stores the tldraw document state
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references public.profiles(id)
);

-- Enable RLS
alter table public.whiteboards enable row level security;

-- Policies
create policy "Admins can view whiteboards"
  on public.whiteboards for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Admins can update whiteboards"
  on public.whiteboards for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Admins can insert whiteboards"
  on public.whiteboards for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- Create the initial board
insert into public.whiteboards (name, snapshot)
values ('Main Board', '{}'::jsonb);
