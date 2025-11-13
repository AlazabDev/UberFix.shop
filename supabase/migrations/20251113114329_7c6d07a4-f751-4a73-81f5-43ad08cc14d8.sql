-- ===================================================================
-- إصلاح RLS على user_roles: استخدام has_role function لتجنب infinite recursion
-- ===================================================================

-- حذف السياسات القديمة التي تسبب infinite recursion
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- إنشاء سياسات جديدة آمنة
-- 1. المستخدمون يمكنهم قراءة صلاحياتهم فقط
CREATE POLICY "users_view_own_roles_safe"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. الـ admins يمكنهم قراءة كل الصلاحيات باستخدام has_role
CREATE POLICY "admins_view_all_roles_safe"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. الـ admins يمكنهم إضافة صلاحيات
CREATE POLICY "admins_insert_roles_safe"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. الـ admins يمكنهم حذف صلاحيات
CREATE POLICY "admins_delete_roles_safe"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ===================================================================
-- التحقق من أن RLS مفعل
-- ===================================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;