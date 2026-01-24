-- =====================================================
-- إصلاح سياسات RLS لحماية البيانات الشخصية
-- =====================================================

-- 1. إصلاح جدول profiles - تقييد الوصول العام
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_company_colleagues_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_select" ON public.profiles;

-- السياسة الجديدة: المستخدم يرى ملفه الشخصي فقط + الطاقم يرى زملاء الشركة
CREATE POLICY "profiles_secure_select" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid()
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'manager'::app_role) 
    AND company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
  OR (
    has_role(auth.uid(), 'staff'::app_role) 
    AND company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
);

-- 2. إصلاح جدول technician_profiles
DROP POLICY IF EXISTS "Authenticated users can view technician profiles" ON public.technician_profiles;
DROP POLICY IF EXISTS "Restricted read technician_profiles" ON public.technician_profiles;
DROP POLICY IF EXISTS "techprof_manager_read_pending" ON public.technician_profiles;
DROP POLICY IF EXISTS "technician_profiles_secure_select" ON public.technician_profiles;

CREATE POLICY "technician_profiles_secure_select" 
ON public.technician_profiles 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- 3. إصلاح جدول vendor_locations
DROP POLICY IF EXISTS "vendor_locations_staff_select" ON public.vendor_locations;
DROP POLICY IF EXISTS "vendor_locations_manager_select" ON public.vendor_locations;

CREATE POLICY "vendor_locations_manager_select" 
ON public.vendor_locations 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- 4. إنشاء view آمن للـ profiles
DROP VIEW IF EXISTS public.profiles_public_safe;

CREATE VIEW public.profiles_public_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  full_name,
  avatar_url,
  company_id,
  role,
  created_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public_safe TO authenticated;

-- 5. تحديث view الفنيين الآمن
DROP VIEW IF EXISTS public.technician_profiles_public_safe;

CREATE VIEW public.technician_profiles_public_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  company_name,
  company_type,
  full_name,
  preferred_language,
  status,
  created_at,
  city_id,
  district_id
FROM public.technician_profiles;

GRANT SELECT ON public.technician_profiles_public_safe TO authenticated;