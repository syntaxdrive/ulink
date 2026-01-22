-- Fix job deletion permissions for organizations
-- This allows organizations to delete their own job postings

-- Drop existing policy if it exists
drop policy if exists "Organizations can delete own jobs" on public.jobs;

-- Create new policy that allows creators to delete their own jobs
create policy "Organizations can delete own jobs"
  on public.jobs
  for delete
  using (auth.uid() = creator_id);

-- Also ensure update policy exists for editing jobs
drop policy if exists "Organizations can update own jobs" on public.jobs;

create policy "Organizations can update own jobs"
  on public.jobs
  for update
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);
