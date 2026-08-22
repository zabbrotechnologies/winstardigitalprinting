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
  id text primary key,
  email text,
  full_name text not null default 'User',
  company_name text,
  gst_number text,
  business_address text,
  mobile text,
  business_details text,
  visiting_card_url text,
  business_proof_url text,
  role text not null default 'client',
  account_type text not null default 'client',
  status text not null default 'pending',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

drop policy if exists "Allow public read of profiles" on public.profiles;
create policy "Allow public read of profiles" on public.profiles for select using (true);

drop policy if exists "Allow insert on signup" on public.profiles;
create policy "Allow insert on signup" on public.profiles for insert with check (true);

drop policy if exists "Allow update by owner or admin" on public.profiles;
create policy "Allow update by owner or admin" on public.profiles for update using (true);

-- ============================================================
-- 2. wholesale_applications table (DEDICATED INDEPENDENT TABLE)
-- ============================================================
create table if not exists public.wholesale_applications (
  id text primary key,
  email text not null,
  full_name text not null,
  company_name text not null,
  gst_number text,
  business_address text,
  mobile text,
  visiting_card_url text,
  business_proof_url text,
  status text not null default 'pending',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.wholesale_applications enable row level security;

drop policy if exists "Allow public read of wholesale_applications" on public.wholesale_applications;
create policy "Allow public read of wholesale_applications" on public.wholesale_applications for select using (true);

drop policy if exists "Allow public insert of wholesale_applications" on public.wholesale_applications;
create policy "Allow public insert of wholesale_applications" on public.wholesale_applications for insert with check (true);

drop policy if exists "Allow public update of wholesale_applications" on public.wholesale_applications;
create policy "Allow public update of wholesale_applications" on public.wholesale_applications for update using (true);

-- ============================================================
-- 3. orders table (supports both guest quick prints, wholesale & user orders)
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
  order_type text not null default 'normal',
  total_price numeric(10, 2) not null default 0.00,
  status text not null default 'Pending',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.orders enable row level security;

drop policy if exists "Allow public insert on orders" on public.orders;
create policy "Allow public insert on orders" on public.orders for insert with check (true);

drop policy if exists "Allow public select on orders" on public.orders;
create policy "Allow public select on orders" on public.orders for select using (true);

drop policy if exists "Allow public update on orders" on public.orders;
create policy "Allow public update on orders" on public.orders for update using (true);

-- ============================================================
-- 4. Storage Bucket: print-files
-- ============================================================
insert into storage.buckets (id, name, public)
values ('print-files', 'print-files', true)
on conflict (id) do update set public = true;

drop policy if exists "Allow public uploads to print-files" on storage.objects;
create policy "Allow public uploads to print-files" on storage.objects for insert with check (bucket_id = 'print-files');

drop policy if exists "Allow public read on print-files" on storage.objects;
create policy "Allow public read on print-files" on storage.objects for select using (bucket_id = 'print-files');

drop policy if exists "Allow public update on print-files" on storage.objects;
create policy "Allow public update on print-files" on storage.objects for update using (bucket_id = 'print-files');
