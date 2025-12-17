
-- ============================================
-- CLEANUP: technician_profiles (9 → 4 policies)
-- ============================================
DROP POLICY IF EXISTS "techprof_own_read" ON technician_profiles;
DROP POLICY IF EXISTS "techprof_own_update" ON technician_profiles;
DROP POLICY IF EXISTS "techprof_read_own" ON technician_profiles;
DROP POLICY IF EXISTS "techprof_update_draft" ON technician_profiles;
DROP POLICY IF EXISTS "techprof_own_insert" ON technician_profiles;
DROP POLICY IF EXISTS "techprof_manager_review" ON technician_profiles;
DROP POLICY IF EXISTS "techprof_controlled_insert" ON technician_profiles;
DROP POLICY IF EXISTS "techprof_admin_manage" ON technician_profiles;
DROP POLICY IF EXISTS "technician_profiles_own_or_admin_manage" ON technician_profiles;

-- Create 4 clean policies
CREATE POLICY "tp_read" ON technician_profiles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "tp_insert" ON technician_profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "tp_update" ON technician_profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "tp_delete" ON technician_profiles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- CLEANUP: technician_tasks (7 → 4 policies)
-- ============================================
DROP POLICY IF EXISTS "pol_tech_tasks_view" ON technician_tasks;
DROP POLICY IF EXISTS "pol_tech_tasks_admin" ON technician_tasks;
DROP POLICY IF EXISTS "pol_tech_tasks_update" ON technician_tasks;
DROP POLICY IF EXISTS "Technicians view own tasks" ON technician_tasks;
DROP POLICY IF EXISTS "Technicians manage tasks" ON technician_tasks;
DROP POLICY IF EXISTS "Staff manage tasks" ON technician_tasks;
DROP POLICY IF EXISTS "Technicians manage own tasks" ON technician_tasks;

CREATE POLICY "tt_read" ON technician_tasks FOR SELECT TO authenticated
USING (technician_id = get_technician_id_for_user(auth.uid()) OR is_staff(auth.uid()));

CREATE POLICY "tt_insert" ON technician_tasks FOR INSERT TO authenticated
WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "tt_update" ON technician_tasks FOR UPDATE TO authenticated
USING (technician_id = get_technician_id_for_user(auth.uid()) OR is_staff(auth.uid()));

CREATE POLICY "tt_delete" ON technician_tasks FOR DELETE TO authenticated
USING (is_staff(auth.uid()));

-- ============================================
-- CLEANUP: vendors (6 → 4 policies)
-- ============================================
DROP POLICY IF EXISTS "vendors_admin_insert" ON vendors;
DROP POLICY IF EXISTS "Admins and managers can view all vendor data" ON vendors;
DROP POLICY IF EXISTS "vendors_select_authenticated" ON vendors;
DROP POLICY IF EXISTS "vendors_authenticated_read" ON vendors;
DROP POLICY IF EXISTS "vendors_admin_update" ON vendors;
DROP POLICY IF EXISTS "vendors_admin_delete" ON vendors;

CREATE POLICY "v_read" ON vendors FOR SELECT TO authenticated USING (true);

CREATE POLICY "v_insert" ON vendors FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "v_update" ON vendors FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "v_delete" ON vendors FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- CLEANUP: technicians (6 → 4 policies)
-- ============================================
DROP POLICY IF EXISTS "Technicians can view own profile" ON technicians;
DROP POLICY IF EXISTS "admins_manage_technicians" ON technicians;
DROP POLICY IF EXISTS "technicians_update_own" ON technicians;
DROP POLICY IF EXISTS "technicians_authenticated_read" ON technicians;
DROP POLICY IF EXISTS "public_view_active_technicians" ON technicians;
DROP POLICY IF EXISTS "authenticated_view_active_technicians" ON technicians;

CREATE POLICY "tech_read" ON technicians FOR SELECT TO authenticated USING (true);

CREATE POLICY "tech_insert" ON technicians FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "tech_update" ON technicians FOR UPDATE TO authenticated
USING (id = get_technician_id_for_user(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "tech_delete" ON technicians FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- CLEANUP: user_roles (6 → 4 policies)
-- ============================================
DROP POLICY IF EXISTS "users_view_own_roles_safe" ON user_roles;
DROP POLICY IF EXISTS "admins_update_roles_safe" ON user_roles;
DROP POLICY IF EXISTS "admins_delete_roles_safe" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_own" ON user_roles;
DROP POLICY IF EXISTS "admins_view_all_roles_safe" ON user_roles;
DROP POLICY IF EXISTS "admins_insert_roles_safe" ON user_roles;

CREATE POLICY "ur_read" ON user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ur_insert" ON user_roles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ur_update" ON user_roles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ur_delete" ON user_roles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
