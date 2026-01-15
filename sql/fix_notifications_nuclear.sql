-- NUCLEAR OPTION: Fix Notification Constraints
-- 1. Update invalid types to 'system' so we don't violate future constraints
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
    'system'
);

-- 2. Drop the specific constraint if it exists (try multiple potential names)
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check1;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS check_types;

-- 3. Just to be safe, alter the column type to Text first (removes implicit enum constraints if any)
ALTER TABLE public.notifications ALTER COLUMN type TYPE text;

-- 4. Add the definitive constraint
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
    'system'
));
