-- إزالة وإعادة إنشاء Views بدون SECURITY DEFINER لإصلاح الثغرات الأمنية

-- 1. إعادة إنشاء dashboard_stats بدون SECURITY DEFINER
DROP VIEW IF EXISTS public.dashboard_stats;

CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
  COUNT(*) FILTER (WHERE workflow_stage = 'SUBMITTED') AS pending_requests,
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) AS today_requests,
  COUNT(*) FILTER (WHERE workflow_stage = 'COMPLETED') AS completed_requests,
  COUNT(*) AS total_requests,
  COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS this_month_requests,
  COALESCE(SUM(estimated_cost), 0) AS total_budget,
  COALESCE(SUM(actual_cost), 0) AS actual_cost,
  ROUND(
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE workflow_stage = 'COMPLETED')::numeric / COUNT(*)::numeric) * 100
      ELSE 0 
    END, 2
  ) AS completion_rate,
  ROUND(
    COALESCE(
      AVG(
        EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400
      ) FILTER (WHERE workflow_stage = 'COMPLETED'),
      0
    ), 2
  ) AS avg_completion_days,
  COUNT(*) FILTER (WHERE priority = 'high') AS high_priority_count,
  COUNT(*) FILTER (WHERE priority = 'medium') AS medium_priority_count,
  COUNT(*) FILTER (WHERE priority = 'low') AS low_priority_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'SUBMITTED') AS submitted_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'ASSIGNED') AS assigned_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'IN_PROGRESS') AS in_progress_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'COMPLETED') AS workflow_completed_count,
  NOW() AS last_updated
FROM public.maintenance_requests;

-- تطبيق RLS على dashboard_stats
ALTER VIEW public.dashboard_stats SET (security_invoker = true);

-- 2. إعادة إنشاء monthly_stats بدون SECURITY DEFINER
DROP VIEW IF EXISTS public.monthly_stats;

CREATE OR REPLACE VIEW public.monthly_stats AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS total_requests,
  COUNT(*) FILTER (WHERE workflow_stage = 'COMPLETED') AS completed_requests,
  COUNT(*) FILTER (WHERE workflow_stage IN ('SUBMITTED', 'TRIAGED', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS')) AS pending_requests,
  COALESCE(SUM(estimated_cost), 0) AS total_estimated,
  COALESCE(SUM(actual_cost), 0) AS total_actual,
  ROUND(
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE workflow_stage = 'COMPLETED')::numeric / COUNT(*)::numeric) * 100
      ELSE 0 
    END, 2
  ) AS completion_rate
FROM public.maintenance_requests
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- تطبيق RLS على monthly_stats
ALTER VIEW public.monthly_stats SET (security_invoker = true);

-- 3. حذف my_view لأنه يبدو غير مستخدم ومكرر لـ maintenance_requests
DROP VIEW IF EXISTS public.my_view;

-- إضافة تعليقات توضيحية
COMMENT ON VIEW public.dashboard_stats IS 'Dashboard statistics view - uses security_invoker to apply RLS policies';
COMMENT ON VIEW public.monthly_stats IS 'Monthly statistics view - uses security_invoker to apply RLS policies';