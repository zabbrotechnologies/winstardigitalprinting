-- ============================================================
-- Winstar / Xerox Digital Pro — Comprehensive Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. profiles table (extends auth.users with wholesale & admin support)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text not null default 'User',
  company_name text,
  gst_number text,
  business_address text,
  mobile text,
  business_details text,
  visiting_card_url text,
  business_proof_url text,
  role text not null default 'client', -- 'admin', 'wholesale', 'client'
  account_type text not null default 'client', -- 'wholesale', 'client'
  status text not null default 'approved', -- 'pending', 'approved', 'rejected'
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Allow public read of profiles"
  on public.profiles for select
  using (true);

create policy "Allow insert on signup"
  on public.profiles for insert
  with check (true);

create policy "Allow update by owner or admin"
  on public.profiles for update
  using (auth.uid() = id or exists (
    select 1 from public.profiles where id = auth.uid() and (role = 'admin' or email ilike '%admin%')
  ));

-- ============================================================
-- 2. orders table (supports both guest quick prints, wholesale & user orders)
-- ============================================================
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  request_id text not null unique,
  user_id text default 'guest',
  customer_name text not null,
  customer_phone text not null,
  service_name text default 'Print Service',
  file_name text not null default 'print-file.pdf',
  file_url text,
  file_id text,
  print_type text not null default 'bw',
  copies integer not null default 1,
  paper_size text not null default 'A4',
  paper_gsm text not null default '80 GSM',
  binding text not null default 'none',
  delivery_type text not null default 'pickup',
  delivery_address text default '',
  order_type text not null default 'normal', -- 'normal', 'wholesale'
  total_price numeric(10, 2) not null default 0.00,
  status text not null default 'Pending',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.orders enable row level security;

-- Allow anyone to create an order (Quick Print guests & logged-in users)
create policy "Allow public insert on orders"
  on public.orders for insert
  with check (true);

-- Allow anyone to read orders for tracking or dashboard
create policy "Allow public select on orders"
  on public.orders for select
  using (true);

-- Allow updates (for admin status changes)
create policy "Allow public update on orders"
  on public.orders for update
  using (true);

-- ============================================================
-- 3. Storage Bucket: print-files
-- ============================================================
insert into storage.buckets (id, name, public)
values ('print-files', 'print-files', true)
on conflict (id) do update set public = true;

-- Storage policies: allow public uploads and reading
create policy "Allow public uploads to print-files"
  on storage.objects for insert
  with check (bucket_id = 'print-files');

create policy "Allow public read on print-files"
  on storage.objects for select
  using (bucket_id = 'print-files');

create policy "Allow public update on print-files"
  on storage.objects for update
  using (bucket_id = 'print-files');
