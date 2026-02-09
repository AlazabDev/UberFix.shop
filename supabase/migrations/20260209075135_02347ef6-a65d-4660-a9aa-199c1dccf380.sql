-- =====================================================
-- إكمال إصلاح الثغرات - حذف view القديم أولاً
-- =====================================================

-- 1. حذف الـ view القديم أولاً
DROP VIEW IF EXISTS public.technician_profiles_public_safe CASCADE;

-- 2. إنشاء view آمن جديد
CREATE VIEW public.technician_profiles_public_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  company_name,
  city_id,
  status,
  created_at,
  -- حجب البيانات الحساسة
  CASE 
    WHEN (SELECT has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
    THEN email
    ELSE NULL
  END as email,
  CASE 
    WHEN (SELECT has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
    THEN phone
    ELSE NULL
  END as phone
FROM public.technician_profiles;

-- منح الصلاحيات للـ view
GRANT SELECT ON public.technician_profiles_public_safe TO authenticated;

-- 3. تشديد سياسات technician_profiles الأصلية
DROP POLICY IF EXISTS "Anyone can view technician profiles" ON public.technician_profiles;
DROP POLICY IF EXISTS "technician_profiles_public_read" ON public.technician_profiles;

-- السماح للمالك أو الإدارة فقط
CREATE POLICY "technician_profiles_restricted_select" ON public.technician_profiles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- منع الوصول العام
REVOKE ALL ON public.technician_profiles FROM anon;
REVOKE ALL ON public.technician_profiles FROM public;