create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type text check (type in ('mention', 'connection_activity', 'message', 'system')),
  content text not null,
  reference_id uuid,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications." on notifications
  for select using ( auth.uid() = user_id );

create policy "System can insert notifications." on notifications
  for insert with check ( true ); -- Typically trigger based, but allows flexible insertion

create policy "Users can update their own notifications (read status)." on notifications
  for update using ( auth.uid() = user_id );
