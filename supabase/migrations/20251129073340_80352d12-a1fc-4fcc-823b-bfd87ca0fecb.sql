-- ============================================
-- Fix: Auth RLS Performance Issues - Part 1
-- Replace auth.uid() with (select auth.uid()) 
-- ============================================

-- vendors table
DROP POLICY IF EXISTS "vendors_admin_insert" ON vendors;
DROP POLICY IF EXISTS "vendors_admin_update" ON vendors;
DROP POLICY IF EXISTS "vendors_admin_delete" ON vendors;

CREATE POLICY "vendors_admin_insert" ON vendors FOR INSERT
  WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "vendors_admin_update" ON vendors FOR UPDATE
  USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "vendors_admin_delete" ON vendors FOR DELETE
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- user_roles table
DROP POLICY IF EXISTS "admins_update_roles_safe" ON user_roles;
DROP POLICY IF EXISTS "admins_can_update_roles" ON user_roles;

CREATE POLICY "admins_update_roles_safe" ON user_roles FOR UPDATE
  USING (has_role((select auth.uid()), 'admin'::app_role))
  WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "admins_can_update_roles" ON user_roles FOR ALL
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- service tables
DROP POLICY IF EXISTS "pol_service_categories_admin" ON service_categories;
DROP POLICY IF EXISTS "pol_service_subcats_admin" ON service_subcategories;
DROP POLICY IF EXISTS "pol_service_items_admin" ON service_items;
DROP POLICY IF EXISTS "pol_service_addons_admin" ON service_addons;
DROP POLICY IF EXISTS "pol_service_packages_admin" ON service_packages;

CREATE POLICY "pol_service_categories_admin" ON service_categories FOR ALL
  USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "pol_service_subcats_admin" ON service_subcategories FOR ALL
  USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "pol_service_items_admin" ON service_items FOR ALL
  USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "pol_service_addons_admin" ON service_addons FOR ALL
  USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "pol_service_packages_admin" ON service_packages FOR ALL
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- app_control table
DROP POLICY IF EXISTS "admins_update_app_control_safe" ON app_control;

CREATE POLICY "admins_update_app_control_safe" ON app_control FOR UPDATE
  USING (has_role((select auth.uid()), 'admin'::app_role))
  WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

-- service_orders table
DROP POLICY IF EXISTS "pol_service_orders_view_all" ON service_orders;
DROP POLICY IF EXISTS "pol_service_orders_insert_authenticated" ON service_orders;
DROP POLICY IF EXISTS "pol_service_orders_admin_all" ON service_orders;

CREATE POLICY "pol_service_orders_view_all" ON service_orders FOR SELECT
  USING (has_role((select auth.uid()), 'admin'::app_role) OR has_role((select auth.uid()), 'staff'::app_role));

CREATE POLICY "pol_service_orders_insert_authenticated" ON service_orders FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "pol_service_orders_admin_all" ON service_orders FOR ALL
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- technician_performance table (technicians.user_id exists)
DROP POLICY IF EXISTS "Technicians view own performance" ON technician_performance;
DROP POLICY IF EXISTS "Admins manage performance" ON technician_performance;

CREATE POLICY "Technicians view own performance" ON technician_performance FOR SELECT
  USING (has_role((select auth.uid()), 'admin'::app_role) OR has_role((select auth.uid()), 'staff'::app_role));

CREATE POLICY "Admins manage performance" ON technician_performance FOR ALL
  USING (has_role((select auth.uid()), 'admin'::app_role) OR has_role((select auth.uid()), 'manager'::app_role));

-- technician_tasks table
DROP POLICY IF EXISTS "Technicians view own tasks" ON technician_tasks;
DROP POLICY IF EXISTS "Staff manage tasks" ON technician_tasks;

CREATE POLICY "Technicians view own tasks" ON technician_tasks FOR SELECT
  USING (has_role((select auth.uid()), 'admin'::app_role) OR has_role((select auth.uid()), 'staff'::app_role));

CREATE POLICY "Staff manage tasks" ON technician_tasks FOR ALL
  USING (has_role((select auth.uid()), 'admin'::app_role) OR has_role((select auth.uid()), 'staff'::app_role));

-- branch_locations table
DROP POLICY IF EXISTS "admins_manage_branch_locations_safe" ON branch_locations;

CREATE POLICY "admins_manage_branch_locations_safe" ON branch_locations FOR ALL
  USING (has_role((select auth.uid()), 'admin'::app_role))
  WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

-- role_permissions table
DROP POLICY IF EXISTS "admins_update_permissions" ON role_permissions;
DROP POLICY IF EXISTS "admins_delete_permissions" ON role_permissions;

CREATE POLICY "admins_update_permissions" ON role_permissions FOR UPDATE
  USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "admins_delete_permissions" ON role_permissions FOR DELETE
  USING (has_role((select auth.uid()), 'admin'::app_role));

-- push_subscriptions table
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON push_subscriptions;

CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions FOR ALL
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));