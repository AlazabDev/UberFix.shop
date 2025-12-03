-- إنشاء bucket للفواتير إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('invoices', 'invoices', false, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- إنشاء bucket للمستندات إذا لم يكن موجوداً  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- إنشاء bucket للفنيين إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('technician-documents', 'technician-documents', false, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- سياسات RLS للـ invoices bucket
CREATE POLICY "Users can upload invoices" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'invoices' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their invoices" ON storage.objects
FOR SELECT USING (
  bucket_id = 'invoices'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Staff can manage all invoices" ON storage.objects
FOR ALL USING (
  bucket_id = 'invoices'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'staff')
  )
);

-- سياسات للمستندات
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
);

-- سياسات لمستندات الفنيين
CREATE POLICY "Technicians can upload their documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'technician-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Technicians and staff can view documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'technician-documents'
  AND auth.uid() IS NOT NULL
);