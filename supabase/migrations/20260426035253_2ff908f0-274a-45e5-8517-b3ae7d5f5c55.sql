-- Recreate the safe view with security_invoker so RLS of underlying api_consumers applies
DROP VIEW IF EXISTS public.api_consumers_safe;

CREATE VIEW public.api_consumers_safe
WITH (security_invoker = true) AS
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