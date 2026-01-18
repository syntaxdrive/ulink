-- Fix notifications type check constraint aggressively
DO $$
BEGIN
    -- 1. Identify and fix any rows that would violate the new constraint
    -- Update unknown types to 'system'
    UPDATE public.notifications
    SET type = 'system'
    WHERE type NOT IN (
        'like', 
        'comment', 
        'connection_request', 
        'connection_accepted', 
        'new_post', 
        'job_alert',
        'message',       
        'system',
        'job_update', -- NEW TYPE
        'mention',    -- NEW TYPE
        'connection_activity', -- NEW TYPE
        'post_like'   -- Legacy support
    );

    -- 2. Drop the existing constraint
    ALTER TABLE public.notifications 
    DROP CONSTRAINT IF EXISTS notifications_type_check;
    
    -- 3. Add the correct constraint
    ALTER TABLE public.notifications 
    ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
        'like', 
        'comment', 
        'connection_request', 
        'connection_accepted', 
        'new_post', 
        'job_alert',
        'message',       
        'system',
        'job_update',
        'mention',
        'connection_activity',
        'post_like'
    ));
    
END $$;
