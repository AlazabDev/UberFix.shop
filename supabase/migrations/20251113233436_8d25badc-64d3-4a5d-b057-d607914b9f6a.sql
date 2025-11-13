-- ============================================
-- إصلاح المشاكل الحرجة في سياسات RLS
-- Critical RLS Policy Fixes
-- ============================================

-- 1. إصلاح سياسات app_control
-- حذف السياسة القديمة التي تستعلم مباشرة من user_roles
DROP POLICY IF EXISTS "Admins can update app control" ON public.app_control;

-- إضافة سياسة آمنة تستخدم has_role()
CREATE POLICY "admins_update_app_control_safe"
  ON public.app_control
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 2. إصلاح سياسات app_control_history
-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Admins can insert lock history" ON public.app_control_history;
DROP POLICY IF EXISTS "Admins can view lock history" ON public.app_control_history;

-- إضافة سياسات آمنة
CREATE POLICY "admins_insert_history_safe"
  ON public.app_control_history
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_view_history_safe"
  ON public.app_control_history
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 3. إصلاح سياسات branch_locations
-- حذف السياسة القديمة التي تستعلم من profiles.role
DROP POLICY IF EXISTS "Only admins can manage branch locations" ON public.branch_locations;

-- إضافة سياسة آمنة تستخدم has_role()
CREATE POLICY "admins_manage_branch_locations_safe"
  ON public.branch_locations
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 4. إضافة سياسة UPDATE الناقصة على user_roles
CREATE POLICY "admins_can_update_roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 5. إضافة سياسات UPDATE و DELETE على role_permissions
CREATE POLICY "admins_update_permissions"
  ON public.role_permissions
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_delete_permissions"
  ON public.role_permissions
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- تم إصلاح جميع المشاكل الحرجة ✅
-- ============================================