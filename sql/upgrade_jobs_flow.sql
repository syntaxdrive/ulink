-- 1. Update RLS for job_applications
DROP POLICY IF EXISTS "Job creators can view applications for their jobs" ON public.job_applications;
DROP POLICY IF EXISTS "Job creators can update applications for their jobs" ON public.job_applications;

CREATE POLICY "Job creators can view applications for their jobs"
ON public.job_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = job_applications.job_id
    AND jobs.creator_id = auth.uid()
  )
);

CREATE POLICY "Job creators can update applications for their jobs"
ON public.job_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = job_applications.job_id
    AND jobs.creator_id = auth.uid()
  )
);

-- 2. Safely Update Notifications Constraint
-- Drop the constraint first to remove the restriction
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the new constraint with all historically valid types PLUS the new one
-- We must include ALL existing types to avoid 23514 error
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'mention', 
    'connection_activity', 
    'message', 
    'system', 
    'job_update', -- New Type
    'connection_request', -- Potential legacy type
    'like', -- Potential legacy type
    'post_like', -- Potential legacy type
    'comment' -- Potential legacy type
));

-- 3. Create Trigger Function
CREATE OR REPLACE FUNCTION notify_job_application_update()
RETURNS TRIGGER AS $$
DECLARE
  job_title TEXT;
  org_name TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT title, company INTO job_title, org_name
    FROM public.jobs
    WHERE id = NEW.job_id;

    INSERT INTO public.notifications (user_id, type, content, reference_id, created_at)
    VALUES (
      NEW.user_id,
      'job_update',
      CASE 
        WHEN NEW.status = 'interviewing' THEN 'Great news! You have an interview for ' || job_title || ' at ' || org_name
        WHEN NEW.status = 'offer' THEN 'Congratulations! You received an offer for ' || job_title || ' at ' || org_name
        WHEN NEW.status = 'rejected' THEN 'Update on your application for ' || job_title || ' at ' || org_name
        ELSE 'Your application status for ' || job_title || ' has been updated to ' || NEW.status
      END,
      NEW.job_id,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach Trigger
DROP TRIGGER IF EXISTS on_application_status_change ON public.job_applications;
CREATE TRIGGER on_application_status_change
AFTER UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION notify_job_application_update();
