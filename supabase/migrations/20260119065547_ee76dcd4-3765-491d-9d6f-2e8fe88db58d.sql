-- إصلاح سياسات WITH CHECK (true) المتبقية

-- 1. consultation_bookings
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.consultation_bookings;
CREATE POLICY "Authenticated users can create bookings" 
ON public.consultation_bookings 
FOR INSERT 
TO authenticated
WITH CHECK (
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
  AND phone ~* '^\+?[0-9]{10,15}$'
);

-- 2. document_audit_logs - تقييد للمصدقين فقط
DROP POLICY IF EXISTS "Allow insert document_audit_logs" ON public.document_audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.document_audit_logs;
CREATE POLICY "Authenticated can insert audit logs" 
ON public.document_audit_logs 
FOR INSERT 
TO authenticated
WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

CREATE POLICY "Service role audit logs" 
ON public.document_audit_logs 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- 3. document_comments
DROP POLICY IF EXISTS "Allow insert document_comments" ON public.document_comments;
CREATE POLICY "Authenticated users insert comments" 
ON public.document_comments 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 4. document_reviewers
DROP POLICY IF EXISTS "Anyone can insert document_reviewers" ON public.document_reviewers;
DROP POLICY IF EXISTS "Allow public insert to document_reviewers" ON public.document_reviewers;
CREATE POLICY "Admins insert document_reviewers" 
ON public.document_reviewers 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin', 'manager')
  )
);

-- 5. document_signatures
DROP POLICY IF EXISTS "Allow insert document_signatures" ON public.document_signatures;
CREATE POLICY "Reviewers can sign documents" 
ON public.document_signatures 
FOR INSERT 
TO authenticated
WITH CHECK (signer_id = auth.uid());

-- 6. document_versions
DROP POLICY IF EXISTS "Allow insert document_versions" ON public.document_versions;
CREATE POLICY "Authenticated insert document_versions" 
ON public.document_versions 
FOR INSERT 
TO authenticated
WITH CHECK (created_by = auth.uid());

-- 7. error_logs - service role فقط
DROP POLICY IF EXISTS "Service role can insert error logs" ON public.error_logs;
CREATE POLICY "Service role only error logs" 
ON public.error_logs 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- 8. notifications
DROP POLICY IF EXISTS "notifications_service_insert" ON public.notifications;
CREATE POLICY "Service role notifications insert" 
ON public.notifications 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Authenticated notifications insert" 
ON public.notifications 
FOR INSERT 
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- 9. pending_technician_registrations - تحديث السياسة القديمة
DROP POLICY IF EXISTS "Anyone can create pending registration" ON public.pending_technician_registrations;

-- 10. message_logs - تقييد service_role
DROP POLICY IF EXISTS "Service role can update message logs" ON public.message_logs;
CREATE POLICY "Service role message_logs full access" 
ON public.message_logs 
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- 11. حذف السياسات المكررة للميديا
DROP POLICY IF EXISTS "Service role manages media files" ON public.media_files;
DROP POLICY IF EXISTS "Service role manages media errors" ON public.media_processing_errors;
DROP POLICY IF EXISTS "Service role manages media stats" ON public.media_stats_daily;
DROP POLICY IF EXISTS "Service role manages whatsapp media" ON public.whatsapp_media_storage;