-- Fix security definer view warning by using SECURITY INVOKER
DROP VIEW IF EXISTS public.profiles_public_safe;

CREATE VIEW public.profiles_public_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  full_name,
  position,
  role,
  avatar_url,
  company_id
FROM profiles
WHERE role IN ('manager', 'staff', 'admin');

-- Grant access to the view
GRANT SELECT ON public.profiles_public_safe TO authenticated;