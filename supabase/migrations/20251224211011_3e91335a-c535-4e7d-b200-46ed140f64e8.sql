-- إنشاء سياسة للسماح بتسجيل الفنيين الجدد (بدون user_id مسبق)
-- الفني سيُنشئ حساباً ثم تُربط البيانات به

-- أولاً: إضافة سياسة للإدخال العام للفنيين الجدد (ستُربط لاحقاً)
DROP POLICY IF EXISTS "tp_insert" ON public.technician_profiles;
DROP POLICY IF EXISTS "tp_guest_insert" ON public.technician_profiles;

-- السماح بإدخال ملف تعريف فني جديد (للمستخدمين المسجلين)
CREATE POLICY "tp_insert" ON public.technician_profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- إضافة دالة للتسجيل كضيف
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
  v_user_id UUID;
  v_profile_id UUID;
  v_existing_user UUID;
BEGIN
  -- التحقق من عدم وجود بريد مكرر
  SELECT id INTO v_existing_user FROM auth.users WHERE email = p_email;
  IF v_existing_user IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'البريد الإلكتروني مستخدم بالفعل');
  END IF;

  -- إنشاء المستخدم في auth.users
  v_user_id := extensions.uuid_generate_v4();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object('full_name', p_full_name, 'phone', p_phone),
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

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
    p_company_name,
    p_company_type,
    p_full_name,
    p_email,
    p_phone,
    'draft',
    COALESCE(p_profile_data->>'preferred_language', 'ar'),
    COALESCE(p_profile_data->>'country', 'Egypt'),
    COALESCE((p_profile_data->>'has_insurance')::boolean, false),
    COALESCE((p_profile_data->>'accepts_emergency_jobs')::boolean, false),
    COALESCE((p_profile_data->>'accepts_national_contracts')::boolean, false),
    COALESCE((p_profile_data->>'agree_terms')::boolean, false),
    COALESCE((p_profile_data->>'agree_payment_terms')::boolean, false),
    (p_profile_data->>'city_id')::bigint,
    (p_profile_data->>'district_id')::bigint,
    p_profile_data->>'street_address',
    p_profile_data->>'building_no',
    p_profile_data->>'floor',
    p_profile_data->>'unit',
    p_profile_data->>'landmark',
    p_profile_data->>'service_email',
    p_profile_data->>'contact_name',
    p_profile_data->>'accounting_name',
    p_profile_data->>'accounting_email',
    p_profile_data->>'accounting_phone',
    p_profile_data->>'insurance_company_name',
    p_profile_data->>'policy_number',
    CASE WHEN p_profile_data->>'policy_expiry_date' IS NOT NULL 
         THEN (p_profile_data->>'policy_expiry_date')::date 
         ELSE NULL END,
    p_profile_data->>'insurance_notes',
    p_profile_data->>'pricing_notes',
    p_profile_data->>'company_model',
    (p_profile_data->>'number_of_inhouse_technicians')::integer,
    (p_profile_data->>'number_of_office_staff')::integer,
    p_profile_data->>'additional_notes'
  )
  RETURNING id INTO v_profile_id;

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

-- منح صلاحية التنفيذ للجميع (بما في ذلك anon)
GRANT EXECUTE ON FUNCTION public.register_technician_profile TO anon, authenticated;