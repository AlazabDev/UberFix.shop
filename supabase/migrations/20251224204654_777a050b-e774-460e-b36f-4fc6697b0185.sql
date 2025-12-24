-- Drop existing view and recreate it properly
DROP VIEW IF EXISTS public.technicians_map_public CASCADE;

-- Create a public-safe view for technicians that clients can see on the map
CREATE VIEW public.technicians_map_public AS
SELECT 
  id,
  name,
  specialization,
  rating,
  total_reviews,
  status,
  current_latitude,
  current_longitude,
  location_updated_at,
  hourly_rate,
  available_from,
  available_to,
  bio,
  service_area_radius,
  is_verified,
  icon_url,
  level
FROM public.technicians
WHERE is_active = true AND is_verified = true;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.technicians_map_public TO authenticated;

-- Grant SELECT on the view to anon users (for public map if needed)
GRANT SELECT ON public.technicians_map_public TO anon;

-- Add comment
COMMENT ON VIEW public.technicians_map_public IS 'Public-safe view of technicians for map display - excludes PII like phone and email';