-- ============================================================================
-- DELETE ALL JOBS CREATED BY ORGANIZATIONS
-- ============================================================================
-- ⚠️ WARNING: This will permanently delete job postings AND all related data!
-- 
-- What this does:
-- 1. Deletes all jobs (jobs table) created by organizations (role='org')
-- 2. CASCADE automatically deletes all related job_applications
-- 3. May also cascade delete related notifications
--
-- Use Case: Clean up test data or reset all organization job postings
-- ============================================================================

-- STEP 1: PREVIEW - See what will be deleted (RUN THIS FIRST!)
-- Uncomment the following query to see the jobs before deletion:

/*
SELECT 
    j.id as job_id,
    j.title,
    j.company,
    j.type,
    j.description,
    j.application_link,
    j.status,
    j.created_at,
    org.name as created_by_org,
    org.id as org_id,
    org.email as org_email,
    (SELECT COUNT(*) FROM public.job_applications WHERE job_id = j.id) as total_applications
FROM public.jobs j
INNER JOIN public.profiles org ON j.creator_id = org.id
WHERE org.role = 'org'
ORDER BY j.created_at DESC;
*/


-- STEP 2: COUNT - How many jobs will be deleted?
-- Uncomment to see the count:

/*
SELECT 
    COUNT(DISTINCT j.id) as total_jobs_to_delete,
    COUNT(ja.id) as total_applications_to_delete
FROM public.jobs j
INNER JOIN public.profiles org ON j.creator_id = org.id
LEFT JOIN public.job_applications ja ON ja.job_id = j.id
WHERE org.role = 'org';
*/

-- ============================================================================
-- STEP 3: DELETE - Execute the deletion
-- ============================================================================
-- ⚠️ CRITICAL: Only run this after reviewing the preview above!
-- This will delete the jobs AND all applications (CASCADE)
-- Uncomment the DELETE statement below to execute:

/*
DELETE FROM public.jobs
WHERE creator_id IN (
    SELECT id
    FROM public.profiles
    WHERE role = 'org'
);
*/

-- ============================================================================
-- STEP 4: VERIFY - Confirm deletion was successful
-- ============================================================================
-- After deletion, run this to verify:

/*
SELECT 
    COUNT(j.id) as remaining_org_jobs,
    COUNT(ja.id) as remaining_org_job_applications
FROM public.jobs j
INNER JOIN public.profiles org ON j.creator_id = org.id
LEFT JOIN public.job_applications ja ON ja.job_id = j.id
WHERE org.role = 'org';
-- Both should return 0 if all were deleted
*/

-- ============================================================================
-- ALTERNATIVE: Delete jobs for a SPECIFIC organization
-- ============================================================================
-- If you only want to delete jobs for ONE specific organization:

/*
DELETE FROM public.jobs
WHERE creator_id = 'PASTE-ORG-USER-ID-HERE';
*/

-- ============================================================================
-- ALTERNATIVE: Delete ONLY jobs with specific criteria
-- ============================================================================
-- Delete only closed jobs created by organizations:

/*
DELETE FROM public.jobs
WHERE status = 'closed'
AND creator_id IN (
    SELECT id FROM public.profiles WHERE role = 'org'
);
*/

-- Delete only jobs older than a certain date:

/*
DELETE FROM public.jobs
WHERE created_at < '2026-01-01'
AND creator_id IN (
    SELECT id FROM public.profiles WHERE role = 'org'
);
*/

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. CASCADE BEHAVIOR: Due to foreign key constraints with ON DELETE CASCADE,
--    deleting jobs will automatically delete:
--    - All job_applications for those jobs
--    - Potentially related notifications
--
-- 2. SAFETY: This script only targets jobs where creator_id points to a 
--    profile with role='org', ensuring student jobs are not affected
--
-- 3. IRREVERSIBLE: This operation CANNOT be undone. Consider exporting data
--    first if you might need it later
--
-- 4. PERMISSIONS: Ensure you have proper database permissions to execute
--    DELETE operations on the jobs table
--
-- 5. PRODUCTION WARNING: Never run this on production without a backup!
-- ============================================================================
