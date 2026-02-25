
-- =============================================
-- المرحلة 1: تشديد أمان RLS للجداول الحساسة
-- =============================================

-- 1. consultation_bookings: إزالة صلاحية staff من القراءة (admin/manager فقط)
DROP POLICY IF EXISTS "Staff can view consultation bookings" ON consultation_bookings;
CREATE POLICY "bookings_select_admin_manager" ON consultation_bookings
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager')
  );

-- 2. technician_wallet: إزالة accounting من القراءة المباشرة
DROP POLICY IF EXISTS "technician_wallet_strict_select" ON technician_wallet;
CREATE POLICY "wallet_owner_self_select" ON technician_wallet
  FOR SELECT TO authenticated
  USING (
    technician_id = get_technician_id_for_user(auth.uid()) OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin')
  );

-- 3. maintenance_requests: تقييد القراءة - إزالة company_id المفتوح
DROP POLICY IF EXISTS "mr_read" ON maintenance_requests;
CREATE POLICY "mr_read_scoped" ON maintenance_requests
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    assigned_technician_id = get_technician_id_for_user(auth.uid()) OR
    has_role(auth.uid(), 'owner') OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'manager') OR
    has_role(auth.uid(), 'staff')
  );

-- 4. profiles: تقييد القراءة - فقط owner/admin + self
DROP POLICY IF EXISTS "profiles_secure_select" ON profiles;
CREATE POLICY "profiles_select_strict" ON profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin')
  );

-- 5. إنشاء view آمن لأسماء الملفات بدون PII
CREATE OR REPLACE VIEW profiles_names_only AS
SELECT id, name, full_name, role, company_id
FROM profiles;

-- 6. technician_profiles: إزالة manager من القراءة المباشرة
DROP POLICY IF EXISTS "technician_profiles_secure_select" ON technician_profiles;
DROP POLICY IF EXISTS "tp_select_clean" ON technician_profiles;
CREATE POLICY "tp_select_strict" ON technician_profiles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin')
  );

-- 7. facebook_leads: تقييد إلى owner/admin فقط
DROP POLICY IF EXISTS "leads_select_admin" ON facebook_leads;
CREATE POLICY "leads_select_owner_admin" ON facebook_leads
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "leads_update_admin" ON facebook_leads;
CREATE POLICY "leads_update_owner_admin" ON facebook_leads
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin')
  );

-- 8. invoices: إزالة manager من القراءة المباشرة
DROP POLICY IF EXISTS "invoices_select_restricted" ON invoices;
CREATE POLICY "invoices_select_strict" ON invoices
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'finance')
  );

DROP POLICY IF EXISTS "invoices_update_restricted" ON invoices;
CREATE POLICY "invoices_update_strict" ON invoices
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'finance')
  );

-- 9. appointments: تشديد SELECT
DROP POLICY IF EXISTS "appointments_select_restricted" ON appointments;
CREATE POLICY "appointments_select_strict" ON appointments
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "appointments_update_restricted" ON appointments;
CREATE POLICY "appointments_update_strict" ON appointments
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin')
  );
