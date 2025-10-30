-- Enable if needed: create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key,
  email text,
  display_name text,
  created_at timestamp with time zone default now()
);

create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text,
  age_tier text check (age_tier in ('young','middle','advanced')) default 'young',
  created_at timestamp with time zone default now()
);

create table if not exists clips (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid references episodes(id) on delete cascade,
  role text check (role in ('user','assistant')),
  transcript text,
  audio_url text,
  created_at timestamp with time zone default now()
);

-- Storage bucket for audio
-- In Supabase UI, create a bucket named 'audio' (public = false recommended).
