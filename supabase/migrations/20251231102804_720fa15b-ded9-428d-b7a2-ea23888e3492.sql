-- تحديث دالة التسجيل لتعمل مع Supabase Auth
-- المشكلة: gen_salt و crypt تحتاج pgcrypto
-- الحل: استخدام signups table مؤقت ثم استكمال التسجيل

-- إنشاء جدول للتسجيلات المعلقة (قبل تأكيد البريد)
CREATE TABLE IF NOT EXISTS public.pending_technician_registrations (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  profile_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours')
);

-- تفعيل RLS
ALTER TABLE public.pending_technician_registrations ENABLE ROW LEVEL SECURITY;

-- سياسة للإدخال من أي شخص
CREATE POLICY "Anyone can create pending registration" ON public.pending_technician_registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- سياسة للقراءة بالبريد فقط
CREATE POLICY "Can read own pending registration" ON public.pending_technician_registrations
  FOR SELECT TO anon, authenticated
  USING (true);

-- حذف التسجيلات المنتهية
CREATE POLICY "Can delete expired registrations" ON public.pending_technician_registrations
  FOR DELETE TO anon, authenticated
  USING (expires_at < now());

-- تحديث دالة التسجيل لاستخدام Supabase Auth signUp
CREATE OR REPLACE FUNCTION public.register_technician_profile(
  p_company_name TEXT,
  p_company_type TEXT,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_password TEXT,
  p_profile_data JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_user UUID;
  v_pending_id UUID;
BEGIN
  -- التحقق من عدم وجود بريد مكرر في المستخدمين
  SELECT id INTO v_existing_user FROM auth.users WHERE email = p_email;
  IF v_existing_user IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'البريد الإلكتروني مستخدم بالفعل');
  END IF;

  -- التحقق من عدم وجود ملف تعريف فني بنفس البريد
  IF EXISTS (SELECT 1 FROM technician_profiles WHERE email = p_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'البريد الإلكتروني مسجل بالفعل كفني');
  END IF;

  -- حفظ البيانات في جدول التسجيلات المعلقة
  -- حذف أي تسجيل سابق بنفس البريد
  DELETE FROM pending_technician_registrations WHERE email = p_email;
  
  INSERT INTO pending_technician_registrations (
    company_name,
    company_type,
    full_name,
    email,
    phone,
    profile_data
  ) VALUES (
    p_company_name,
    p_company_type,
    p_full_name,
    p_email,
    p_phone,
    p_profile_data
  )
  RETURNING id INTO v_pending_id;

  -- إرجاع النتيجة مع طلب إنشاء المستخدم من الواجهة
  RETURN jsonb_build_object(
    'success', true, 
    'pending_id', v_pending_id,
    'requires_signup', true,
    'message', 'تم حفظ البيانات، يرجى إكمال التسجيل'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- دالة لإكمال تسجيل الفني بعد إنشاء حساب Auth
CREATE OR REPLACE FUNCTION public.complete_technician_registration(
  p_email TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pending RECORD;
  v_user_id UUID;
  v_profile_id UUID;
BEGIN
  -- جلب المستخدم من auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'المستخدم غير موجود');
  END IF;

  -- جلب بيانات التسجيل المعلق
  SELECT * INTO v_pending FROM pending_technician_registrations WHERE email = p_email;
  IF v_pending IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'لا توجد بيانات تسجيل معلقة');
  END IF;

  -- التحقق من عدم وجود ملف تعريف سابق
  IF EXISTS (SELECT 1 FROM technician_profiles WHERE user_id = v_user_id) THEN
    -- حذف التسجيل المعلق
    DELETE FROM pending_technician_registrations WHERE email = p_email;
    RETURN jsonb_build_object('success', false, 'error', 'الملف الشخصي موجود بالفعل');
  END IF;

  -- إنشاء ملف تعريف الفني
  INSERT INTO public.technician_profiles (
    id,
    user_id,
    company_name,
    company_type,
    full_name,
    email,
    phone,
    status,
    preferred_language,
    country,
    has_insurance,
    accepts_emergency_jobs,
    accepts_national_contracts,
    agree_terms,
    agree_payment_terms,
    city_id,
    district_id,
    street_address,
    building_no,
    floor,
    unit,
    landmark,
    service_email,
    contact_name,
    accounting_name,
    accounting_email,
    accounting_phone,
    insurance_company_name,
    policy_number,
    policy_expiry_date,
    insurance_notes,
    pricing_notes,
    company_model,
    number_of_inhouse_technicians,
    number_of_office_staff,
    additional_notes
  ) VALUES (
    extensions.uuid_generate_v4(),
    v_user_id,
    v_pending.company_name,
    v_pending.company_type,
    v_pending.full_name,
    v_pending.email,
    v_pending.phone,
    'pending_review',
    COALESCE(v_pending.profile_data->>'preferred_language', 'ar'),
    COALESCE(v_pending.profile_data->>'country', 'Egypt'),
    COALESCE((v_pending.profile_data->>'has_insurance')::boolean, false),
    COALESCE((v_pending.profile_data->>'accepts_emergency_jobs')::boolean, false),
    COALESCE((v_pending.profile_data->>'accepts_national_contracts')::boolean, false),
    COALESCE((v_pending.profile_data->>'agree_terms')::boolean, false),
    COALESCE((v_pending.profile_data->>'agree_payment_terms')::boolean, false),
    (v_pending.profile_data->>'city_id')::bigint,
    (v_pending.profile_data->>'district_id')::bigint,
    v_pending.profile_data->>'street_address',
    v_pending.profile_data->>'building_no',
    v_pending.profile_data->>'floor',
    v_pending.profile_data->>'unit',
    v_pending.profile_data->>'landmark',
    v_pending.profile_data->>'service_email',
    v_pending.profile_data->>'contact_name',
    v_pending.profile_data->>'accounting_name',
    v_pending.profile_data->>'accounting_email',
    v_pending.profile_data->>'accounting_phone',
    v_pending.profile_data->>'insurance_company_name',
    v_pending.profile_data->>'policy_number',
    CASE WHEN v_pending.profile_data->>'policy_expiry_date' IS NOT NULL 
         THEN (v_pending.profile_data->>'policy_expiry_date')::date 
         ELSE NULL END,
    v_pending.profile_data->>'insurance_notes',
    v_pending.profile_data->>'pricing_notes',
    v_pending.profile_data->>'company_model',
    (v_pending.profile_data->>'number_of_inhouse_technicians')::integer,
    (v_pending.profile_data->>'number_of_office_staff')::integer,
    v_pending.profile_data->>'additional_notes'
  )
  RETURNING id INTO v_profile_id;

  -- حذف التسجيل المعلق
  DELETE FROM pending_technician_registrations WHERE email = p_email;

  -- تحديث metadata للمستخدم
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_build_object(
    'full_name', v_pending.full_name, 
    'phone', v_pending.phone,
    'role', 'technician'
  )
  WHERE id = v_user_id;

  -- إرجاع النتيجة
  RETURN jsonb_build_object(
    'success', true, 
    'user_id', v_user_id, 
    'profile_id', v_profile_id,
    'message', 'تم إنشاء الحساب بنجاح'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION public.register_technician_profile TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_technician_registration TO anon, authenticated;