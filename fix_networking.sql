-- 1. Add reference_id column if it doesn't exist using safe standard SQL or PL/pgSQL
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'notifications' and column_name = 'reference_id') then
        alter table public.notifications add column reference_id uuid;
    end if;
end $$;

-- 2. Ensure the table has the correct RLS policies
alter table public.notifications enable row level security;

-- Drop old policies to avoid conflicts
drop policy if exists "Users can view their own notifications." on notifications;
create policy "Users can view their own notifications." on notifications
  for select using ( auth.uid() = user_id );

drop policy if exists "Users can update their own notifications." on notifications;
create policy "Users can update their own notifications." on notifications
  for update using ( auth.uid() = user_id );

-- 3. Ensure 'type' check constraint allows 'connection_request'
-- We drop the constraint blindly to ensure we can re-add the correct one. 
-- If 'type' is just text without constraint, this is harmless if the constraint name matches.
-- If the constraint had a different name, we might simply be adding a new one. 
-- To be safe, we just define the constraint.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('connection_request', 'message', 'like', 'comment'));

-- 4. Trigger Function for New Connections (SECURITY DEFINER to bypass RLS)
create or replace function public.handle_new_connection()
returns trigger
language plpgsql
security definer
as $$
declare
  requester_name text;
begin
  -- Get requester name
  select name into requester_name from public.profiles where id = new.requester_id;

  -- Insert notification for the recipient
  insert into public.notifications (user_id, type, content, reference_id)
  values (
    new.recipient_id,
    'connection_request',
    requester_name || ' sent you a connection request.',
    new.id
  );
  return new;
end;
$$;

-- 5. Attach Trigger to Connections table
drop trigger if exists on_connection_created on public.connections;
create trigger on_connection_created
  after insert on public.connections
  for each row execute procedure public.handle_new_connection();
