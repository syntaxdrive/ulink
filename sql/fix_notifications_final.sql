-- 1. DROP the constraint FIRST so we can fix the data
alter table public.notifications drop constraint if exists notifications_type_check;

-- 2. Clean up data 
-- Now we can safely set 'system' because there is no constraint blocking it
update public.notifications 
set type = 'system' 
where type not in ('mention', 'connection_activity', 'message', 'system');

-- 3. Re-Add the Constraint with the correct allowed values
alter table public.notifications add constraint notifications_type_check 
  check (type in ('mention', 'connection_activity', 'message', 'system'));

-- 4. Ensure Policies are correct (just in case)
drop policy if exists "Users can view their own notifications." on public.notifications;
drop policy if exists "System can insert notifications." on public.notifications;
drop policy if exists "Users can update their own notifications (read status)." on public.notifications;

create policy "Users can view their own notifications." on public.notifications
  for select using ( auth.uid() = user_id );

create policy "System can insert notifications." on public.notifications
  for insert with check ( true );

create policy "Users can update their own notifications (read status)." on public.notifications
  for update using ( auth.uid() = user_id );
