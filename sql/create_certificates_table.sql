create table public.certificates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  issuing_org text not null,
  issue_date date,
  credential_url text,
  credential_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.certificates enable row level security;

create policy "Certificates are viewable by everyone." on certificates
  for select using ( true );

create policy "Users can insert their own certificates." on certificates
  for insert with check ( auth.uid() = user_id );

create policy "Users can update their own certificates." on certificates
  for update using ( auth.uid() = user_id );

create policy "Users can delete their own certificates." on certificates
  for delete using ( auth.uid() = user_id );
