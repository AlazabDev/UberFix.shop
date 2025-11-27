-- ========================================
-- TECHNICIAN REGISTRATION SYSTEM - COMPLETE DATABASE SCHEMA
-- ========================================

-- Drop existing incomplete tables if they exist
DROP TABLE IF EXISTS technician_documents CASCADE;
DROP TABLE IF EXISTS technician_coverage_areas CASCADE;
DROP TABLE IF EXISTS technician_service_prices CASCADE;
DROP TABLE IF EXISTS technician_trades CASCADE;
DROP TABLE IF EXISTS technician_agreements CASCADE;
DROP TABLE IF EXISTS technician_verifications CASCADE;
DROP TABLE IF EXISTS technician_applications CASCADE;

-- Create ENUM for technician status
DO $$ BEGIN
    CREATE TYPE technician_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'active', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ENUM for company type
DO $$ BEGIN
    CREATE TYPE company_type_enum AS ENUM ('individual', 'small_team', 'company');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ENUM for company model
DO $$ BEGIN
    CREATE TYPE company_model_enum AS ENUM ('local_provider', 'third_party');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ENUM for document type
DO $$ BEGIN
    CREATE TYPE document_type_enum AS ENUM ('tax_card', 'commercial_registration', 'national_id', 'insurance_certificate', 'professional_license');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- 1. TECHNICIAN PROFILES (Main Table)
-- ========================================
CREATE TABLE IF NOT EXISTS technician_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Step 1: Basic Info
    company_name TEXT NOT NULL,
    company_type company_type_enum NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'ar',
    
    -- Step 2: Address
    service_email TEXT,
    contact_name TEXT,
    country TEXT DEFAULT 'Egypt',
    city_id BIGINT REFERENCES cities(id),
    district_id BIGINT REFERENCES districts(id),
    street_address TEXT,
    building_no TEXT,
    floor TEXT,
    unit TEXT,
    landmark TEXT,
    accounting_name TEXT,
    accounting_email TEXT,
    accounting_phone TEXT,
    
    -- Step 3: Insurance
    has_insurance BOOLEAN DEFAULT false,
    insurance_company_name TEXT,
    policy_number TEXT,
    policy_expiry_date DATE,
    insurance_notes TEXT,
    
    -- Step 4: Pricing (JSON for now, normalized in separate table)
    pricing_notes TEXT,
    
    -- Step 7: Extended Info
    company_model company_model_enum,
    number_of_inhouse_technicians INTEGER,
    number_of_office_staff INTEGER,
    accepts_emergency_jobs BOOLEAN DEFAULT false,
    accepts_national_contracts BOOLEAN DEFAULT false,
    additional_notes TEXT,
    
    -- Step 9: Terms
    agree_terms BOOLEAN DEFAULT false,
    agree_payment_terms BOOLEAN DEFAULT false,
    
    -- Status and Metadata
    status technician_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    rejection_reason TEXT
);

-- ========================================
-- 2. TECHNICIAN SERVICE PRICES
-- ========================================
CREATE TABLE IF NOT EXISTS technician_service_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE NOT NULL,
    service_id INTEGER REFERENCES service_items(id) ON DELETE CASCADE NOT NULL,
    service_name TEXT,
    standard_price NUMERIC(10,2) NOT NULL,
    emergency_price NUMERIC(10,2),
    night_weekend_price NUMERIC(10,2),
    min_job_value NUMERIC(10,2),
    material_markup_percent NUMERIC(5,2),
    platform_price NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(technician_id, service_id)
);

-- ========================================
-- 3. TECHNICIAN TRADES
-- ========================================
CREATE TABLE IF NOT EXISTS technician_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES service_categories(id) ON DELETE CASCADE NOT NULL,
    category_name TEXT,
    years_of_experience INTEGER,
    licenses_or_certifications TEXT,
    can_handle_heavy_projects BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(technician_id, category_id)
);

-- ========================================
-- 4. TECHNICIAN COVERAGE AREAS
-- ========================================
CREATE TABLE IF NOT EXISTS technician_coverage_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE NOT NULL,
    city_id BIGINT REFERENCES cities(id) ON DELETE CASCADE,
    district_id BIGINT REFERENCES districts(id) ON DELETE CASCADE,
    radius_km NUMERIC(5,2),
    city_name TEXT,
    district_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- 5. TECHNICIAN DOCUMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS technician_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE NOT NULL,
    document_type document_type_enum NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- 6. TECHNICIAN VERIFICATIONS
-- ========================================
CREATE TABLE IF NOT EXISTS technician_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE NOT NULL,
    national_id_front TEXT,
    national_id_back TEXT,
    selfie_image TEXT,
    verification_status TEXT DEFAULT 'pending',
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- 7. TECHNICIAN AGREEMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS technician_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE NOT NULL,
    quality_policy_accepted BOOLEAN DEFAULT false,
    conduct_policy_accepted BOOLEAN DEFAULT false,
    pricing_policy_accepted BOOLEAN DEFAULT false,
    customer_respect_policy_accepted BOOLEAN DEFAULT false,
    punctuality_policy_accepted BOOLEAN DEFAULT false,
    signed_at TIMESTAMPTZ,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_technician_profiles_status ON technician_profiles(status);
CREATE INDEX IF NOT EXISTS idx_technician_profiles_user_id ON technician_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_technician_profiles_city ON technician_profiles(city_id);
CREATE INDEX IF NOT EXISTS idx_technician_service_prices_technician ON technician_service_prices(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_trades_technician ON technician_trades(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_coverage_areas_technician ON technician_coverage_areas(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_documents_technician ON technician_documents(technician_id);

-- ========================================
-- RLS POLICIES
-- ========================================

-- technician_profiles
ALTER TABLE technician_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own profile"
ON technician_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own profile"
ON technician_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own draft profile"
ON technician_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'draft')
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
ON technician_profiles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- technician_service_prices
ALTER TABLE technician_service_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own service prices"
ON technician_service_prices FOR ALL
TO authenticated
USING (
    technician_id IN (
        SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
);

-- technician_trades
ALTER TABLE technician_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own trades"
ON technician_trades FOR ALL
TO authenticated
USING (
    technician_id IN (
        SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
);

-- technician_coverage_areas
ALTER TABLE technician_coverage_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own coverage areas"
ON technician_coverage_areas FOR ALL
TO authenticated
USING (
    technician_id IN (
        SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
);

-- technician_documents
ALTER TABLE technician_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own documents"
ON technician_documents FOR ALL
TO authenticated
USING (
    technician_id IN (
        SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
);

-- technician_verifications
ALTER TABLE technician_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification"
ON technician_verifications FOR SELECT
TO authenticated
USING (
    technician_id IN (
        SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage verifications"
ON technician_verifications FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- technician_agreements
ALTER TABLE technician_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own agreements"
ON technician_agreements FOR ALL
TO authenticated
USING (
    technician_id IN (
        SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_technician_profiles_updated_at
    BEFORE UPDATE ON technician_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();