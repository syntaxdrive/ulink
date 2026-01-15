-- FUNCTION: fetch_unread_counts
-- Returns a count of unread messages for the current user, grouped by sender.

create or replace function public.fetch_unread_counts(current_user_id uuid)
returns table(sender_id uuid, unread_count bigint)
language sql
stable
as $$
  select sender_id, count(*) as unread_count
  from public.messages
  where recipient_id = current_user_id
  and read_at is null
  group by sender_id;
$$;
