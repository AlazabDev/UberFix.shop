
-- ============================================
-- إصلاح السياسات المتبقية التي تستخدم true
-- ============================================

-- 1. إصلاح document_reviewers
DROP POLICY IF EXISTS "Anyone can update reviewer status by hash" ON public.document_reviewers;

CREATE POLICY "Update reviewer by valid hash"
ON public.document_reviewers
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'staff'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'staff'::app_role)
);

-- 2. إصلاح quote_items
DROP POLICY IF EXISTS "Anyone can update quote item approval" ON public.quote_items;

CREATE POLICY "Staff can update quote items"
ON public.quote_items
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'staff'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'staff'::app_role)
);

-- 3. إصلاح project_images
DROP POLICY IF EXISTS "Public update project_images" ON public.project_images;
DROP POLICY IF EXISTS "Public delete project_images" ON public.project_images;
DROP POLICY IF EXISTS "Public insert project_images" ON public.project_images;

CREATE POLICY "Staff can manage project_images"
ON public.project_images
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'staff'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'staff'::app_role)
);

-- 4. تنظيف السياسات المكررة في profiles (الإبقاء على الأكثر تقييداً فقط)
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- 5. تنظيف السياسات المكررة في appointments
DROP POLICY IF EXISTS "appointments_select" ON public.appointments;

-- 6. تنظيف السياسات المكررة في invoices
DROP POLICY IF EXISTS "invoices_select_restricted" ON public.invoices;

-- 7. تنظيف vendors
DROP POLICY IF EXISTS "vendors_read_auth" ON public.vendors;
