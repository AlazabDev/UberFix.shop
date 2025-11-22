-- ===================================================================
-- إصلاح شامل للأمان في نظام UberFix
-- ===================================================================

-- 1. حذف Policy الخطيرة التي تسمح لأي شخص برؤية العقارات
DROP POLICY IF EXISTS "السماح بقراءة العقارات النشطة" ON public.properties;

-- 2. إنشاء Policy جديدة: كل مستخدم يرى عقاراته فقط
CREATE POLICY "users_view_own_properties" 
ON public.properties 
FOR SELECT 
TO authenticated
USING (
  created_by = auth.uid() 
  OR manager_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- 3. تحديث Policy الإدخال لضمان ربط العقار بالمستخدم
DROP POLICY IF EXISTS "properties_insert_authenticated" ON public.properties;

CREATE POLICY "properties_insert_own" 
ON public.properties 
FOR INSERT 
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND auth.uid() IS NOT NULL
);

-- 4. إضافة دالة للتحقق من تأكيد البريد الإلكتروني
CREATE OR REPLACE FUNCTION public.is_email_confirmed()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email_confirmed_at IS NOT NULL
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. تحديث Policy الإدخال لمنع المستخدمين غير المؤكدين
DROP POLICY IF EXISTS "properties_insert_own" ON public.properties;

CREATE POLICY "properties_insert_confirmed_users" 
ON public.properties 
FOR INSERT 
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND auth.uid() IS NOT NULL
  AND is_email_confirmed() = true
);

-- 6. إضافة Policy للتحديث: المستخدم يعدل عقاراته فقط
DROP POLICY IF EXISTS "properties_update_authorized" ON public.properties;

CREATE POLICY "properties_update_own" 
ON public.properties 
FOR UPDATE 
TO authenticated
USING (
  created_by = auth.uid()
  OR manager_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
)
WITH CHECK (
  created_by = auth.uid()
  OR manager_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- 7. تحديث Policy الحذف
DROP POLICY IF EXISTS "properties_delete_authorized" ON public.properties;

CREATE POLICY "properties_delete_own" 
ON public.properties 
FOR DELETE 
TO authenticated
USING (
  created_by = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- 8. إضافة دالة لضمان تعيين created_by تلقائياً
CREATE OR REPLACE FUNCTION public.set_property_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- تعيين created_by للمستخدم الحالي تلقائياً
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  
  -- تعيين last_modified_by
  NEW.last_modified_by = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. إنشاء Trigger لتطبيق الدالة
DROP TRIGGER IF EXISTS set_property_creator_trigger ON public.properties;

CREATE TRIGGER set_property_creator_trigger
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.set_property_creator();

-- 10. تأكد من أن العمود created_by غير nullable
ALTER TABLE public.properties 
ALTER COLUMN created_by SET NOT NULL;