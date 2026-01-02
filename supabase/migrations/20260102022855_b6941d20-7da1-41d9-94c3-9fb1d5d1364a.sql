-- إصلاح سياسة قراءة البروفايل الخاص بالمستخدم
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;

-- سياسة تسمح للمستخدم بقراءة بروفايله الخاص
CREATE POLICY "profiles_read_own" ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

-- سياسة تسمح للمستخدم بتحديث بروفايله الخاص
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);