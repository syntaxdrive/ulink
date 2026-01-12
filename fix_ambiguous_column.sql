-- Identify which trigger is causing the issue
-- Drop and recreate the new message notification trigger if it exists and is potentially ambiguous

create or replace function public.handle_new_message_notification()
returns trigger
language plpgsql
security definer
as $$
declare
    sender_name text;
begin
    -- Get sender name
    select name into sender_name from public.profiles where id = new.sender_id;

    -- Insert notification
    insert into public.notifications (user_id, type, content, reference_id, is_read)
    values (
        new.recipient_id, -- Explicitly use new.recipient_id not just recipient_id
        'message',
        coalesce(sender_name, 'Someone') || ' sent you a message.',
        new.sender_id,
        false
    );
    return new;
end;
$$;

drop trigger if exists on_new_message_notify on public.messages;
create trigger on_new_message_notify
after insert on public.messages
for each row execute procedure public.handle_new_message_notification();
