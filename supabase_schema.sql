-- ============================================================
-- Xerox Digital Pro — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles table (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  company_name text,
  mobile text,
  business_details text,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow insert during registration (service role bypasses this)
create policy "Allow profile insert on signup"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- orders table
-- ============================================================
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  file_name text not null default 'untitled',
  file_url text,
  print_type text not null check (print_type in ('bw', 'color', 'photo', 'xerox', 'document', 'lamination', 'binding', 'scanning')),
  copies integer not null default 1 check (copies > 0),
  paper_size text not null default 'A4',
  binding text not null default 'none',
  status text not null default 'Pending' check (status in ('Pending', 'Processing', 'Printed', 'Delivered')),
  total_price numeric(10, 2) not null default 0.00,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.orders enable row level security;

-- Users can only see their own orders
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Users can insert their own orders
create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Users can update their own orders
create policy "Users can update own orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Storage: Create bucket for print files
-- (Run this after enabling Storage in your Supabase project)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('print-files', 'print-files', true)
on conflict (id) do nothing;

-- Storage policy: authenticated users can upload to their folder
create policy "Users can upload own files"
  on storage.objects for insert
  with check (bucket_id = 'print-files' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: anyone can read files (for order tracking)
create policy "Public read access for print files"
  on storage.objects for select
  using (bucket_id = 'print-files');
