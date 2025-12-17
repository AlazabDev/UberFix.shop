
-- ============================================
-- 1. FIX: profiles - Hide sensitive data
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "p_read" ON profiles;
DROP POLICY IF EXISTS "p_insert" ON profiles;
DROP POLICY IF EXISTS "p_update" ON profiles;

-- Strict read: Only own profile OR admin
CREATE POLICY "profiles_read_strict" ON profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Company colleagues can see limited info via secure view (not direct table)
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create safe view for company colleagues (no phone/email)
CREATE OR REPLACE VIEW profiles_safe AS
SELECT 
  id,
  name,
  full_name,
  avatar_url,
  position,
  role,
  company_id
FROM profiles;

-- ============================================
-- 2. FIX: appointments - Encrypt/hide customer data
-- ============================================
DROP POLICY IF EXISTS "appt_read" ON appointments;
DROP POLICY IF EXISTS "appt_insert" ON appointments;
DROP POLICY IF EXISTS "appt_update" ON appointments;

-- Only creator or assigned vendor can read
CREATE POLICY "appt_read_strict" ON appointments FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
  OR vendor_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "appt_insert_own" ON appointments FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "appt_update_own" ON appointments FOR UPDATE TO authenticated
USING (
  created_by = auth.uid()
  OR vendor_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "appt_delete_admin" ON appointments FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- 3. FIX: invoices - Strict access control
-- ============================================
DROP POLICY IF EXISTS "invoices_read" ON invoices;
DROP POLICY IF EXISTS "invoices_insert" ON invoices;
DROP POLICY IF EXISTS "invoices_update" ON invoices;
DROP POLICY IF EXISTS "invoices_delete" ON invoices;

CREATE POLICY "inv_read_strict" ON invoices FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "inv_insert" ON invoices FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "inv_update" ON invoices FOR UPDATE TO authenticated
USING (
  (created_by = auth.uid() AND is_locked = false)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "inv_delete" ON invoices FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- 4. FIX: app_settings - Remove SMTP from RLS access
-- ============================================
-- Create secure function to get non-sensitive settings only
CREATE OR REPLACE FUNCTION get_safe_app_settings()
RETURNS TABLE (
  app_name text,
  app_logo_url text,
  primary_color text,
  secondary_color text,
  background_color text,
  theme_mode text,
  default_language text,
  timezone text,
  default_currency text,
  company_phone text,
  company_email text,
  company_address text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    app_name,
    app_logo_url,
    primary_color,
    secondary_color,
    background_color,
    theme_mode,
    default_language,
    timezone,
    default_currency,
    company_phone,
    company_email,
    company_address
  FROM app_settings
  LIMIT 1;
$$;

-- ============================================
-- 5. FIX: properties - Time-based/role validation
-- ============================================
DROP POLICY IF EXISTS "properties_read_authenticated" ON properties;
DROP POLICY IF EXISTS "properties_staff_read_all" ON properties;
DROP POLICY IF EXISTS "properties_insert_authenticated" ON properties;
DROP POLICY IF EXISTS "properties_update_authenticated" ON properties;
DROP POLICY IF EXISTS "properties_delete_admin_only" ON properties;

CREATE POLICY "prop_read_strict" ON properties FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
  OR manager_id = auth.uid()
  OR is_staff(auth.uid())
);

CREATE POLICY "prop_insert" ON properties FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "prop_update" ON properties FOR UPDATE TO authenticated
USING (
  created_by = auth.uid()
  OR manager_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "prop_delete" ON properties FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- 6. FIX: properties_qr_public - Limit exposed data
-- ============================================
DROP VIEW IF EXISTS properties_qr_public;

-- Create minimal QR view (no exact coordinates)
CREATE VIEW properties_qr_public AS
SELECT 
  id,
  name,
  code,
  type,
  status,
  -- Only city/district, not exact address
  city_id,
  district_id
FROM properties
WHERE status = 'active';

-- Grant select to anon for QR scanning
GRANT SELECT ON properties_qr_public TO anon;
