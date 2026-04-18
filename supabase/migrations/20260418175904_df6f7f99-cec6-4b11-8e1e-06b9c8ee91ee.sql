
-- =============================================================
-- 1) دالة موحّدة: مزامنة status من workflow_stage + سجل تدقيق كامل
-- =============================================================
CREATE OR REPLACE FUNCTION public.sync_status_and_log_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_stage_status_map jsonb := '{
    "draft": "Open",
    "submitted": "Open",
    "acknowledged": "Open",
    "assigned": "Assigned",
    "scheduled": "Assigned",
    "in_progress": "In Progress",
    "on_site": "In Progress",
    "inspection": "In Progress",
    "work_started": "In Progress",
    "waiting_parts": "On Hold",
    "on_hold": "On Hold",
    "completed": "Completed",
    "billed": "Completed",
    "paid": "Completed",
    "closed": "Closed",
    "cancelled": "Cancelled",
    "rejected": "Rejected"
  }'::jsonb;
  v_target_status text;
BEGIN
  -- مزامنة status مع workflow_stage إذا تغيّر workflow_stage
  IF TG_OP = 'UPDATE' AND NEW.workflow_stage IS DISTINCT FROM OLD.workflow_stage THEN
    v_target_status := v_stage_status_map ->> NEW.workflow_stage;
    IF v_target_status IS NOT NULL AND NEW.status::text IS DISTINCT FROM v_target_status THEN
      NEW.status := v_target_status::mr_status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger BEFORE UPDATE لمزامنة status قبل الكتابة
DROP TRIGGER IF EXISTS trg_sync_status_from_stage ON public.maintenance_requests;
CREATE TRIGGER trg_sync_status_from_stage
BEFORE UPDATE OF workflow_stage ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION public.sync_status_and_log_transition();

-- =============================================================
-- 2) دالة لتسجيل كل انتقال workflow_stage / status في audit_logs
-- =============================================================
CREATE OR REPLACE FUNCTION public.log_workflow_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND (OLD.workflow_stage IS DISTINCT FROM NEW.workflow_stage
          OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
      auth.uid(),
      'WORKFLOW_TRANSITION',
      'maintenance_requests',
      NEW.id,
      jsonb_build_object(
        'workflow_stage', OLD.workflow_stage,
        'status', OLD.status,
        'updated_at', OLD.updated_at
      ),
      jsonb_build_object(
        'workflow_stage', NEW.workflow_stage,
        'status', NEW.status,
        'updated_at', NEW.updated_at,
        'request_number', NEW.request_number
      )
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'log_workflow_transition error: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_workflow_transition ON public.maintenance_requests;
CREATE TRIGGER trg_log_workflow_transition
AFTER UPDATE OF workflow_stage, status ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION public.log_workflow_transition();
