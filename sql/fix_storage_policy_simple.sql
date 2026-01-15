-- Allow public access to read files in uploads bucket
create policy "Public Access Uploads"
  on storage.objects for select
  using ( bucket_id = 'uploads' );

-- Allow authenticated uploads to uploads bucket
create policy "Authenticated Upload Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' );

-- Allow users to update their own files
create policy "Update Own Files Uploads"
  on storage.objects for update
  using ( bucket_id = 'uploads' and owner = auth.uid() );

-- Allow users to delete their own files
create policy "Delete Own Files Uploads"
  on storage.objects for delete
  using ( bucket_id = 'uploads' and owner = auth.uid() );
