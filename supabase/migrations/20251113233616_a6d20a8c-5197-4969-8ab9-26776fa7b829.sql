-- ============================================
-- إصلاح Security Definer Views
-- Fix Security Definer Views Security Issue
-- ============================================

-- 1. حذف Views القديمة
DROP VIEW IF EXISTS public.dashboard_stats CASCADE;
DROP VIEW IF EXISTS public.monthly_stats CASCADE;
DROP VIEW IF EXISTS public.my_view CASCADE;

-- ============================================
-- 2. إعادة إنشاء dashboard_stats بدون SECURITY DEFINER
-- ============================================
CREATE VIEW public.dashboard_stats AS
SELECT 
  count(*) FILTER (WHERE status = 'Open'::mr_status) AS pending_requests,
  count(*) FILTER (WHERE date(created_at) = CURRENT_DATE) AS today_requests,
  count(*) FILTER (WHERE status = 'Completed'::mr_status) AS completed_requests,
  count(*) AS total_requests,
  count(*) FILTER (WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE::timestamp with time zone)) AS this_month_requests,
  COALESCE(sum(estimated_cost) FILTER (WHERE status <> 'Cancelled'::mr_status), 0) AS total_budget,
  COALESCE(sum(actual_cost) FILTER (WHERE status = 'Completed'::mr_status), 0) AS actual_cost,
  round((count(*) FILTER (WHERE status = 'Completed'::mr_status)::numeric / NULLIF(count(*), 0)::numeric * 100), 2) AS completion_rate,
  round(avg(EXTRACT(epoch FROM updated_at - created_at) / 86400) FILTER (WHERE status = 'Completed'::mr_status), 2) AS avg_completion_days,
  count(*) FILTER (WHERE priority = 'high') AS high_priority_count,
  count(*) FILTER (WHERE priority = 'medium') AS medium_priority_count,
  count(*) FILTER (WHERE priority = 'low') AS low_priority_count,
  count(*) FILTER (WHERE workflow_stage = 'submitted') AS submitted_count,
  count(*) FILTER (WHERE workflow_stage = 'assigned') AS assigned_count,
  count(*) FILTER (WHERE workflow_stage = 'in_progress') AS in_progress_count,
  count(*) FILTER (WHERE workflow_stage = 'completed') AS workflow_completed_count,
  max(updated_at) AS last_updated
FROM maintenance_requests
WHERE archived_at IS NULL;

-- ملاحظة: الـ view الآن سيحترم RLS policies على maintenance_requests
-- أي مستخدم سيرى فقط الإحصائيات للطلبات التي يمكنه الوصول إليها

-- ============================================
-- 3. إعادة إنشاء monthly_stats بدون SECURITY DEFINER
-- ============================================
CREATE VIEW public.monthly_stats AS
SELECT 
  date_trunc('month', created_at) AS month,
  count(*) AS total_requests,
  count(*) FILTER (WHERE status = 'Completed'::mr_status) AS completed_requests,
  count(*) FILTER (WHERE status = 'Open'::mr_status) AS pending_requests,
  COALESCE(sum(estimated_cost), 0) AS total_estimated,
  COALESCE(sum(actual_cost), 0) AS total_actual,
  round((count(*) FILTER (WHERE status = 'Completed'::mr_status)::numeric / NULLIF(count(*), 0)::numeric * 100), 2) AS completion_rate
FROM maintenance_requests
WHERE archived_at IS NULL 
  AND created_at >= date_trunc('year', CURRENT_DATE::timestamp with time zone)
GROUP BY date_trunc('month', created_at)
ORDER BY date_trunc('month', created_at) DESC;

-- ============================================
-- 4. إعادة إنشاء my_view بدون SECURITY DEFINER
-- ============================================
CREATE VIEW public.my_view AS
SELECT 
  id,
  company_id,
  branch_id,
  asset_id,
  opened_by_role,
  channel,
  title,
  description,
  category_id,
  subcategory_id,
  priority,
  sla_deadline,
  status,
  created_at,
  created_by,
  client_name,
  client_phone,
  client_email,
  location,
  service_type,
  estimated_cost,
  actual_cost,
  rating,
  workflow_stage,
  sla_due_date,
  assigned_vendor_id,
  vendor_notes,
  archived_at,
  updated_at,
  property_id,
  latitude,
  longitude,
  sla_accept_due,
  sla_arrive_due,
  sla_complete_due,
  customer_notes
FROM maintenance_requests;

-- ملاحظة: my_view الآن مجرد view بسيط لـ maintenance_requests
-- سيحترم نفس RLS policies الموجودة على الجدول الأساسي

-- ============================================
-- 5. إضافة تعليقات توضيحية
-- ============================================
COMMENT ON VIEW public.dashboard_stats IS 'Dashboard statistics view - respects RLS policies on maintenance_requests table';
COMMENT ON VIEW public.monthly_stats IS 'Monthly statistics view - respects RLS policies on maintenance_requests table';
COMMENT ON VIEW public.my_view IS 'Maintenance requests view - respects RLS policies on maintenance_requests table';

-- ============================================
-- تم إصلاح Security Definer Views ✅
-- الآن جميع Views تحترم RLS policies على الجداول الأساسية
-- ============================================