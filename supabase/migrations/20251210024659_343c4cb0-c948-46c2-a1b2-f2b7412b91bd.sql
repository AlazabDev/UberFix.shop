-- ============================================
-- 🧹 تنظيف سياسات RLS المكررة والفوضى
-- ============================================

-- 1. إزالة سياسات SELECT المكررة على maintenance_requests
DROP POLICY IF EXISTS "maintenance_requests_select" ON public.maintenance_requests;
DROP POLICY IF EXISTS "maintenance_requests_select_owner_or_company_admin" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can view company maintenance requests" ON public.maintenance_requests;

-- 2. إزالة سياسات INSERT المكررة على maintenance_requests  
DROP POLICY IF EXISTS "maintenance_requests_insert" ON public.maintenance_requests;
DROP POLICY IF EXISTS "maintenance_requests_insert_public" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can create maintenance requests" ON public.maintenance_requests;

-- 3. إزالة سياسات SELECT المكررة على gallery_images
DROP POLICY IF EXISTS "gallery_public_select" ON public.gallery_images;
DROP POLICY IF EXISTS "public_read_featured_gallery" ON public.gallery_images;

-- 4. إزالة سياسات SELECT المكررة على vendors
DROP POLICY IF EXISTS "vendors_select_all" ON public.vendors;
DROP POLICY IF EXISTS "vendors_admin_full_access" ON public.vendors;
DROP POLICY IF EXISTS "vendors_staff_limited" ON public.vendors;
DROP POLICY IF EXISTS "vendors_vendor_view" ON public.vendors;

-- 5. إزالة سياسات SELECT المكررة على technician_coverage
DROP POLICY IF EXISTS "enable_read_technician_coverage" ON public.technician_coverage;

-- 6. إزالة سياسات SELECT المكررة على technician_location
DROP POLICY IF EXISTS "enable_read_technician_location" ON public.technician_location;

-- 7. إزالة سياسات SELECT المكررة على technician_services  
DROP POLICY IF EXISTS "enable_read_technician_services" ON public.technician_services;

-- 8. إزالة سياسات SELECT المكررة على cities
DROP POLICY IF EXISTS "cities_public_read" ON public.cities;
DROP POLICY IF EXISTS "cities_select_authenticated" ON public.cities;

-- 9. إزالة سياسات المكررة على profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_auth" ON public.profiles;

-- 10. إزالة سياسات المكررة على user_roles
DROP POLICY IF EXISTS "admins_can_update_roles" ON public.user_roles;

-- 11. إزالة سياسات المكررة على vendors (delete/insert/update)
DROP POLICY IF EXISTS "vendors_delete_staff" ON public.vendors;
DROP POLICY IF EXISTS "vendors_insert_staff" ON public.vendors;
DROP POLICY IF EXISTS "vendors_update_staff" ON public.vendors;

-- 12. إزالة سياسات المكررة على app_control
DROP POLICY IF EXISTS "admins_update_app_control_safe" ON public.app_control;

-- 13. إزالة سياسات المكررة على audit_logs
DROP POLICY IF EXISTS "audit_logs_admin" ON public.audit_logs;

-- ============================================
-- 🔧 إصلاح سياسة notifications للسماح بـ Edge Functions
-- ============================================

-- السماح للـ service role بإدراج الإشعارات (مطلوب للـ Edge Functions)
DROP POLICY IF EXISTS "notifications_service_insert" ON public.notifications;
CREATE POLICY "notifications_service_insert"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 🗄️ إضافة Storage Policies للـ buckets الناقصة
-- ============================================

-- سياسات لـ uploads bucket (private)
DROP POLICY IF EXISTS "uploads_auth_select" ON storage.objects;
DROP POLICY IF EXISTS "uploads_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "uploads_auth_delete" ON storage.objects;

CREATE POLICY "uploads_auth_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "uploads_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "uploads_auth_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

-- سياسات لـ invoices bucket (private - owner only)
DROP POLICY IF EXISTS "invoices_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "invoices_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "invoices_owner_delete" ON storage.objects;

CREATE POLICY "invoices_owner_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "invoices_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "invoices_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- سياسات لـ documents bucket (private - owner only)
DROP POLICY IF EXISTS "documents_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "documents_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "documents_owner_delete" ON storage.objects;

CREATE POLICY "documents_owner_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "documents_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "documents_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- سياسات لـ technician-documents bucket (technician + admin)
DROP POLICY IF EXISTS "tech_docs_select" ON storage.objects;
DROP POLICY IF EXISTS "tech_docs_insert" ON storage.objects;
DROP POLICY IF EXISTS "tech_docs_admin" ON storage.objects;

CREATE POLICY "tech_docs_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'technician-documents' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "tech_docs_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'technician-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "tech_docs_admin" ON storage.objects
  FOR ALL USING (
    bucket_id = 'technician-documents' AND 
    has_role(auth.uid(), 'admin')
  );