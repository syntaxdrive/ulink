-- FIX: Ambiguous column reference in handle_new_post_notifications
-- We rename the local variable 'recipient_id' to 'target_user_id' to avoid conflict with table columns.

create or replace function public.handle_new_post_notifications()
returns trigger
language plpgsql
security definer
as $$
declare
  mentioned_names text[];
  mentioned_name text;
  target_user_id uuid; -- Renamed from recipient_id to avoid ambiguity
  conn_rec record;
begin
  -- 1. Handle Mentions (Basic Regex for @Name)
  select array_agg(substring(match[1] from 2))
  into mentioned_names
  from regexp_matches(new.content, '@([a-zA-Z0-9_]+)', 'g') as match;

  if mentioned_names is not null then
    foreach mentioned_name in array mentioned_names
    loop
      -- Find user by name
      select id into target_user_id from public.profiles where name = mentioned_name limit 1;
      
      if target_user_id is not null and target_user_id != new.author_id then
        insert into public.notifications (user_id, type, content, reference_id, is_read)
        values (
          target_user_id,
          'mention',
          'You were mentioned in a post.',
          new.id,
          false
        );
      end if;
    end loop;
  end if;

  -- 2. Handle Connection Activity (Notify friends)
  -- Find all accepted connections where the author is involved
  for conn_rec in 
    select c.requester_id, c.recipient_id 
    from public.connections c
    where c.status = 'accepted' 
    and (c.requester_id = new.author_id or c.recipient_id = new.author_id)
  loop
    -- Determine who is the 'friend' (the one who is NOT the author)
    if conn_rec.requester_id = new.author_id then
      target_user_id := conn_rec.recipient_id;
    else
      target_user_id := conn_rec.requester_id;
    end if;

    -- Insert notification
    insert into public.notifications (user_id, type, content, reference_id, is_read)
    values (
      target_user_id,
      'connection_activity',
      'A connection posted something new.',
      new.id,
      false
    );
  end loop;

  return new;
end;
$$;
