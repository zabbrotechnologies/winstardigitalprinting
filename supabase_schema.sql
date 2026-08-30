-- ============================================================
-- Winstar / Xerox Digital Pro — FINAL Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor -> New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. profiles table (extends auth.users with wholesale & admin support)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key, -- matches auth.users.id
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

-- Function to check if current user is admin (bypasses RLS to prevent recursion)
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Policies for profiles
drop policy if exists "Allow public read of profiles" on public.profiles;
create policy "Allow read own profile or admin" on public.profiles for select using (
  auth.uid() = id OR public.is_admin()
);

drop policy if exists "Allow insert on signup" on public.profiles;
create policy "Allow insert own profile" on public.profiles for insert with check (
  auth.uid() = id
);

drop policy if exists "Allow update by owner or admin" on public.profiles;
create policy "Allow update own profile or admin" on public.profiles for update using (
  auth.uid() = id OR public.is_admin()
);

drop policy if exists "Allow delete on profiles" on public.profiles;
create policy "Allow delete by admin" on public.profiles for delete using (
  public.is_admin()
);


-- ============================================================
-- 2. wholesale_applications table (DEDICATED INDEPENDENT TABLE)
-- ============================================================
create table if not exists public.wholesale_applications (
  id uuid default gen_random_uuid() primary key,
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

-- Policies for wholesale_applications
drop policy if exists "Allow public read of wholesale_applications" on public.wholesale_applications;
create policy "Allow admin read wholesale_applications" on public.wholesale_applications for select using (
  public.is_admin()
);

drop policy if exists "Allow public insert of wholesale_applications" on public.wholesale_applications;
create policy "Allow public insert of wholesale_applications" on public.wholesale_applications for insert with check (true);

drop policy if exists "Allow public update of wholesale_applications" on public.wholesale_applications;
create policy "Allow admin update wholesale_applications" on public.wholesale_applications for update using (
  public.is_admin()
);

drop policy if exists "Allow public delete of wholesale_applications" on public.wholesale_applications;
create policy "Allow admin delete wholesale_applications" on public.wholesale_applications for delete using (
  public.is_admin()
);


-- ============================================================
-- 3. orders table (supports both guest quick prints, wholesale & user orders)
-- ============================================================
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  request_id text not null unique,
  user_id uuid default null, -- null for guest orders, or auth.users.id
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

-- Policies for orders
drop policy if exists "Allow public insert on orders" on public.orders;
create policy "Allow public insert on orders" on public.orders for insert with check (true);

drop policy if exists "Allow public select on orders" on public.orders;
create policy "Allow read own orders or admin" on public.orders for select using (
  auth.uid() = user_id OR public.is_admin()
);

drop policy if exists "Allow public update on orders" on public.orders;
create policy "Allow update own orders or admin" on public.orders for update using (
  auth.uid() = user_id OR public.is_admin()
);

drop policy if exists "Allow public delete on orders" on public.orders;
create policy "Allow delete own orders or admin" on public.orders for delete using (
  auth.uid() = user_id OR public.is_admin()
);


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

drop policy if exists "Allow public delete on print-files" on storage.objects;
create policy "Allow public delete on print-files" on storage.objects for delete using (bucket_id = 'print-files');
