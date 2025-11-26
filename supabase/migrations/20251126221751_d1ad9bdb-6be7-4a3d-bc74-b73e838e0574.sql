-- =========================================
-- Technician Registration System Tables
-- =========================================

-- Main technician profiles table
CREATE TABLE IF NOT EXISTS technician_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Step 1: Basic Information
  company_name TEXT NOT NULL,
  company_type TEXT CHECK (company_type IN ('individual', 'small_team', 'company')),
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
  
  -- Step 4: Rates - General pricing notes
  pricing_notes TEXT,
  
  -- Step 7: Extended Information
  company_model TEXT CHECK (company_model IN ('local_provider', 'third_party')),
  number_of_inhouse_technicians INTEGER,
  number_of_office_staff INTEGER,
  accepts_emergency_jobs BOOLEAN DEFAULT false,
  accepts_national_contracts BOOLEAN DEFAULT false,
  additional_notes TEXT,
  
  -- Step 9: Terms
  agree_terms BOOLEAN DEFAULT false,
  agree_payment_terms BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  
  -- Status tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 4: Service pricing per technician
CREATE TABLE IF NOT EXISTS technician_service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL,
  
  standard_price NUMERIC(10,2) NOT NULL,
  emergency_price NUMERIC(10,2),
  night_weekend_price NUMERIC(10,2),
  min_job_value NUMERIC(10,2),
  material_markup_percent NUMERIC(5,2),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(technician_id, service_id)
);

-- Step 5: Trades/Skills per technician
CREATE TABLE IF NOT EXISTS technician_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL,
  years_of_experience INTEGER,
  
  licenses_or_certifications TEXT,
  can_handle_heavy_projects BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(technician_id, category_id)
);

-- Step 6: Coverage areas
CREATE TABLE IF NOT EXISTS technician_coverage_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE,
  city_id BIGINT REFERENCES cities(id),
  district_id BIGINT REFERENCES districts(id),
  radius_km INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(technician_id, city_id, district_id)
);

-- Step 8: Document uploads
CREATE TABLE IF NOT EXISTS technician_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES technician_profiles(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('tax_card', 'commercial_registration', 'national_id', 'insurance_certificate', 'professional_license')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tech_profiles_status ON technician_profiles(status);
CREATE INDEX IF NOT EXISTS idx_tech_profiles_user_id ON technician_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tech_profiles_city ON technician_profiles(city_id);
CREATE INDEX IF NOT EXISTS idx_tech_service_prices_tech ON technician_service_prices(technician_id);
CREATE INDEX IF NOT EXISTS idx_tech_trades_tech ON technician_trades(technician_id);
CREATE INDEX IF NOT EXISTS idx_tech_coverage_tech ON technician_coverage_areas(technician_id);
CREATE INDEX IF NOT EXISTS idx_tech_docs_tech ON technician_documents(technician_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_technician_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tech_profiles_updated_at
  BEFORE UPDATE ON technician_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_updated_at();

CREATE TRIGGER trg_tech_service_prices_updated_at
  BEFORE UPDATE ON technician_service_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_updated_at();

-- RLS Policies
ALTER TABLE technician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_service_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_coverage_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_documents ENABLE ROW LEVEL SECURITY;

-- Technicians can view/edit their own profile
CREATE POLICY tech_profiles_own_access ON technician_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY tech_profiles_admin_access ON technician_profiles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Service prices policies
CREATE POLICY tech_service_prices_own ON technician_service_prices
  FOR ALL USING (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY tech_service_prices_admin ON technician_service_prices
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trades policies
CREATE POLICY tech_trades_own ON technician_trades
  FOR ALL USING (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY tech_trades_admin ON technician_trades
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Coverage areas policies
CREATE POLICY tech_coverage_own ON technician_coverage_areas
  FOR ALL USING (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY tech_coverage_admin ON technician_coverage_areas
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Documents policies
CREATE POLICY tech_docs_own ON technician_documents
  FOR ALL USING (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY tech_docs_admin ON technician_documents
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

COMMENT ON TABLE technician_profiles IS 'Main technician/vendor registration profiles';
COMMENT ON TABLE technician_service_prices IS 'Per-service pricing for each technician (lump-sum, not hourly)';
COMMENT ON TABLE technician_trades IS 'Skills and trade categories per technician';
COMMENT ON TABLE technician_coverage_areas IS 'Service coverage areas (cities/districts)';
COMMENT ON TABLE technician_documents IS 'Uploaded documents (IDs, licenses, insurance)';