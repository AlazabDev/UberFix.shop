
-- Fix the existing Facebook user: add proper user_roles entry
INSERT INTO public.user_roles (user_id, role, assigned_at)
VALUES ('62541753-eb73-4b29-ab4c-87a5348a55f1', 'customer', NOW())
ON CONFLICT (user_id, role) DO NOTHING;

-- Fix profile role from 'user' to 'customer'  
UPDATE public.profiles 
SET role = 'customer', updated_at = NOW()
WHERE id = '62541753-eb73-4b29-ab4c-87a5348a55f1' AND role = 'user';

-- Fix handle_new_user trigger to handle 'user' role → default to 'customer'
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_full_name text;
  v_phone text;
  v_role text;
BEGIN
  -- تنظيف المدخلات
  v_full_name := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email), '[<>"\''`;]', '', 'g');
  v_phone := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'phone', ''), '[^0-9+()-\s]', '', 'g');
  v_role := CASE 
    WHEN NEW.raw_user_meta_data->>'role' IN ('customer', 'technician', 'vendor', 'admin', 'manager', 'staff') 
    THEN NEW.raw_user_meta_data->>'role'
    ELSE 'customer'
  END;

  -- إنشاء ملف تعريف المستخدم
  INSERT INTO public.profiles (
    id,
    email,
    name,
    full_name,
    phone,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_full_name,
    v_phone,
    v_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(EXCLUDED.name, ''), profiles.name),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    updated_at = NOW();

  -- إضافة الدور في جدول user_roles
  INSERT INTO public.user_roles (user_id, role, assigned_at)
  VALUES (NEW.id, v_role::app_role, NOW())
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;
