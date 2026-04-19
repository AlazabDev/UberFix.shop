-- ════════════════════════════════════════════════════════════
-- 1) منع تصعيد الصلاحيات في profiles + فرض رقم الهاتف
-- ════════════════════════════════════════════════════════════

-- 1.a) Trigger يمنع المستخدم من تغيير دوره الخاص في profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- إذا تغير الدور والمستخدم يحاول تعديل ملفه الخاص → فقط admin/owner مسموح
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() = OLD.id 
       AND NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner')) THEN
      RAISE EXCEPTION 'غير مصرح بتعديل الدور الخاص بك. يجب أن يقوم بذلك مدير النظام.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_self_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_self_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_self_escalation();

-- 1.b) إعادة كتابة سياسة UPDATE على profiles لمنع تعديل الدور
DROP POLICY IF EXISTS "profiles_update_own_secure" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own_no_role_change"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "profiles_admin_full_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- ════════════════════════════════════════════════════════════
-- 2) فرض رقم الهاتف على جميع طلبات الصيانة
-- ════════════════════════════════════════════════════════════

-- Trigger validation (أكثر مرونة من CHECK constraint)
CREATE OR REPLACE FUNCTION public.enforce_maintenance_request_phone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  cleaned_phone text;
BEGIN
  -- تنظيف الهاتف من المسافات والرموز غير الرقمية باستثناء +
  cleaned_phone := regexp_replace(COALESCE(NEW.client_phone, ''), '[^0-9+]', '', 'g');

  IF cleaned_phone IS NULL OR length(cleaned_phone) < 8 THEN
    RAISE EXCEPTION 'رقم الهاتف مطلوب لإنشاء طلب صيانة (8 أرقام على الأقل).';
  END IF;

  NEW.client_phone := cleaned_phone;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_mr_phone ON public.maintenance_requests;
CREATE TRIGGER trg_enforce_mr_phone
BEFORE INSERT OR UPDATE OF client_phone ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_maintenance_request_phone();

-- ════════════════════════════════════════════════════════════
-- 3) دالة الاستعلام عن طلبات الصيانة برقم الهاتف
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_requests_by_phone(search_phone text)
RETURNS TABLE (
  id uuid,
  request_number text,
  title text,
  status text,
  workflow_stage text,
  service_type text,
  priority text,
  client_name text,
  client_phone text,
  location text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  cleaned text;
BEGIN
  cleaned := regexp_replace(COALESCE(search_phone, ''), '[^0-9+]', '', 'g');
  IF cleaned IS NULL OR length(cleaned) < 8 THEN
    RAISE EXCEPTION 'رقم الهاتف غير صالح (8 أرقام على الأقل).';
  END IF;

  RETURN QUERY
  SELECT
    mr.id,
    mr.request_number,
    mr.title,
    mr.status::text,
    mr.workflow_stage::text,
    mr.service_type::text,
    mr.priority::text,
    mr.client_name,
    mr.client_phone,
    mr.location,
    mr.created_at,
    mr.updated_at
  FROM public.maintenance_requests mr
  WHERE regexp_replace(COALESCE(mr.client_phone, ''), '[^0-9+]', '', 'g') LIKE '%' || cleaned || '%'
     OR regexp_replace(COALESCE(mr.client_phone, ''), '[^0-9+]', '', 'g') LIKE '%' || regexp_replace(cleaned, '^\+?20', '', 'g') || '%'
  ORDER BY mr.created_at DESC
  LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_requests_by_phone(text) TO anon, authenticated;