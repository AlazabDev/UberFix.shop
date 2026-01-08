-- إصلاح سياسات RLS الأمنية (بدون finance - استخدام الأدوار الموجودة فقط)

-- 1. إصلاح جدول profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;

CREATE POLICY "profiles_select_authenticated" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id OR
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager', 'staff', 'dispatcher'))
    )
  );

CREATE POLICY "profiles_insert_auth" ON profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "profiles_update_own_v2" ON profiles
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 2. إصلاح جدول invoices
DROP POLICY IF EXISTS "invoices_select" ON invoices;
DROP POLICY IF EXISTS "invoices_insert" ON invoices;
DROP POLICY IF EXISTS "invoices_update" ON invoices;
DROP POLICY IF EXISTS "Staff can view all invoices" ON invoices;

CREATE POLICY "invoices_select_restricted" ON invoices
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
    )
  );

CREATE POLICY "invoices_insert_auth" ON invoices
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager', 'staff'))
  );

CREATE POLICY "invoices_update_auth" ON invoices
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
    )
  );

-- 3. إصلاح جدول app_settings
DROP POLICY IF EXISTS "app_settings_select" ON app_settings;
DROP POLICY IF EXISTS "Anyone can view app settings" ON app_settings;

CREATE POLICY "app_settings_select_admin" ON app_settings
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "app_settings_update_admin" ON app_settings
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );