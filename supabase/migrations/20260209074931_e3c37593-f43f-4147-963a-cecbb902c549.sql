-- =====================================================
-- إصلاح ثغرات الأمان - تشديد سياسات RLS
-- =====================================================

-- 1. حذف السياسات المكررة أو الفضفاضة من profiles
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_staff_select" ON public.profiles;

-- 2. تنظيف سياسات technician_wallet المكررة
DROP POLICY IF EXISTS "Admins manage all financial data" ON public.technician_wallet;
DROP POLICY IF EXISTS "technician_wallet_read_authenticated" ON public.technician_wallet;

-- 3. إنشاء سياسة موحدة ومحكمة للـ profiles
-- تسمح للمستخدم برؤية بياناته فقط، أو للإدارة برؤية الجميع
CREATE POLICY "profiles_unified_select" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() 
  OR has_role(auth.uid(), 'owner'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'manager'::app_role) 
    AND company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
);

-- 4. التأكد من عدم وجود وصول عام (anon) لجدول profiles
-- إلغاء أي صلاحيات عامة
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- 5. التأكد من عدم وجود وصول عام لجدول technician_wallet
REVOKE ALL ON public.technician_wallet FROM anon;
REVOKE ALL ON public.technician_wallet FROM public;

-- 6. التأكد من عدم وجود وصول عام لجدول technician_verifications
REVOKE ALL ON public.technician_verifications FROM anon;
REVOKE ALL ON public.technician_verifications FROM public;

-- 7. إنشاء view آمن للبيانات العامة بدون PII
CREATE OR REPLACE VIEW public.profiles_minimal_public 
WITH (security_invoker=on) AS
SELECT 
  id,
  full_name,
  role,
  company_id,
  created_at
FROM public.profiles;

-- منح صلاحية القراءة للمصادقين فقط
GRANT SELECT ON public.profiles_minimal_public TO authenticated;

-- 8. تحديث سياسة technician_wallet لتكون أكثر تقييداً
DROP POLICY IF EXISTS "Restricted read technician_wallet" ON public.technician_wallet;
CREATE POLICY "technician_wallet_strict_select" ON public.technician_wallet
FOR SELECT TO authenticated
USING (
  technician_id IN (
    SELECT t.id FROM technicians t
    JOIN technician_profiles tp ON t.technician_profile_id = tp.id
    WHERE tp.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'accounting'::app_role)
);