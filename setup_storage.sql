-- Enable storage extension if not already (it's usually enabled by default on Supabase projects but creating schemas/tables is needed)
-- Note: Supabase Storage uses the 'storage' schema.

-- 1. Create a public bucket for general uploads (posts, avatars)
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- 2. Create policies for the 'uploads' bucket
-- Allow public access to view files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'uploads' );

-- Allow authenticated users to upload files
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' and auth.role() = 'authenticated' );

-- Allow users to update/delete their own files (optional, but good practice)
create policy "Users can update own files"
  on storage.objects for update
  using ( bucket_id = 'uploads' and auth.uid() = owner );

create policy "Users can delete own files"
  on storage.objects for delete
  using ( bucket_id = 'uploads' and auth.uid() = owner );

-- 3. Add 'image_url' to messages table if not exists (handling chat images)
alter table public.messages add column if not exists image_url text;

-- 4. Add 'image_url' to posts table if not exists (already exists in schema but good to verify)
alter table public.posts add column if not exists image_url text;
