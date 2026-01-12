-- 1. Reset Policies
drop policy if exists "Users can view their own notifications." on public.notifications;
drop policy if exists "System can insert notifications." on public.notifications;
drop policy if exists "Users can update their own notifications (read status)." on public.notifications;

-- 2. Re-create Policies
create policy "Users can view their own notifications." on public.notifications
  for select using ( auth.uid() = user_id );

create policy "System can insert notifications." on public.notifications
  for insert with check ( true );

create policy "Users can update their own notifications (read status)." on public.notifications
  for update using ( auth.uid() = user_id );

-- 3. Ensure columns exist
alter table public.notifications add column if not exists reference_id uuid;
alter table public.notifications add column if not exists type text;
alter table public.notifications add column if not exists is_read boolean default false;

-- 4. CLEAN UP DATA before adding constraint
-- This fixes the error you are seeing (some rows have invalid types from previous testing)
update public.notifications 
set type = 'system' 
where type not in ('mention', 'connection_activity', 'message', 'system');

-- 5. Update the Type Check Constraint
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check 
  check (type in ('mention', 'connection_activity', 'message', 'system'));
