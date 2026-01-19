-- إصلاح 5: تأمين profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin', 'manager', 'staff')
  )
);

-- إصلاح 6: تحسين properties access بناءً على الأعمدة الموجودة
DROP POLICY IF EXISTS "Public QR code access for active properties" ON public.properties;

CREATE POLICY "Authenticated property access" 
ON public.properties 
FOR SELECT 
TO authenticated
USING (
  manager_id = auth.uid()
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin', 'manager', 'staff')
  )
);

-- السماح للقراءة العامة للعقارات النشطة عبر QR
CREATE POLICY "Limited public access for active properties" 
ON public.properties 
FOR SELECT 
TO anon
USING (
  status = 'active' 
  AND qr_code_data IS NOT NULL
);

-- إصلاح 7: إضافة سياسات للجداول بدون سياسات
-- media_files
CREATE POLICY "Service role access to media_files" 
ON public.media_files 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin access to media_files" 
ON public.media_files 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- media_stats_daily
CREATE POLICY "Service role access to media_stats" 
ON public.media_stats_daily 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin view media_stats" 
ON public.media_stats_daily 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin', 'manager')
  )
);

-- media_processing_errors
CREATE POLICY "Service role access to media_errors" 
ON public.media_processing_errors 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin view media_errors" 
ON public.media_processing_errors 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);