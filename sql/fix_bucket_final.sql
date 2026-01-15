-- Safely create bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads', 
  'uploads', 
  true, 
  5242880, 
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update set public = true;

-- Safely drop policies if they exist (using DO block to avoid errors if they don't exist)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
    DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
    DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
    DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors if we can't drop (e.g. permission issues, though uncommon for admin)
END $$;

-- Create Policies
-- Note: We generally don't need 'alter table' as RLS is enabled by default on storage.objects

create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'uploads' );

create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'uploads' );

create policy "Owner Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'uploads' and auth.uid() = owner );

create policy "Owner Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'uploads' and auth.uid() = owner );
