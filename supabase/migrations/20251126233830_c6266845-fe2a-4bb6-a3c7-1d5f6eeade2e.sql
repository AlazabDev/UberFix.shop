-- إصلاح أمان Database Functions
-- تحديث search_path لجميع الدوال الأمنية

-- 1. إضافة indexes للجداول الكبيرة لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_workflow_stage ON maintenance_requests(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON maintenance_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_company_branch ON maintenance_requests(company_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON properties(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON notifications(recipient_id, created_at DESC);

-- 2. تحديث دوال search_path للأمان
ALTER FUNCTION public.update_technician_updated_at() SET search_path = public, pg_catalog;
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_catalog;

-- 3. إزالة RLS policies الخطرة وإنشاء آمنة جديدة
DROP POLICY IF EXISTS "public_read_properties_for_qr" ON properties;

-- سياسة آمنة: المستخدمون يرون عقاراتهم فقط
CREATE POLICY "users_read_own_properties" 
ON properties 
FOR SELECT 
USING (
  auth.uid() = created_by 
  OR auth.uid() = manager_id
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- 4. تحسين performance monitoring
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved_at) WHERE resolved_at IS NULL;

-- 5. تحسين realtime subscriptions
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_realtime ON maintenance_requests(updated_at, id);
CREATE INDEX IF NOT EXISTS idx_properties_realtime ON properties(updated_at, id);
CREATE INDEX IF NOT EXISTS idx_projects_realtime ON projects(updated_at, id);

COMMENT ON INDEX idx_maintenance_requests_status IS 'تحسين استعلامات الحالة';
COMMENT ON INDEX idx_maintenance_requests_created_at IS 'تحسين ترتيب الطلبات';
COMMENT ON INDEX idx_maintenance_requests_company_branch IS 'تحسين استعلامات الشركة والفرع';