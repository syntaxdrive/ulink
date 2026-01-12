-- 1. Add 'creator_id' column to 'jobs' table to track who created the job
alter table public.jobs add column if not exists creator_id uuid references public.profiles(id);

-- 2. Backfill existing jobs to be owned by the organization user (optional best effort)
-- Ideally we would have tracked this, but if not we can't easily guess.
-- For new jobs it will be required.

-- 3. Update RLS policies for deleting jobs
drop policy if exists "Organizations can delete their own jobs." on jobs;

create policy "Organizations can delete their own jobs." on jobs
  for delete using ( auth.uid() = creator_id );

-- 4. Update Insert Policy to include creator_id
drop policy if exists "Organizations can create jobs." on jobs;

create policy "Organizations can create jobs." on jobs
  for insert with check ( 
    auth.uid() = creator_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'org'
    )
  );
