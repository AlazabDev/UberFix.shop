-- Fix Security Definer View warning by converting technicians_public to SECURITY INVOKER
-- Drop and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.technicians_public;

CREATE VIEW public.technicians_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  specialization,
  profile_image,
  is_active,
  rating,
  total_reviews,
  current_latitude,
  current_longitude,
  status,
  icon_url,
  level
FROM technicians
WHERE is_active = true;

-- Grant access to the public view
GRANT SELECT ON public.technicians_public TO anon;
GRANT SELECT ON public.technicians_public TO authenticated;