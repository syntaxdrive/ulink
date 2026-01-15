
-- Fix Message Table Columns
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'messages' and column_name = 'read_at') then
    alter table public.messages add column read_at timestamp with time zone;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'messages' and column_name = 'image_url') then
    alter table public.messages add column image_url text;
  end if;
end $$;

-- Fix RLS Policy for Update
-- First drop to avoid errors
drop policy if exists "Recipients can update messages" on public.messages;
-- Create the policy
create policy "Recipients can update messages" on public.messages
  for update
  using ( auth.uid() = recipient_id );

-- Ensure Realtime is enabled
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
