-- إصلاح Security Definer View
-- تحويل الـ view إلى invoker security (يستخدم صلاحيات المستخدم)
DROP VIEW IF EXISTS public.technician_assigned_requests;

CREATE VIEW public.technician_assigned_requests
WITH (security_invoker = true)
AS
SELECT 
  mr.id,
  mr.title,
  mr.description,
  mr.status,
  mr.priority,
  mr.location,
  mr.latitude,
  mr.longitude,
  mr.client_name,
  mr.client_phone,
  mr.created_at,
  mr.workflow_stage,
  mr.sla_complete_due,
  mr.assigned_technician_id,
  t.name as technician_name,
  t.phone as technician_phone
FROM maintenance_requests mr
LEFT JOIN technicians t ON mr.assigned_technician_id = t.id
WHERE mr.assigned_technician_id IS NOT NULL;