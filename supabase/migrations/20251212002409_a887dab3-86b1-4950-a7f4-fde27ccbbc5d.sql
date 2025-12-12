-- ==========================================
-- إصلاح سياسات RLS الأمنية
-- ==========================================

-- 1. تقييد الوصول لمواقع الفنيين
DROP POLICY IF EXISTS "Anyone can view technician locations" ON public.technician_location;

CREATE POLICY "Authenticated users view assigned technician locations"
  ON public.technician_location
  FOR SELECT
  TO authenticated
  USING (
    -- الفني يرى موقعه فقط
    technician_id = get_technician_id_for_user(auth.uid())
    -- أو الـ admin/dispatcher يرون الجميع
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'dispatcher')
    OR has_role(auth.uid(), 'manager')
    -- أو العميل يرى الفني المخصص لطلبه النشط
    OR EXISTS (
      SELECT 1 FROM maintenance_requests mr
      WHERE mr.assigned_technician_id = technician_location.technician_id
      AND mr.created_by = auth.uid()
      AND mr.status IN ('Open'::mr_status, 'Assigned'::mr_status, 'InProgress'::mr_status)
    )
  );

-- 2. تقييد إدخال طلبات الصيانة المجهولة (مع السماح لـ QR)
DROP POLICY IF EXISTS "Allow anonymous to insert maintenance requests" ON public.maintenance_requests;

CREATE POLICY "Controlled maintenance request insert"
  ON public.maintenance_requests
  FOR INSERT
  WITH CHECK (
    -- المستخدمين المصادقين
    (auth.uid() IS NOT NULL AND (created_by = auth.uid() OR created_by IS NULL))
    OR
    -- طلبات QR مع property_id صالح (الإدخال المجهول المحدود)
    (auth.uid() IS NULL AND property_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM properties p WHERE p.id = property_id
    ))
  );

-- 3. تقييد إدخال technician_profiles العام
DROP POLICY IF EXISTS "techprof_public_draft_insert" ON public.technician_profiles;

CREATE POLICY "techprof_controlled_insert"
  ON public.technician_profiles
  FOR INSERT
  WITH CHECK (
    -- المستخدم المصادق يسجل نفسه
    (auth.uid() IS NOT NULL AND user_id = auth.uid() AND status = 'draft')
    OR
    -- الـ admin يمكنه إنشاء ملفات
    has_role(auth.uid(), 'admin')
  );

-- 4. إنشاء view للوصول العام المحدود للفنيين (للخريطة)
DROP VIEW IF EXISTS public.technicians_map_public;
CREATE VIEW public.technicians_map_public AS
SELECT 
  id,
  name,
  specialization,
  profile_image,
  is_active,
  rating,
  total_reviews,
  current_latitude,
  current_longitude,
  status,
  icon_url,
  level
FROM public.technicians
WHERE is_active = true AND status = 'online';

-- منح الوصول للـ view
GRANT SELECT ON public.technicians_map_public TO anon, authenticated;