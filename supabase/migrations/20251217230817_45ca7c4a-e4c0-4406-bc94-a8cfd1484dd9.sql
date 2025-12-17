
-- Clean up ALL duplicate properties policies and create simple ones
DROP POLICY IF EXISTS "properties_delete_admin" ON properties;
DROP POLICY IF EXISTS "properties_delete_own" ON properties;
DROP POLICY IF EXISTS "properties_insert_confirmed_users" ON properties;
DROP POLICY IF EXISTS "properties_insert_own" ON properties;
DROP POLICY IF EXISTS "properties_read_own" ON properties;
DROP POLICY IF EXISTS "properties_select_authenticated" ON properties;
DROP POLICY IF EXISTS "properties_staff_select" ON properties;
DROP POLICY IF EXISTS "properties_update_own" ON properties;
DROP POLICY IF EXISTS "staff_manage_refs_props" ON properties;
DROP POLICY IF EXISTS "users_read_own_properties" ON properties;
DROP POLICY IF EXISTS "users_view_own_properties" ON properties;

-- Create ONE simple read policy for properties
CREATE POLICY "properties_read_authenticated" ON properties
FOR SELECT TO authenticated
USING (
  created_by = auth.uid() 
  OR manager_id = auth.uid()
);

-- Admin/Manager/Staff can read all
CREATE POLICY "properties_staff_read_all" ON properties
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role) 
  OR has_role(auth.uid(), 'staff'::app_role)
);

-- Insert policy
CREATE POLICY "properties_insert_authenticated" ON properties
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Update policy
CREATE POLICY "properties_update_authenticated" ON properties
FOR UPDATE TO authenticated
USING (
  created_by = auth.uid() 
  OR manager_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Delete policy (admin only)
CREATE POLICY "properties_delete_admin_only" ON properties
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add missing module permissions for customer role
INSERT INTO module_permissions (role, module_key, module_name, is_enabled)
VALUES 
  ('customer', 'reports', 'التقارير والإحصائيات', true),
  ('customer', 'documentation', 'التوثيق', true)
ON CONFLICT (role, module_key) DO NOTHING;
