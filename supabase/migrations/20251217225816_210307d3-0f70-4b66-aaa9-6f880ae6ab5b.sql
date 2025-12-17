-- Drop all existing properties policies
DROP POLICY IF EXISTS "properties_secure_read" ON properties;
DROP POLICY IF EXISTS "properties_secure_write" ON properties;
DROP POLICY IF EXISTS "properties_read_own" ON properties;
DROP POLICY IF EXISTS "properties_insert_own" ON properties;
DROP POLICY IF EXISTS "properties_update_own" ON properties;
DROP POLICY IF EXISTS "properties_delete_admin" ON properties;
DROP POLICY IF EXISTS "Allow authenticated users to read properties" ON properties;
DROP POLICY IF EXISTS "Allow staff to manage properties" ON properties;
DROP POLICY IF EXISTS "properties_public_qr_read" ON properties;

-- Create simple policies without profiles dependency
CREATE POLICY "properties_read_own" ON properties
FOR SELECT USING (
  auth.uid() = created_by
  OR auth.uid() = manager_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY "properties_insert_own" ON properties
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "properties_update_own" ON properties
FOR UPDATE USING (
  auth.uid() = created_by
  OR auth.uid() = manager_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "properties_delete_admin" ON properties
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));