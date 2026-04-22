
-- =====================================================================
-- UBERFIX CANONICAL REPAIR — PHASE A+B+C+D+G (Additive, Non-Destructive)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) CANONICAL ENUMS (single source of truth)
-- ---------------------------------------------------------------------

-- Canonical workflow stage (replaces text workflow_stage)
DO $$ BEGIN
  CREATE TYPE public.workflow_stage_t AS ENUM (
    'draft','submitted','triaged','assigned','scheduled',
    'in_progress','inspection','waiting_parts','on_hold',
    'completed','billed','paid','closed','cancelled','rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Canonical derived request status
DO $$ BEGIN
  CREATE TYPE public.request_status_canonical AS ENUM (
    'open','active','blocked','done','terminal'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Canonical message status
DO $$ BEGIN
  CREATE TYPE public.message_status_t AS ENUM (
    'queued','sending','sent','delivered','read','failed','rejected','expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Canonical message channel
DO $$ BEGIN
  CREATE TYPE public.message_channel_t AS ENUM (
    'whatsapp','sms','email','push','in_app'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- 2) WORKFLOW TRANSITION MATRIX (canonical, enforced)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workflow_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_stage public.workflow_stage_t NOT NULL,
  to_stage   public.workflow_stage_t NOT NULL,
  required_role text,
  guard_fn text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_stage, to_stage)
);
ALTER TABLE public.workflow_transitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "transitions readable by authenticated" ON public.workflow_transitions;
CREATE POLICY "transitions readable by authenticated"
  ON public.workflow_transitions FOR SELECT TO authenticated USING (true);

-- Seed canonical transition matrix
INSERT INTO public.workflow_transitions (from_stage, to_stage) VALUES
  ('draft','submitted'),('draft','cancelled'),
  ('submitted','triaged'),('submitted','assigned'),('submitted','rejected'),('submitted','cancelled'),
  ('triaged','assigned'),('triaged','rejected'),('triaged','cancelled'),
  ('assigned','scheduled'),('assigned','in_progress'),('assigned','cancelled'),('assigned','on_hold'),
  ('scheduled','in_progress'),('scheduled','cancelled'),('scheduled','on_hold'),
  ('in_progress','inspection'),('in_progress','waiting_parts'),('in_progress','on_hold'),('in_progress','completed'),('in_progress','cancelled'),
  ('inspection','in_progress'),('inspection','completed'),('inspection','waiting_parts'),
  ('waiting_parts','in_progress'),('waiting_parts','cancelled'),('waiting_parts','on_hold'),
  ('on_hold','in_progress'),('on_hold','cancelled'),
  ('completed','billed'),('completed','closed'),
  ('billed','paid'),('billed','closed'),
  ('paid','closed')
ON CONFLICT (from_stage, to_stage) DO NOTHING;

-- ---------------------------------------------------------------------
-- 3) DOMAIN EVENTS (canonical event log)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid,
  actor_role text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  correlation_id uuid,
  causation_id uuid
);
CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate ON public.domain_events(aggregate_type, aggregate_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_domain_events_type ON public.domain_events(event_type, occurred_at DESC);
ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events readable by staff" ON public.domain_events;
CREATE POLICY "events readable by staff"
  ON public.domain_events FOR SELECT TO authenticated
  USING (public.is_staff() OR actor_id = auth.uid());

-- ---------------------------------------------------------------------
-- 4) OUTBOUND MESSAGES (single canonical outbound layer)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.outbound_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel public.message_channel_t NOT NULL,
  recipient text NOT NULL,
  template_key text,
  template_lang text DEFAULT 'ar',
  template_variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  body text,
  status public.message_status_t NOT NULL DEFAULT 'queued',
  provider text,
  provider_message_id text,
  related_aggregate_type text,
  related_aggregate_id uuid,
  triggered_by_event_id uuid REFERENCES public.domain_events(id) ON DELETE SET NULL,
  retry_count int NOT NULL DEFAULT 0,
  max_retries int NOT NULL DEFAULT 3,
  next_retry_at timestamptz,
  last_error text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_outbound_status ON public.outbound_messages(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_outbound_aggregate ON public.outbound_messages(related_aggregate_type, related_aggregate_id);
CREATE INDEX IF NOT EXISTS idx_outbound_provider_id ON public.outbound_messages(provider, provider_message_id);
ALTER TABLE public.outbound_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "outbound staff read" ON public.outbound_messages;
CREATE POLICY "outbound staff read" ON public.outbound_messages
  FOR SELECT TO authenticated USING (public.is_staff());

CREATE TABLE IF NOT EXISTS public.outbound_message_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.outbound_messages(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  status public.message_status_t,
  provider_payload jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_outbound_events_msg ON public.outbound_message_events(message_id, occurred_at DESC);
ALTER TABLE public.outbound_message_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "outbound events staff read" ON public.outbound_message_events;
CREATE POLICY "outbound events staff read" ON public.outbound_message_events
  FOR SELECT TO authenticated USING (public.is_staff());

-- ---------------------------------------------------------------------
-- 5) WHATSAPP STAGE → TEMPLATE MAPPING (gating)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wa_stage_template_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage public.workflow_stage_t NOT NULL,
  template_id uuid REFERENCES public.wa_templates(id) ON DELETE RESTRICT,
  template_key text NOT NULL,
  language text NOT NULL DEFAULT 'ar',
  is_active boolean NOT NULL DEFAULT true,
  fallback_template_key text,
  priority int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stage, language, template_key)
);
ALTER TABLE public.wa_stage_template_map ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "map staff read" ON public.wa_stage_template_map;
CREATE POLICY "map staff read" ON public.wa_stage_template_map
  FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS "map admin write" ON public.wa_stage_template_map;
CREATE POLICY "map admin write" ON public.wa_stage_template_map
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- 6) ADD CANONICAL STAGE COLUMN ON maintenance_requests (additive)
-- ---------------------------------------------------------------------
ALTER TABLE public.maintenance_requests
  ADD COLUMN IF NOT EXISTS workflow_stage_v2 public.workflow_stage_t;

-- Backfill from legacy text workflow_stage with safe normalization
UPDATE public.maintenance_requests
SET workflow_stage_v2 = (
  CASE lower(coalesce(workflow_stage,'draft'))
    WHEN 'draft' THEN 'draft'
    WHEN 'submitted' THEN 'submitted'
    WHEN 'triaged' THEN 'triaged'
    WHEN 'assigned' THEN 'assigned'
    WHEN 'scheduled' THEN 'scheduled'
    WHEN 'in_progress' THEN 'in_progress'
    WHEN 'inspection' THEN 'inspection'
    WHEN 'in_review' THEN 'inspection'
    WHEN 'waiting_parts' THEN 'waiting_parts'
    WHEN 'on_hold' THEN 'on_hold'
    WHEN 'completed' THEN 'completed'
    WHEN 'billed' THEN 'billed'
    WHEN 'paid' THEN 'paid'
    WHEN 'closed' THEN 'closed'
    WHEN 'cancelled' THEN 'cancelled'
    WHEN 'rejected' THEN 'rejected'
    ELSE 'draft'
  END
)::public.workflow_stage_t
WHERE workflow_stage_v2 IS NULL;

ALTER TABLE public.maintenance_requests
  ALTER COLUMN workflow_stage_v2 SET DEFAULT 'draft'::public.workflow_stage_t,
  ALTER COLUMN workflow_stage_v2 SET NOT NULL;

-- ---------------------------------------------------------------------
-- 7) DERIVED STATUS FUNCTION
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_derived_request_status(p_stage public.workflow_stage_t)
RETURNS public.request_status_canonical
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE p_stage
    WHEN 'draft' THEN 'open'
    WHEN 'submitted' THEN 'open'
    WHEN 'triaged' THEN 'open'
    WHEN 'assigned' THEN 'active'
    WHEN 'scheduled' THEN 'active'
    WHEN 'in_progress' THEN 'active'
    WHEN 'inspection' THEN 'active'
    WHEN 'waiting_parts' THEN 'blocked'
    WHEN 'on_hold' THEN 'blocked'
    WHEN 'completed' THEN 'done'
    WHEN 'billed' THEN 'done'
    WHEN 'paid' THEN 'done'
    WHEN 'closed' THEN 'terminal'
    WHEN 'cancelled' THEN 'terminal'
    WHEN 'rejected' THEN 'terminal'
  END::public.request_status_canonical
$$;

-- Add derived (generated) column so frontend reads it directly, never writes it
ALTER TABLE public.maintenance_requests
  ADD COLUMN IF NOT EXISTS request_status_derived public.request_status_canonical
  GENERATED ALWAYS AS (public.fn_derived_request_status(workflow_stage_v2)) STORED;

CREATE INDEX IF NOT EXISTS idx_mr_workflow_stage_v2 ON public.maintenance_requests(workflow_stage_v2);
CREATE INDEX IF NOT EXISTS idx_mr_status_derived ON public.maintenance_requests(request_status_derived);

-- ---------------------------------------------------------------------
-- 8) CANONICAL TRANSITION FUNCTION (only legal entry point)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_transition_request_stage(
  p_request_id uuid,
  p_to_stage public.workflow_stage_t,
  p_actor uuid DEFAULT auth.uid(),
  p_reason text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS public.workflow_stage_t
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from public.workflow_stage_t;
  v_event_id uuid;
BEGIN
  SELECT workflow_stage_v2 INTO v_from
  FROM public.maintenance_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_from IS NULL THEN
    RAISE EXCEPTION 'request_not_found: %', p_request_id;
  END IF;

  IF v_from = p_to_stage THEN
    RETURN v_from;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.workflow_transitions
    WHERE from_stage = v_from AND to_stage = p_to_stage AND is_active = true
  ) THEN
    RAISE EXCEPTION 'illegal_transition: % -> %', v_from, p_to_stage
      USING HINT = 'Add transition to workflow_transitions if intentional';
  END IF;

  UPDATE public.maintenance_requests
  SET workflow_stage_v2 = p_to_stage,
      workflow_stage = p_to_stage::text,
      updated_at = now()
  WHERE id = p_request_id;

  INSERT INTO public.domain_events (
    aggregate_type, aggregate_id, event_type, event_payload, actor_id
  ) VALUES (
    'maintenance_request', p_request_id, 'stage.transitioned',
    jsonb_build_object('from', v_from, 'to', p_to_stage, 'reason', p_reason, 'metadata', p_metadata),
    p_actor
  ) RETURNING id INTO v_event_id;

  RETURN p_to_stage;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_transition_request_stage(uuid, public.workflow_stage_t, uuid, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_transition_request_stage(uuid, public.workflow_stage_t, uuid, text, jsonb) TO authenticated;

-- ---------------------------------------------------------------------
-- 9) GUARD: prevent direct workflow_stage writes that bypass transitions
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_guard_workflow_stage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow: identical stage, or stage matches v2 (synced by transition fn), or via transition fn (recursion)
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Permit when v2 was changed in same row (transition function does this)
  IF NEW.workflow_stage_v2 IS DISTINCT FROM OLD.workflow_stage_v2
     AND NEW.workflow_stage = NEW.workflow_stage_v2::text THEN
    RETURN NEW;
  END IF;

  -- Permit when stage didn't actually change
  IF NEW.workflow_stage IS NOT DISTINCT FROM OLD.workflow_stage
     AND NEW.workflow_stage_v2 IS NOT DISTINCT FROM OLD.workflow_stage_v2 THEN
    RETURN NEW;
  END IF;

  -- Block direct edits
  RAISE EXCEPTION 'direct_stage_write_forbidden: use fn_transition_request_stage() instead'
    USING ERRCODE = 'check_violation';
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_workflow_stage ON public.maintenance_requests;
CREATE TRIGGER trg_guard_workflow_stage
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_guard_workflow_stage();

-- ---------------------------------------------------------------------
-- 10) WHATSAPP SEND GUARD (template must be APPROVED + mapped)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_enqueue_whatsapp_for_stage(
  p_request_id uuid,
  p_stage public.workflow_stage_t,
  p_recipient text,
  p_variables jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_map record;
  v_template record;
  v_msg_id uuid;
BEGIN
  IF p_recipient IS NULL OR length(trim(p_recipient)) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_map
  FROM public.wa_stage_template_map
  WHERE stage = p_stage AND is_active = true
  ORDER BY priority ASC
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.domain_events(aggregate_type, aggregate_id, event_type, event_payload)
    VALUES ('maintenance_request', p_request_id, 'whatsapp.skipped.no_mapping',
            jsonb_build_object('stage', p_stage));
    RETURN NULL;
  END IF;

  SELECT * INTO v_template FROM public.wa_templates WHERE id = v_map.template_id;

  IF v_template.id IS NULL OR v_template.status::text <> 'approved' THEN
    INSERT INTO public.domain_events(aggregate_type, aggregate_id, event_type, event_payload)
    VALUES ('maintenance_request', p_request_id, 'whatsapp.skipped.template_not_approved',
            jsonb_build_object('stage', p_stage, 'template', v_map.template_key,
                               'template_status', coalesce(v_template.status::text,'missing')));
    RETURN NULL;
  END IF;

  INSERT INTO public.outbound_messages(
    channel, recipient, template_key, template_lang, template_variables,
    related_aggregate_type, related_aggregate_id, status
  ) VALUES (
    'whatsapp', p_recipient, v_map.template_key, v_map.language, p_variables,
    'maintenance_request', p_request_id, 'queued'
  ) RETURNING id INTO v_msg_id;

  RETURN v_msg_id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_enqueue_whatsapp_for_stage(uuid, public.workflow_stage_t, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_enqueue_whatsapp_for_stage(uuid, public.workflow_stage_t, text, jsonb) TO authenticated, service_role;

-- ---------------------------------------------------------------------
-- 11) AUTO-ENQUEUE ON STAGE TRANSITION
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_on_stage_transition_enqueue_wa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_phone text;
BEGIN
  IF NEW.workflow_stage_v2 IS NOT DISTINCT FROM OLD.workflow_stage_v2 THEN
    RETURN NEW;
  END IF;

  v_phone := NEW.client_phone;
  IF v_phone IS NULL OR length(trim(v_phone)) = 0 THEN
    RETURN NEW;
  END IF;

  PERFORM public.fn_enqueue_whatsapp_for_stage(
    NEW.id,
    NEW.workflow_stage_v2,
    v_phone,
    jsonb_build_object(
      'request_id', NEW.id,
      'request_number', NEW.request_number,
      'title', NEW.title
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_stage_transition_enqueue_wa ON public.maintenance_requests;
CREATE TRIGGER trg_on_stage_transition_enqueue_wa
  AFTER UPDATE OF workflow_stage_v2 ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_on_stage_transition_enqueue_wa();

-- ---------------------------------------------------------------------
-- 12) FREEZE FLAGS ON LEGACY MESSAGE TABLES (advisory marker)
-- ---------------------------------------------------------------------
COMMENT ON TABLE public.message_logs IS 'FROZEN 2026-04-22: legacy. Use outbound_messages.';
COMMENT ON TABLE public.notifications IS 'FROZEN 2026-04-22 for new outbound. In-app reads only. Use outbound_messages.';
COMMENT ON TABLE public.whatsapp_messages IS 'FROZEN 2026-04-22: legacy duplicate. Use outbound_messages + wa_messages (inbound only).';
COMMENT ON COLUMN public.maintenance_requests.workflow_stage IS 'LEGACY mirror. Source of truth = workflow_stage_v2. Direct writes blocked by trg_guard_workflow_stage.';
COMMENT ON COLUMN public.maintenance_requests.status IS 'LEGACY. Use request_status_derived (generated) instead.';
COMMENT ON COLUMN public.app_settings.order_stages IS 'DEPRECATED 2026-04-22. Source of truth = workflow_stage_t enum.';
COMMENT ON COLUMN public.app_settings.technician_statuses IS 'DEPRECATED 2026-04-22. Source of truth = technician_status enum.';
