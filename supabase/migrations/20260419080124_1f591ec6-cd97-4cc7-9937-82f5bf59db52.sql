-- ============================================================
-- 1. منع تصعيد الصلاحيات: حظر تغيير العمود role من قبل المستخدم نفسه
-- ============================================================

DROP POLICY IF EXISTS "profiles_update_own_no_role_change" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_secure" ON public.profiles;

-- سياسة محكمة: المستخدم يحدّث ملفه لكن لا يستطيع تغيير role أو email
CREATE POLICY "profiles_update_own_no_role_change"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  AND email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid())
);

-- ============================================================
-- 2. Trigger مزدوج كحماية: يمنع تغيير role في طبقة DB حتى لو تم التحايل على RLS
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- السماح للنظام (لا يوجد auth.uid) أو لـ admin/owner بتغيير الدور
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT (public.has_role(auth.uid(), 'admin'::app_role) 
            OR public.has_role(auth.uid(), 'owner'::app_role)) THEN
      RAISE EXCEPTION 'غير مسموح: لا يمكنك تغيير دورك بنفسك (Privilege Escalation Blocked)';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_self_escalation();

-- ============================================================
-- 3. حماية bucket "docs": تحويله إلى private + سياسات وصول مقيدة
-- ============================================================

UPDATE storage.buckets SET public = false WHERE id = 'docs';

DROP POLICY IF EXISTS "docs_authenticated_read" ON storage.objects;
DROP POLICY IF EXISTS "docs_owner_or_staff_write" ON storage.objects;
DROP POLICY IF EXISTS "docs_owner_or_staff_update" ON storage.objects;
DROP POLICY IF EXISTS "docs_owner_or_staff_delete" ON storage.objects;

-- القراءة: فقط المالك أو الطاقم
CREATE POLICY "docs_authenticated_read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'docs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'owner'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
  )
);

-- الرفع: المستخدم في مجلده الخاص فقط
CREATE POLICY "docs_owner_or_staff_write"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'docs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'owner'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
  )
);

-- التعديل
CREATE POLICY "docs_owner_or_staff_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'docs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'owner'::app_role)
  )
);

-- الحذف
CREATE POLICY "docs_owner_or_staff_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'docs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'owner'::app_role)
  )
);