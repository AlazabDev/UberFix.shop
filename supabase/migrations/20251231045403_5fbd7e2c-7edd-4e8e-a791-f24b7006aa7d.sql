-- إصلاح سياسة الإدراج العام - السماح بالإدراج للجميع عبر QR
-- المشكلة: عندما يكون المستخدم غير مسجل، mr_insert تفشل لأن auth.uid() = NULL

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "mr_insert" ON public.maintenance_requests;
DROP POLICY IF EXISTS "mr_public_insert" ON public.maintenance_requests;

-- إنشاء سياسة واحدة تدمج الحالتين
CREATE POLICY "mr_insert_combined" ON public.maintenance_requests
FOR INSERT
WITH CHECK (
  -- الحالة 1: المستخدم مسجل دخول ويضيف طلب خاص به
  (auth.uid() IS NOT NULL AND created_by = auth.uid())
  OR
  -- الحالة 2: طلب عبر QR (مستخدم غير مسجل أو مسجل) - يجب توفر بيانات العميل والعقار
  (
    property_id IS NOT NULL 
    AND client_name IS NOT NULL 
    AND length(TRIM(BOTH FROM client_name)) >= 3 
    AND client_phone IS NOT NULL 
    AND length(client_phone) >= 10
    AND channel = 'qr_code'
  )
);