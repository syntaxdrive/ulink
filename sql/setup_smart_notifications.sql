-- ================================================================
-- SETUP NOTIFICATION TRIGGERS
-- Automates notifications without trusting client-side logic
-- ================================================================

-- 1. Create Notification Function
create or replace function public.handle_new_notification()
returns trigger
language plpgsql
security definer
as $$
begin
  -- LIKE NOTIFICATIONS
  if (TG_TABLE_NAME = 'likes') then
    -- Don't notify if user likes their own post
    if (new.user_id = (select author_id from public.posts where id = new.post_id)) then
      return new;
    end if;

    insert into public.notifications (user_id, type, content, data)
    values (
      (select author_id from public.posts where id = new.post_id), -- Recipient (Post Author)
      'like',
      (select name from public.profiles where id = new.user_id) || ' liked your post.',
      json_build_object('post_id', new.post_id, 'actor_id', new.user_id)
    );
  end if;

  -- COMMENT NOTIFICATIONS
  if (TG_TABLE_NAME = 'comments') then
    -- Don't notify if user comments on their own post
    if (new.author_id = (select author_id from public.posts where id = new.post_id)) then
      return new;
    end if;

    insert into public.notifications (user_id, type, content, data)
    values (
      (select author_id from public.posts where id = new.post_id), -- Recipient
      'message', -- Reusing 'message' icon for comments as specified in NotificationsPage logic
      (select name from public.profiles where id = new.author_id) || ' commented on your post.',
      json_build_object('post_id', new.post_id, 'comment_id', new.id, 'actor_id', new.author_id)
    );
  end if;

  return new;
end;
$$;

-- 2. Attach Triggers
drop trigger if exists on_like_created on public.likes;
create trigger on_like_created
  after insert on public.likes
  for each row execute procedure public.handle_new_notification();

drop trigger if exists on_comment_created on public.comments;
create trigger on_comment_created
  after insert on public.comments
  for each row execute procedure public.handle_new_notification();
