-- إصلاح سياسات RLS لجدول technician_profiles
ALTER TABLE IF EXISTS public.technician_profiles ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين المصادق عليهم بقراءة ملفاتهم الخاصة
DROP POLICY IF EXISTS "Users can view own technician profile" ON public.technician_profiles;
CREATE POLICY "Users can view own technician profile" 
ON public.technician_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- السماح للمستخدمين بإنشاء ملف تعريف خاص بهم
DROP POLICY IF EXISTS "Users can insert own technician profile" ON public.technician_profiles;
CREATE POLICY "Users can insert own technician profile" 
ON public.technician_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدمين بتحديث ملفاتهم الخاصة
DROP POLICY IF EXISTS "Users can update own technician profile" ON public.technician_profiles;
CREATE POLICY "Users can update own technician profile" 
ON public.technician_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- السماح للمديرين والأدمن بعرض جميع الملفات
DROP POLICY IF EXISTS "Admins can view all technician profiles" ON public.technician_profiles;
CREATE POLICY "Admins can view all technician profiles" 
ON public.technician_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- إصلاح سياسات RLS للمواعيد
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their appointments" ON public.appointments;
CREATE POLICY "Users can view their appointments" 
ON public.appointments 
FOR SELECT 
USING (
  created_by = auth.uid() 
  OR vendor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'staff')
  )
);

-- إصلاح سياسات RLS للفواتير
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invoices" ON public.invoices;
CREATE POLICY "Users can view invoices" 
ON public.invoices 
FOR SELECT 
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'staff')
  )
);

-- إصلاح سياسات RLS لمحفظة الفني
ALTER TABLE IF EXISTS public.technician_wallet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Technicians can view own wallet" ON public.technician_wallet;
CREATE POLICY "Technicians can view own wallet" 
ON public.technician_wallet 
FOR SELECT 
USING (
  technician_id IN (
    SELECT id FROM public.technicians 
    WHERE technician_profile_id IN (
      SELECT id FROM public.technician_profiles WHERE user_id = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);