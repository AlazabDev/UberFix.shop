-- إصلاح الجداول المتبقية (بدون subcategories)

-- جدول message_logs
DROP POLICY IF EXISTS "Service role can insert message logs" ON public.message_logs;
DROP POLICY IF EXISTS "message_logs_insert" ON public.message_logs;
DROP POLICY IF EXISTS "message_logs_insert_staff" ON public.message_logs;

CREATE POLICY "message_logs_insert_staff" ON public.message_logs
FOR INSERT WITH CHECK (public.is_staff());

-- جدول push_subscriptions
DROP POLICY IF EXISTS "push_subscriptions_insert" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_update" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_delete" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_insert_own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_update_own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_delete_own" ON public.push_subscriptions;

CREATE POLICY "push_subscriptions_insert_own" ON public.push_subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_subscriptions_update_own" ON public.push_subscriptions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "push_subscriptions_delete_own" ON public.push_subscriptions
FOR DELETE USING (auth.uid() = user_id);

-- إصلاح جدول technician_profiles
DROP POLICY IF EXISTS "Technician profiles readable by all" ON public.technician_profiles;
DROP POLICY IF EXISTS "Public can read technician profiles" ON public.technician_profiles;
DROP POLICY IF EXISTS "technician_profiles_select" ON public.technician_profiles;
DROP POLICY IF EXISTS "technician_profiles_read_own" ON public.technician_profiles;
DROP POLICY IF EXISTS "technician_profiles_read_staff" ON public.technician_profiles;
DROP POLICY IF EXISTS "technician_profiles_update_own" ON public.technician_profiles;

CREATE POLICY "technician_profiles_read_own" ON public.technician_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "technician_profiles_read_staff" ON public.technician_profiles
FOR SELECT USING (public.is_staff());

CREATE POLICY "technician_profiles_update_own" ON public.technician_profiles
FOR UPDATE USING (auth.uid() = user_id);