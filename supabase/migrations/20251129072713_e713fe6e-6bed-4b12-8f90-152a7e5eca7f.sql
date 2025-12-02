-- ============================================
-- Migration: Complete Foreign Keys & RLS Policies for Production
-- ============================================

-- Add missing Foreign Keys
ALTER TABLE technician_service_prices 
  DROP CONSTRAINT IF EXISTS technician_service_prices_technician_id_fkey,
  ADD CONSTRAINT technician_service_prices_technician_profile_id_fkey 
  FOREIGN KEY (technician_id) REFERENCES technician_profiles(id) ON DELETE CASCADE;

ALTER TABLE technician_trades
  DROP CONSTRAINT IF EXISTS technician_trades_technician_id_fkey,
  ADD CONSTRAINT technician_trades_technician_profile_id_fkey
  FOREIGN KEY (technician_id) REFERENCES technician_profiles(id) ON DELETE CASCADE;

ALTER TABLE technician_coverage_areas
  DROP CONSTRAINT IF EXISTS technician_coverage_areas_technician_id_fkey,
  ADD CONSTRAINT technician_coverage_areas_technician_profile_id_fkey
  FOREIGN KEY (technician_id) REFERENCES technician_profiles(id) ON DELETE CASCADE;

ALTER TABLE technician_documents
  DROP CONSTRAINT IF EXISTS technician_documents_technician_id_fkey,
  ADD CONSTRAINT technician_documents_technician_profile_id_fkey
  FOREIGN KEY (technician_id) REFERENCES technician_profiles(id) ON DELETE CASCADE;

-- Add Foreign Keys for technician performance tables
ALTER TABLE technician_performance
  DROP CONSTRAINT IF EXISTS technician_performance_technician_id_fkey,
  ADD CONSTRAINT technician_performance_technician_id_fkey
  FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;

ALTER TABLE technician_wallet
  DROP CONSTRAINT IF EXISTS technician_wallet_technician_id_fkey,
  ADD CONSTRAINT technician_wallet_technician_id_fkey
  FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;

ALTER TABLE technician_tasks
  DROP CONSTRAINT IF EXISTS technician_tasks_technician_id_fkey,
  ADD CONSTRAINT technician_tasks_technician_id_fkey
  FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;

ALTER TABLE technician_badges
  DROP CONSTRAINT IF EXISTS technician_badges_technician_id_fkey,
  ADD CONSTRAINT technician_badges_technician_id_fkey
  FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;

ALTER TABLE technician_levels
  DROP CONSTRAINT IF EXISTS technician_levels_technician_id_fkey,
  ADD CONSTRAINT technician_levels_technician_id_fkey
  FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;

-- ============================================
-- RLS Policies for technician_profiles
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Technicians manage own draft profile" ON technician_profiles;
DROP POLICY IF EXISTS "Admins and managers manage all profiles" ON technician_profiles;
DROP POLICY IF EXISTS "Public can insert draft profiles" ON technician_profiles;
DROP POLICY IF EXISTS "Technicians view own profiles" ON technician_profiles;
DROP POLICY IF EXISTS "Staff view all profiles" ON technician_profiles;

-- Allow public to create draft profiles (registration)
CREATE POLICY "Public can insert draft profiles"
  ON technician_profiles FOR INSERT
  WITH CHECK (true);

-- Technicians can view and update their own draft profiles
CREATE POLICY "Technicians manage own draft profile"
  ON technician_profiles FOR ALL
  USING (user_id = auth.uid() AND status = 'draft')
  WITH CHECK (user_id = auth.uid() AND status = 'draft');

-- Admins and managers can manage all profiles
CREATE POLICY "Admins and managers manage all profiles"
  ON technician_profiles FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role)
  );

-- Technicians can view their own profiles (any status)
CREATE POLICY "Technicians view own profiles"
  ON technician_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Staff can view all profiles
CREATE POLICY "Staff view all profiles"
  ON technician_profiles FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'staff'::app_role)
  );

-- ============================================
-- RLS Policies for junction tables
-- ============================================

-- technician_service_prices
DROP POLICY IF EXISTS "Technicians manage own service prices" ON technician_service_prices;
DROP POLICY IF EXISTS "Staff view all service prices" ON technician_service_prices;

CREATE POLICY "Technicians manage own service prices"
  ON technician_service_prices FOR ALL
  USING (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff view all service prices"
  ON technician_service_prices FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'staff'::app_role)
  );

-- technician_trades
DROP POLICY IF EXISTS "Technicians manage own trades" ON technician_trades;
DROP POLICY IF EXISTS "Staff view all trades" ON technician_trades;

CREATE POLICY "Technicians manage own trades"
  ON technician_trades FOR ALL
  USING (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff view all trades"
  ON technician_trades FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'staff'::app_role)
  );

-- technician_coverage_areas
DROP POLICY IF EXISTS "Technicians manage own coverage areas" ON technician_coverage_areas;
DROP POLICY IF EXISTS "Staff view all coverage areas" ON technician_coverage_areas;

CREATE POLICY "Technicians manage own coverage areas"
  ON technician_coverage_areas FOR ALL
  USING (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff view all coverage areas"
  ON technician_coverage_areas FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'staff'::app_role)
  );

-- technician_documents
DROP POLICY IF EXISTS "Technicians manage own documents" ON technician_documents;
DROP POLICY IF EXISTS "Staff view all documents" ON technician_documents;

CREATE POLICY "Technicians manage own documents"
  ON technician_documents FOR ALL
  USING (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff view all documents"
  ON technician_documents FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'staff'::app_role)
  );

-- ============================================
-- Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_technician_profiles_user_id ON technician_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_technician_profiles_status ON technician_profiles(status);
CREATE INDEX IF NOT EXISTS idx_technician_service_prices_technician_id ON technician_service_prices(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_trades_technician_id ON technician_trades(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_coverage_areas_technician_id ON technician_coverage_areas(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_documents_technician_id ON technician_documents(technician_id);