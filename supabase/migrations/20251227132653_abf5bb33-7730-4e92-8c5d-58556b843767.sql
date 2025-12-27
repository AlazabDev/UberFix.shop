-- ========================================
-- إصلاح شامل لسياسات RLS
-- ========================================

-- 1. إصلاح جدول profiles أولاً (الأهم)
DROP POLICY IF EXISTS "profiles_read_strict" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_system" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

-- السماح لكل مستخدم مصادق عليه بقراءة ملفه الشخصي
CREATE POLICY "profiles_select_own" 
ON public.profiles FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- السماح للأدمن بقراءة جميع الملفات
CREATE POLICY "profiles_select_admin" 
ON public.profiles FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- السماح بإنشاء الملف الشخصي عند التسجيل
CREATE POLICY "profiles_insert_new" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (id = auth.uid());

-- السماح بتحديث الملف الشخصي
CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (id = auth.uid());

-- 2. إصلاح جدول technician_profiles
DROP POLICY IF EXISTS "Users can view own technician profile" ON public.technician_profiles;
DROP POLICY IF EXISTS "Users can insert own technician profile" ON public.technician_profiles;
DROP POLICY IF EXISTS "Users can update own technician profile" ON public.technician_profiles;
DROP POLICY IF EXISTS "Admins can view all technician profiles" ON public.technician_profiles;

-- السماح لكل مستخدم مصادق عليه بقراءة ملفه
CREATE POLICY "tp_select_own" 
ON public.technician_profiles FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- السماح للأدمن والمديرين بقراءة الكل
CREATE POLICY "tp_select_admin" 
ON public.technician_profiles FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- السماح بإنشاء ملف تعريف
CREATE POLICY "tp_insert_own" 
ON public.technician_profiles FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- السماح بالتحديث
CREATE POLICY "tp_update_own" 
ON public.technician_profiles FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- 3. إصلاح جدول appointments
DROP POLICY IF EXISTS "Users can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "appt_select_strict" ON public.appointments;

-- السماح للمستخدمين بعرض مواعيدهم
CREATE POLICY "appointments_select" 
ON public.appointments FOR SELECT 
TO authenticated
USING (
  created_by = auth.uid() 
  OR vendor_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
  OR public.has_role(auth.uid(), 'staff')
);

-- 4. إصلاح جدول invoices
DROP POLICY IF EXISTS "Users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "inv_read_strict" ON public.invoices;

-- السماح للمستخدمين بعرض فواتيرهم
CREATE POLICY "invoices_select" 
ON public.invoices FOR SELECT 
TO authenticated
USING (
  created_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
  OR public.has_role(auth.uid(), 'staff')
);

-- 5. إصلاح جدول technician_wallet
DROP POLICY IF EXISTS "Technicians can view own wallet" ON public.technician_wallet;

CREATE POLICY "wallet_select" 
ON public.technician_wallet FOR SELECT 
TO authenticated
USING (
  technician_id IN (
    SELECT t.id FROM public.technicians t
    JOIN public.technician_profiles tp ON t.technician_profile_id = tp.id
    WHERE tp.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

-- 6. التأكد من وجود الدور للمستخدم الحالي (لأغراض الاختبار)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'mohamed@alazab.com'
ON CONFLICT (user_id, role) DO NOTHING;