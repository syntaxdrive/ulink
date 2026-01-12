-- Function to handle Mentions and Connection Activity on new Post
create or replace function public.handle_new_post_notifications()
returns trigger
language plpgsql
security definer
as $$
declare
  mentioned_names text[];
  mentioned_name text;
  recipient_id uuid;
  conn_rec record;
begin
  -- 1. Handle Mentions (Basic Regex for @Name)
  -- Extract words starting with @
  select array_agg(substring(match[1] from 2))
  into mentioned_names
  from regexp_matches(new.content, '@([a-zA-Z0-9_]+)', 'g') as match;

  if mentioned_names is not null then
    foreach mentioned_name in array mentioned_names
    loop
      -- Find user by name (Case insensitive check could be better, assuming exact for now)
      -- In a real app, you'd likely use unique usernames/handles. Here we try exact name match.
      select id into recipient_id from public.profiles where name = mentioned_name limit 1;
      
      if recipient_id is not null and recipient_id != new.author_id then
        insert into public.notifications (user_id, type, content, reference_id)
        values (
          recipient_id,
          'mention',
          'You were mentioned in a post.',
          new.id
        );
      end if;
    end loop;
  end if;

  -- 2. Handle Connection Activity (Notify friends)
  -- Find all accepted connections
  for conn_rec in 
    select requester_id, recipient_id 
    from public.connections 
    where status = 'accepted' 
    and (requester_id = new.author_id or recipient_id = new.author_id)
  loop
    -- Determine who is the 'friend'
    if conn_rec.requester_id = new.author_id then
      recipient_id := conn_rec.recipient_id;
    else
      recipient_id := conn_rec.requester_id;
    end if;

    -- Insert notification
    insert into public.notifications (user_id, type, content, reference_id)
    values (
      recipient_id,
      'connection_activity',
      'A connection posted something new.',
      new.id
    );
  end loop;

  return new;
end;
$$;

-- Attach Trigger to Posts table
drop trigger if exists on_post_created on public.posts;
create trigger on_post_created
  after insert on public.posts
  for each row execute procedure public.handle_new_post_notifications();
