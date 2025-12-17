-- إصلاح سياسات RLS الأمنية (النسخة الصحيحة)

-- 1. إصلاح جدول profiles
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_company_colleagues_read" ON public.profiles;

CREATE POLICY "profiles_company_colleagues_read" ON public.profiles
FOR SELECT
USING (
  company_id = get_current_user_company_id()
  OR auth.uid() = id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR is_owner_email()
);

-- 2. إصلاح جدول appointments
DROP POLICY IF EXISTS "appointments_select_authenticated" ON public.appointments;

-- 3. إصلاح جدول invoices
DROP POLICY IF EXISTS "invoices_select_authenticated" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete" ON public.invoices;

CREATE POLICY "invoices_update" ON public.invoices
FOR UPDATE
USING (
  (created_by = auth.uid() AND is_locked = false)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "invoices_delete" ON public.invoices
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. إصلاح جدول maintenance_requests
DROP POLICY IF EXISTS "maintenance_requests_scoped_read" ON public.maintenance_requests;
DROP POLICY IF EXISTS "maintenance_requests_secure_read" ON public.maintenance_requests;

CREATE POLICY "maintenance_requests_secure_read" ON public.maintenance_requests
FOR SELECT
USING (
  created_by = auth.uid()
  OR company_id = get_current_user_company_id()
  OR assigned_technician_id = get_technician_id_for_user(auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

-- 5. إصلاح جدول technician_profiles
DROP POLICY IF EXISTS "technician_profiles_select_authenticated" ON public.technician_profiles;
DROP POLICY IF EXISTS "techprof_manager_read_pending" ON public.technician_profiles;
DROP POLICY IF EXISTS "techprof_own_read" ON public.technician_profiles;
DROP POLICY IF EXISTS "techprof_manager_review" ON public.technician_profiles;
DROP POLICY IF EXISTS "techprof_own_update" ON public.technician_profiles;
DROP POLICY IF EXISTS "techprof_own_insert" ON public.technician_profiles;

CREATE POLICY "techprof_own_read" ON public.technician_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "techprof_manager_review" ON public.technician_profiles
FOR SELECT
USING (
  (status = 'pending_review' OR status = 'approved')
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
);

CREATE POLICY "techprof_own_update" ON public.technician_profiles
FOR UPDATE
USING (user_id = auth.uid() AND status = 'draft')
WITH CHECK (user_id = auth.uid() AND status = 'draft');

CREATE POLICY "techprof_own_insert" ON public.technician_profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

-- 6. إصلاح جدول technicians
DROP POLICY IF EXISTS "technicians_public_read" ON public.technicians;
DROP POLICY IF EXISTS "technicians_select_all" ON public.technicians;
DROP POLICY IF EXISTS "technicians_authenticated_read" ON public.technicians;

CREATE POLICY "technicians_authenticated_read" ON public.technicians
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    id = get_technician_id_for_user(auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
    OR is_owner_email()
  )
);

-- 7. إصلاح جدول properties (manager_id هو UUID)
DROP POLICY IF EXISTS "properties_public_read" ON public.properties;
DROP POLICY IF EXISTS "public_read_properties_for_qr" ON public.properties;
DROP POLICY IF EXISTS "properties_secure_read" ON public.properties;

CREATE POLICY "properties_secure_read" ON public.properties
FOR SELECT
USING (
  created_by = auth.uid()
  OR manager_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
  OR is_owner_email()
);

-- 8. إصلاح جدول vendors (لا يوجد user_id، نستخدم last_modified_by)
DROP POLICY IF EXISTS "vendors_public_read" ON public.vendors;
DROP POLICY IF EXISTS "vendors_select_all" ON public.vendors;
DROP POLICY IF EXISTS "vendors_authenticated_read" ON public.vendors;

CREATE POLICY "vendors_authenticated_read" ON public.vendors
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    last_modified_by = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  )
);