-- ============================================
-- تحديث قائمة المالكين المعتمدين
-- ============================================

-- حذف المالكين القدامى غير الموجودين في القائمة الجديدة
DELETE FROM public.authorized_owners 
WHERE email NOT IN (
  'admin@uberfix.shop',
  'manager@uberfix.shop',
  'uberfix@alazab.com',
  'admin@alazab.com',
  'mohamed@alazab.com',
  'magdy@alazab.com'
);

-- إضافة المالكين الجدد إذا لم يكونوا موجودين
INSERT INTO public.authorized_owners (email, is_active)
VALUES 
  ('admin@uberfix.shop', true),
  ('manager@uberfix.shop', true),
  ('uberfix@alazab.com', true),
  ('admin@alazab.com', true),
  ('mohamed@alazab.com', true),
  ('magdy@alazab.com', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- ============================================
-- تحديث دالة التحقق من المالك
-- ============================================
CREATE OR REPLACE FUNCTION public.is_authorized_owner(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.authorized_owners 
    WHERE email = lower(user_email) 
    AND is_active = true
  );
$$;

-- ============================================
-- تحديث دالة مزامنة دور المالك
-- ============================================
CREATE OR REPLACE FUNCTION public.sync_owner_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- التحقق من أن المستخدم مالك معتمد
  IF public.is_authorized_owner(NEW.email) THEN
    NEW.role := 'owner';
  ELSIF NEW.role = 'owner' THEN
    -- منع غير المالكين من الحصول على دور المالك
    NEW.role := 'customer';
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- دالة للتحقق من أن المستخدم الحالي مالك
-- ============================================
CREATE OR REPLACE FUNCTION public.current_user_is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_authorized_owner(
    (SELECT email FROM auth.users WHERE id = auth.uid())
  );
$$;

-- ============================================
-- تحديث جدول user_roles للمالكين
-- ============================================

-- إضافة دور المالك للحسابات المعتمدة في user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'owner'::public.app_role
FROM public.profiles p
WHERE public.is_authorized_owner(p.email)
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.id AND ur.role = 'owner'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- تحديث الملفات الشخصية للمالكين
UPDATE public.profiles
SET role = 'owner'
WHERE public.is_authorized_owner(email);

-- ============================================
-- منع إضافة دور owner لغير المصرح لهم
-- ============================================
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_owner_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- الحصول على إيميل المستخدم
  SELECT email INTO user_email 
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- منع إضافة دور owner لغير المصرح لهم
  IF NEW.role = 'owner' AND NOT public.is_authorized_owner(user_email) THEN
    RAISE EXCEPTION 'غير مصرح لهذا المستخدم بالحصول على دور المالك';
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger لمنع إضافة owner غير مصرح
DROP TRIGGER IF EXISTS prevent_unauthorized_owner_trigger ON public.user_roles;
CREATE TRIGGER prevent_unauthorized_owner_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_owner_role();