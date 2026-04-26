-- =========================================================
-- API Gateway Foundation — extends existing api_consumers
-- =========================================================

-- 1) Extend api_consumers with OAuth + storage routing fields
ALTER TABLE public.api_consumers
  ADD COLUMN IF NOT EXISTS client_secret_hash TEXT,
  ADD COLUMN IF NOT EXISTS scopes TEXT[] NOT NULL DEFAULT ARRAY['requests:read','catalog:read']::TEXT[],
  ADD COLUMN IF NOT EXISTS auth_type TEXT NOT NULL DEFAULT 'api_key',
  ADD COLUMN IF NOT EXISTS storage_target TEXT NOT NULL DEFAULT 'supabase_local',
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

-- Constrain values
DO $$ BEGIN
  ALTER TABLE public.api_consumers
    ADD CONSTRAINT api_consumers_auth_type_chk
    CHECK (auth_type IN ('api_key','oauth2','hybrid'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.api_consumers
    ADD CONSTRAINT api_consumers_storage_target_chk
    CHECK (storage_target IN ('supabase_local','gcp_global','aws','oci'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON COLUMN public.api_consumers.client_secret_hash IS 'bcrypt hash of OAuth2 client_secret. NULL for api_key-only consumers.';
COMMENT ON COLUMN public.api_consumers.scopes IS 'Allowed OAuth2 scopes for this client.';
COMMENT ON COLUMN public.api_consumers.storage_target IS 'Which object storage to route partner uploads to.';
COMMENT ON COLUMN public.api_consumers.webhook_secret IS 'HMAC-SHA256 secret used to sign outgoing webhook payloads.';

-- =========================================================
-- 2) api_idempotency_keys — prevent duplicate writes
-- =========================================================
CREATE TABLE IF NOT EXISTS public.api_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.api_consumers(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_status INT,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  UNIQUE (consumer_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_api_idem_expires
  ON public.api_idempotency_keys (expires_at);

ALTER TABLE public.api_idempotency_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage idempotency keys"
  ON public.api_idempotency_keys
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- 3) api_webhook_subscriptions — partners subscribe to events
-- =========================================================
CREATE TABLE IF NOT EXISTS public.api_webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.api_consumers(id) ON DELETE CASCADE,
  endpoint_url TEXT NOT NULL,
  event_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  secret TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  last_delivery_at TIMESTAMPTZ,
  last_delivery_status TEXT,
  failure_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT api_webhook_url_chk CHECK (endpoint_url ~* '^https?://.+')
);

CREATE INDEX IF NOT EXISTS idx_api_webhook_consumer ON public.api_webhook_subscriptions (consumer_id);
CREATE INDEX IF NOT EXISTS idx_api_webhook_active ON public.api_webhook_subscriptions (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_webhook_events ON public.api_webhook_subscriptions USING GIN (event_types);

ALTER TABLE public.api_webhook_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage webhook subscriptions"
  ON public.api_webhook_subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role));

CREATE TRIGGER trg_api_webhook_subs_updated_at
  BEFORE UPDATE ON public.api_webhook_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 4) api_webhook_deliveries — delivery audit log
-- =========================================================
CREATE TABLE IF NOT EXISTS public.api_webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.api_webhook_subscriptions(id) ON DELETE CASCADE,
  event_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  attempt_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  response_status INT,
  response_body TEXT,
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT api_webhook_delivery_status_chk
    CHECK (status IN ('pending','delivered','failed','retrying','exhausted'))
);

CREATE INDEX IF NOT EXISTS idx_api_webhook_delivery_sub ON public.api_webhook_deliveries (subscription_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_webhook_delivery_pending ON public.api_webhook_deliveries (status, next_retry_at) WHERE status IN ('pending','retrying');

ALTER TABLE public.api_webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read webhook deliveries"
  ON public.api_webhook_deliveries
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role));

-- Edge Functions (service_role) bypass RLS for inserts/updates.

-- =========================================================
-- 5) Helper function — cleanup expired idempotency keys
-- =========================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM public.api_idempotency_keys
  WHERE expires_at < now()
  RETURNING 1 INTO v_deleted;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- =========================================================
-- 6) Helper view — partner-facing client info (no secrets)
-- =========================================================
CREATE OR REPLACE VIEW public.api_consumers_safe AS
SELECT
  id,
  name,
  channel,
  scopes,
  auth_type,
  storage_target,
  is_active,
  rate_limit_per_minute,
  total_requests,
  last_used_at,
  created_at
FROM public.api_consumers;

GRANT SELECT ON public.api_consumers_safe TO authenticated;