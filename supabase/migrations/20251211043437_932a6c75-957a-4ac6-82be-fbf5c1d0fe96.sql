-- =============================================
-- المرحلة 1: إصلاح البنية التحتية للفنيين
-- =============================================

-- 1. إنشاء Storage bucket للتحقق من الهوية
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- سياسات Storage للـ bucket
CREATE POLICY "Technicians upload verification docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] IN ('national-id-front', 'national-id-back', 'selfies')
);

CREATE POLICY "Technicians view own verification docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Staff view all verification docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'staff'))
);

-- 2. إضافة عمود assigned_technician_id لجدول maintenance_requests
ALTER TABLE public.maintenance_requests
ADD COLUMN IF NOT EXISTS assigned_technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL;

-- إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_technician 
ON public.maintenance_requests(assigned_technician_id);

-- 3. تحسين دالة approve_technician_profile لنسخ جميع البيانات
CREATE OR REPLACE FUNCTION public.approve_technician_profile(profile_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_profile RECORD;
  v_new_technician_id UUID;
  v_specialization TEXT;
BEGIN
  -- جلب بيانات الملف
  SELECT * INTO v_profile 
  FROM technician_profiles 
  WHERE id = profile_id AND status = 'pending_review';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found or not pending review';
  END IF;
  
  -- جلب أول تخصص من trades
  SELECT service_category INTO v_specialization
  FROM technician_trades
  WHERE technician_id = profile_id
  LIMIT 1;
  
  -- إنشاء سجل في جدول technicians
  INSERT INTO technicians (
    name,
    phone,
    email,
    specialization,
    bio,
    city_id,
    district_id,
    status,
    is_active,
    is_verified,
    created_at,
    technician_profile_id,
    level
  ) VALUES (
    v_profile.full_name,
    v_profile.phone,
    v_profile.email,
    COALESCE(v_specialization, 'general'),
    v_profile.additional_notes,
    v_profile.city_id,
    v_profile.district_id,
    'offline',
    true,
    true,
    NOW(),
    profile_id,
    'technician'
  ) RETURNING id INTO v_new_technician_id;
  
  -- نسخ بيانات التغطية الجغرافية
  INSERT INTO technician_coverage (technician_id, city_id, district_id, radius_km, created_at)
  SELECT v_new_technician_id, city_id, district_id, radius_km, NOW()
  FROM technician_coverage_areas
  WHERE technician_id = profile_id;
  
  -- إنشاء سجل الأداء
  INSERT INTO technician_performance (technician_id)
  VALUES (v_new_technician_id)
  ON CONFLICT DO NOTHING;
  
  -- إنشاء المحفظة
  INSERT INTO technician_wallet (technician_id, balance_current, balance_pending, balance_locked)
  VALUES (v_new_technician_id, 0, 0, 0)
  ON CONFLICT DO NOTHING;
  
  -- تحديث حالة الملف
  UPDATE technician_profiles 
  SET status = 'approved', 
      reviewed_at = NOW(),
      reviewed_by = auth.uid()
  WHERE id = profile_id;
  
  -- إرسال إشعار للفني
  INSERT INTO notifications (
    recipient_id,
    title,
    message,
    type,
    entity_type,
    entity_id
  ) VALUES (
    v_profile.user_id,
    'تم قبول طلب التسجيل',
    'تهانينا! تم قبول طلب التسجيل كفني في منصة UberFix. يمكنك الآن البدء في استقبال الطلبات.',
    'success',
    'technician',
    v_new_technician_id
  );
  
  RETURN v_new_technician_id;
END;
$$;

-- 4. إنشاء دالة للحصول على technician_id من user_id
CREATE OR REPLACE FUNCTION public.get_technician_id_for_user(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id
  FROM technicians t
  JOIN technician_profiles tp ON t.technician_profile_id = tp.id
  WHERE tp.user_id = p_user_id
  LIMIT 1;
$$;

-- 5. إنشاء view لعرض الطلبات المخصصة للفني
CREATE OR REPLACE VIEW public.technician_assigned_requests AS
SELECT 
  mr.id,
  mr.title,
  mr.description,
  mr.status,
  mr.priority,
  mr.location,
  mr.latitude,
  mr.longitude,
  mr.client_name,
  mr.client_phone,
  mr.created_at,
  mr.workflow_stage,
  mr.sla_complete_due,
  mr.assigned_technician_id,
  t.name as technician_name,
  t.phone as technician_phone
FROM maintenance_requests mr
LEFT JOIN technicians t ON mr.assigned_technician_id = t.id
WHERE mr.assigned_technician_id IS NOT NULL;

-- 6. إضافة RLS policy للفنيين لرؤية طلباتهم
CREATE POLICY "Technicians can view assigned requests"
ON public.maintenance_requests
FOR SELECT
TO authenticated
USING (
  assigned_technician_id = get_technician_id_for_user(auth.uid())
);

-- 7. إضافة RLS policy للفنيين لتحديث طلباتهم
CREATE POLICY "Technicians can update assigned requests"
ON public.maintenance_requests
FOR UPDATE
TO authenticated
USING (
  assigned_technician_id = get_technician_id_for_user(auth.uid())
)
WITH CHECK (
  assigned_technician_id = get_technician_id_for_user(auth.uid())
);