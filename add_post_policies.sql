-- Allow users to delete their own posts
create policy "Users can delete own posts"
  on public.posts for delete
  using ( auth.uid() = author_id );

-- Allow users to update their own posts (optional but good)
create policy "Users can update own posts"
  on public.posts for update
  using ( auth.uid() = author_id );
