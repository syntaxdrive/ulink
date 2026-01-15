-- Create a function to handle new message notifications
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_name text;
BEGIN
  -- Get sender's name
  SELECT name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
  
  -- Create the notification
  INSERT INTO public.notifications (user_id, type, content, data)
  VALUES (
    NEW.receiver_id,
    'message',
    'New message from ' || coalesce(sender_name, 'Unknown'),
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'message_id', NEW.id,
      'message_content', substring(NEW.content from 1 for 50) -- Preview
    )
  );

  RETURN NEW;
END;
$$;

-- Create the trigger on messages table
DROP TRIGGER IF EXISTS on_message_created ON public.messages;

CREATE TRIGGER on_message_created
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_message();
