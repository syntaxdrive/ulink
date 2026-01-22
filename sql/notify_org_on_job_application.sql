-- Add job application notifications for organizations
-- This notifies organizations when someone applies to their job posting

-- 1. Create trigger function to notify organization when someone applies
CREATE OR REPLACE FUNCTION notify_organization_on_job_application()
RETURNS TRIGGER AS $$
DECLARE
  job_title TEXT;
  job_creator_id UUID;
  applicant_name TEXT;
BEGIN
  -- Get job details and creator
  SELECT title, creator_id INTO job_title, job_creator_id
  FROM public.jobs
  WHERE id = NEW.job_id;

  -- Get applicant name
  SELECT name INTO applicant_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Only notify on new applications (INSERT), not updates
  IF TG_OP = 'INSERT' THEN
    -- Insert notification for the job creator (organization)
    INSERT INTO public.notifications (user_id, type, content, reference_id, created_at)
    VALUES (
      job_creator_id,
      'job_update',
      applicant_name || ' applied for ' || job_title,
      NEW.job_id,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_new_job_application ON public.job_applications;

-- 3. Create trigger that fires when a new application is submitted
CREATE TRIGGER on_new_job_application
AFTER INSERT ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION notify_organization_on_job_application();

-- 4. Ensure the existing trigger for status updates still works
-- (This was already created in upgrade_jobs_flow.sql)
-- It notifies applicants when their status changes

-- Test the setup (optional - comment out if not needed)
-- SELECT 'Job application notification system is now active!' as status;
