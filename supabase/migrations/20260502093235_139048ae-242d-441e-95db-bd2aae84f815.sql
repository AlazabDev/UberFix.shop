-- =========================================
-- MODULE #1 CLOSURE: maintenance_requests
-- =========================================

-- 1) Add missing closure columns
ALTER TABLE public.maintenance_requests
  ADD COLUMN IF NOT EXISTS handover_to_admin_at timestamptz,
  ADD COLUMN IF NOT EXISTS handover_to_admin_by uuid,
  ADD COLUMN IF NOT EXISTS handover_signature text,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS rated_at timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_comment text,
  ADD COLUMN IF NOT EXISTS closure_reason text;

-- 2) Add new workflow stage 'handover_to_admin' if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'workflow_stage_t' AND e.enumlabel = 'handover_to_admin'
  ) THEN
    ALTER TYPE public.workflow_stage_t ADD VALUE 'handover_to_admin' BEFORE 'closed';
  END IF;
END$$;

-- 3) Wire up triggers (drop & re-create idempotently)

-- 3a) Auto-generate request number
DROP TRIGGER IF EXISTS trg_mr_request_number ON public.maintenance_requests;
CREATE TRIGGER trg_mr_request_number
  BEFORE INSERT ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.generate_request_number();

-- 3b) Auto-set SLA due date
DROP TRIGGER IF EXISTS trg_mr_sla_due ON public.maintenance_requests;
CREATE TRIGGER trg_mr_sla_due
  BEFORE INSERT ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_sla_due_date();

-- 3c) Auto-update updated_at
DROP TRIGGER IF EXISTS trg_mr_updated_at ON public.maintenance_requests;
CREATE TRIGGER trg_mr_updated_at
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_requests_updated_at();

-- 3d) Sync workflow_stage with workflow_stage_v2
DROP TRIGGER IF EXISTS trg_mr_sync_stage ON public.maintenance_requests;
CREATE TRIGGER trg_mr_sync_stage
  BEFORE INSERT OR UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.fn_sync_workflow_stage_mirror();

-- 3e) Audit trail
DROP TRIGGER IF EXISTS trg_mr_audit ON public.maintenance_requests;
CREATE TRIGGER trg_mr_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

-- 3f) Lifecycle log on stage/vendor change
DROP TRIGGER IF EXISTS trg_mr_lifecycle ON public.maintenance_requests;
CREATE TRIGGER trg_mr_lifecycle
  AFTER UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_request_lifecycle();

-- 3g) Auto-notify on status change
DROP TRIGGER IF EXISTS trg_mr_notify ON public.maintenance_requests;
CREATE TRIGGER trg_mr_notify
  AFTER UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.auto_notify_on_status_change();

-- 4) Closure automation function
CREATE OR REPLACE FUNCTION public.fn_handle_request_closure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- When entering 'closed' stage: stamp closed_at and archive
  IF NEW.workflow_stage_v2 = 'closed' AND (OLD.workflow_stage_v2 IS DISTINCT FROM 'closed') THEN
    NEW.closed_at := COALESCE(NEW.closed_at, now());
    NEW.archived_at := COALESCE(NEW.archived_at, now());
  END IF;

  -- When rating is set: stamp rated_at
  IF NEW.rating IS NOT NULL AND OLD.rating IS DISTINCT FROM NEW.rating THEN
    NEW.rated_at := COALESCE(NEW.rated_at, now());
  END IF;

  -- When entering 'handover_to_admin': stamp handover timestamp
  IF NEW.workflow_stage_v2 = 'handover_to_admin' AND (OLD.workflow_stage_v2 IS DISTINCT FROM 'handover_to_admin') THEN
    NEW.handover_to_admin_at := COALESCE(NEW.handover_to_admin_by, now());
    NEW.handover_to_admin_by := COALESCE(NEW.handover_to_admin_by, auth.uid());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mr_closure ON public.maintenance_requests;
CREATE TRIGGER trg_mr_closure
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.fn_handle_request_closure();

-- 5) Completed requests dashboard view (lawhat al-tilbat al-muntahia)
CREATE OR REPLACE VIEW public.v_completed_requests_dashboard
WITH (security_invoker = true)
AS
SELECT
  mr.id,
  mr.request_number,
  mr.title,
  mr.client_name,
  mr.location,
  mr.service_type,
  mr.priority,
  mr.workflow_stage_v2 AS stage,
  mr.created_at,
  mr.handover_to_admin_at,
  mr.handover_to_admin_by,
  mr.closed_at,
  mr.rating,
  mr.rated_at,
  mr.feedback_comment,
  mr.actual_cost,
  mr.estimated_cost,
  mr.assigned_technician_id,
  mr.assigned_vendor_id,
  mr.branch_id,
  mr.company_id,
  mr.property_id,
  mr.closure_reason,
  EXTRACT(EPOCH FROM (mr.closed_at - mr.created_at))/3600 AS lifecycle_hours,
  CASE
    WHEN mr.closed_at IS NOT NULL AND mr.sla_due_date IS NOT NULL
      THEN mr.closed_at <= mr.sla_due_date
    ELSE NULL
  END AS sla_met
FROM public.maintenance_requests mr
WHERE mr.workflow_stage_v2 IN ('closed','completed','cancelled','rejected')
   OR mr.archived_at IS NOT NULL;

COMMENT ON VIEW public.v_completed_requests_dashboard IS
  'Module #1 Closure: Dashboard of completed maintenance requests for owner overview (Ahmed Aouf style). Respects RLS.';

-- 6) Index for the dashboard
CREATE INDEX IF NOT EXISTS idx_mr_archived_stage 
  ON public.maintenance_requests (archived_at, workflow_stage_v2)
  WHERE archived_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mr_closed_at
  ON public.maintenance_requests (closed_at DESC)
  WHERE closed_at IS NOT NULL;