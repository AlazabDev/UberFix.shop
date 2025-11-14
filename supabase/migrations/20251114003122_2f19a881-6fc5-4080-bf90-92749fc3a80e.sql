-- ===================================================================
-- إصلاح Views الثلاثة باستخدام workflow_stage بدلاً من status
-- ===================================================================

-- 1. إعادة إنشاء my_view بدون SECURITY DEFINER
DROP VIEW IF EXISTS public.my_view CASCADE;
CREATE VIEW public.my_view AS
SELECT * FROM maintenance_requests WHERE created_by = auth.uid();

-- 2. إعادة إنشاء dashboard_stats بدون SECURITY DEFINER وباستخدام workflow_stage
DROP VIEW IF EXISTS public.dashboard_stats CASCADE;
CREATE VIEW public.dashboard_stats AS
SELECT 
  COUNT(*) FILTER (WHERE workflow_stage IN ('SUBMITTED', 'TRIAGED', 'ASSIGNED')) AS pending_requests,
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) AS today_requests,
  COUNT(*) FILTER (WHERE workflow_stage = 'COMPLETED') AS completed_requests,
  COUNT(*) AS total_requests,
  COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS this_month_requests,
  COALESCE(SUM(estimated_cost), 0) AS total_budget,
  COALESCE(SUM(actual_cost), 0) AS actual_cost,
  ROUND(
    (COUNT(*) FILTER (WHERE workflow_stage = 'COMPLETED')::numeric / NULLIF(COUNT(*), 0) * 100), 
    2
  ) AS completion_rate,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) FILTER (WHERE workflow_stage = 'COMPLETED'),
    1
  ) AS avg_completion_days,
  COUNT(*) FILTER (WHERE priority = 'high') AS high_priority_count,
  COUNT(*) FILTER (WHERE priority = 'medium') AS medium_priority_count,
  COUNT(*) FILTER (WHERE priority = 'low') AS low_priority_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'SUBMITTED') AS submitted_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'ASSIGNED') AS assigned_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'IN_PROGRESS') AS in_progress_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'COMPLETED') AS workflow_completed_count,
  NOW() AS last_updated
FROM maintenance_requests;

-- 3. إعادة إنشاء monthly_stats بدون SECURITY DEFINER وباستخدام workflow_stage
DROP VIEW IF EXISTS public.monthly_stats CASCADE;
CREATE VIEW public.monthly_stats AS
SELECT 
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS total_requests,
  COUNT(*) FILTER (WHERE workflow_stage = 'COMPLETED') AS completed_requests,
  COUNT(*) FILTER (WHERE workflow_stage IN ('SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS')) AS pending_requests,
  ROUND(
    (COUNT(*) FILTER (WHERE workflow_stage = 'COMPLETED')::numeric / NULLIF(COUNT(*), 0) * 100), 
    2
  ) AS completion_rate,
  COALESCE(SUM(estimated_cost), 0) AS total_estimated,
  COALESCE(SUM(actual_cost), 0) AS total_actual
FROM maintenance_requests
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;