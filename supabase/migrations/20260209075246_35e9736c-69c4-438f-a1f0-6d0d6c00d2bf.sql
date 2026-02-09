-- =====================================================
-- تشديد الأمان - حذف السياسات التي تستخدم public role
-- =====================================================

-- 1. جدول appointments - حذف السياسات الفضفاضة
DROP POLICY IF EXISTS "Staff can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;

-- إلغاء صلاحيات anon
REVOKE ALL ON public.appointments FROM anon;
REVOKE ALL ON public.appointments FROM public;

-- 2. جدول invoices - حذف السياسات الفضفاضة
DROP POLICY IF EXISTS "Staff can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Staff can view company invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view invoices they created" ON public.invoices;

-- إلغاء صلاحيات anon
REVOKE ALL ON public.invoices FROM anon;
REVOKE ALL ON public.invoices FROM public;

-- 3. جدول maintenance_requests - حذف السياسات الفضفاضة
DROP POLICY IF EXISTS "Staff can view company requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.maintenance_requests;

-- إلغاء صلاحيات anon
REVOKE ALL ON public.maintenance_requests FROM anon;
REVOKE ALL ON public.maintenance_requests FROM public;

-- 4. جدول technicians - التأكد من عدم وجود وصول عام
REVOKE ALL ON public.technicians FROM anon;
REVOKE ALL ON public.technicians FROM public;

-- 5. جدول profiles - التأكد من حذف السياسات القديمة
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 6. إعادة إنشاء سياسات profiles بشكل صحيح
CREATE POLICY "profiles_self_update" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());