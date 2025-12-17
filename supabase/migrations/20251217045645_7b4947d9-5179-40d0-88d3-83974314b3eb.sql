
-- Fix Security Definer View warning by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.technician_profiles_safe;

CREATE VIEW public.technician_profiles_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  city_id,
  district_id,
  status,
  created_at
FROM public.technician_profiles
WHERE status = 'approved';

-- Grant SELECT on the safe view
GRANT SELECT ON public.technician_profiles_safe TO authenticated;

-- Also fix profiles_public_safe view if it exists
DROP VIEW IF EXISTS public.profiles_public_safe;

CREATE VIEW public.profiles_public_safe
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  full_name,
  avatar_url,
  position,
  role,
  company_id
FROM public.profiles
WHERE is_deleted = false;

GRANT SELECT ON public.profiles_public_safe TO authenticated;
