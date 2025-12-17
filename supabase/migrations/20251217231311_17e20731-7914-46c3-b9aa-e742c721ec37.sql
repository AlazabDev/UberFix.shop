
-- ============================================
-- CLEANUP: maintenance_requests (7 → 5 policies)
-- ============================================
DROP POLICY IF EXISTS "Technicians can view assigned requests" ON maintenance_requests;
DROP POLICY IF EXISTS "maintenance_requests_secure_read" ON maintenance_requests;
DROP POLICY IF EXISTS "maintenance_requests_delete" ON maintenance_requests;
DROP POLICY IF EXISTS "Validated public request insert" ON maintenance_requests;
DROP POLICY IF EXISTS "Technicians can update assigned requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Allow users to manage MRs within their company" ON maintenance_requests;
DROP POLICY IF EXISTS "maintenance_requests_update" ON maintenance_requests;

-- Read: owner, assigned tech, or staff
CREATE POLICY "mr_read" ON maintenance_requests FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
  OR assigned_technician_id = get_technician_id_for_user(auth.uid())
  OR company_id = get_current_user_company_id()
  OR is_staff(auth.uid())
);

-- Insert: authenticated users
CREATE POLICY "mr_insert" ON maintenance_requests FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Public insert for QR code requests (unauthenticated)
CREATE POLICY "mr_public_insert" ON maintenance_requests FOR INSERT TO anon
WITH CHECK (
  property_id IS NOT NULL
  AND client_name IS NOT NULL
  AND length(trim(client_name)) >= 3
  AND client_phone IS NOT NULL
  AND length(client_phone) >= 10
);

-- Update: owner, assigned tech, or staff
CREATE POLICY "mr_update" ON maintenance_requests FOR UPDATE TO authenticated
USING (
  created_by = auth.uid()
  OR assigned_technician_id = get_technician_id_for_user(auth.uid())
  OR is_staff(auth.uid())
);

-- Delete: staff only
CREATE POLICY "mr_delete" ON maintenance_requests FOR DELETE TO authenticated
USING (is_staff(auth.uid()));

-- ============================================
-- CLEANUP: profiles (6 → 4 policies)
-- ============================================
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_company_colleagues_read" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_owner_read_all" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_read_all" ON profiles;

CREATE POLICY "p_read" ON profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR company_id = get_current_user_company_id()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR is_owner_email()
);

CREATE POLICY "p_insert" ON profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "p_update" ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
