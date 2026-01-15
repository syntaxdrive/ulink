-- Notifications are personal. 
-- Users should be able to:
-- 1. View their own notifications (recipient_id = auth.uid())
-- 2. Update their own notifications (e.g. mark as read)
-- 3. Delete their own notifications (e.g. dismiss)

-- Enable RLS (already enabled in previous script, but safe to re-run)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to be safe
DROP POLICY IF EXISTS "Users can see their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Create Policies
CREATE POLICY "Users can see their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);
