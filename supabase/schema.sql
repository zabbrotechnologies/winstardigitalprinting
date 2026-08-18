-- ==============================================================================
-- WINSTAR DIGITAL PRINTING & XEROX - SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    auth_user_id UUID UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user', 'admin'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rejected_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rejection_reason TEXT
);

-- Index for status filtering and role checks
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ------------------------------------------------------------------------------
-- 2. COMPANIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_email VARCHAR(255),
    company_phone VARCHAR(50),
    gst_number VARCHAR(100),
    designation VARCHAR(100),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL DEFAULT 'Dindigul',
    state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    pincode VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(company_name);

-- ------------------------------------------------------------------------------
-- 3. SERVICE REQUESTS TABLE (Quick Print & Custom Orders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL for guest ordinary customers
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    service_type VARCHAR(100) NOT NULL DEFAULT 'quick_print',
    file_path TEXT, -- Supabase Storage file path
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size BIGINT,
    print_type VARCHAR(50) DEFAULT 'bw', -- 'bw', 'colour'
    print_sides VARCHAR(50) DEFAULT 'single', -- 'single', 'double'
    paper_size VARCHAR(50) DEFAULT 'A4',
    paper_gsm VARCHAR(50) DEFAULT '80gsm',
    paper_type VARCHAR(50) DEFAULT 'copier',
    orientation VARCHAR(50) DEFAULT 'portrait',
    print_count INT NOT NULL DEFAULT 1, -- copies
    page_count INT NOT NULL DEFAULT 1,
    page_range VARCHAR(100) DEFAULT 'all',
    binding_type VARCHAR(50) DEFAULT 'none',
    finishing VARCHAR(50) DEFAULT 'none',
    delivery_required BOOLEAN DEFAULT false,
    delivery_address TEXT,
    delivery_time VARCHAR(100),
    estimated_amount NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_user ON public.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_number ON public.service_requests(request_number);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES (Idempotent DROP IF EXISTS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
CREATE POLICY "Users can view own company" ON public.companies
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own company" ON public.companies;
CREATE POLICY "Users can update own company" ON public.companies
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can create service request" ON public.service_requests;
CREATE POLICY "Anyone can create service request" ON public.service_requests
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own service requests" ON public.service_requests;
CREATE POLICY "Users can view own service requests" ON public.service_requests
    FOR SELECT USING (auth.uid() = user_id);
