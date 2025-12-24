-- The view needs to bypass RLS on the underlying table
-- Since we're using security_invoker = true, we need a different approach
-- We'll use a SECURITY DEFINER function instead to safely expose the data

-- First, drop the view
DROP VIEW IF EXISTS public.technicians_map_public;

-- Create a SECURITY DEFINER function that returns technician data for map
CREATE OR REPLACE FUNCTION public.get_technicians_for_map()
RETURNS TABLE (
  id uuid,
  name text,
  specialization text,
  rating numeric,
  total_reviews integer,
  status text,
  current_latitude numeric,
  current_longitude numeric,
  location_updated_at timestamptz,
  hourly_rate numeric,
  available_from time,
  available_to time,
  bio text,
  service_area_radius numeric,
  is_verified boolean,
  icon_url text,
  level text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.get_technicians_for_map() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_technicians_for_map() TO anon;

-- Add comment
COMMENT ON FUNCTION public.get_technicians_for_map() IS 'Returns active and verified technicians for map display - excludes PII';

-- Now recreate the view using this function (this makes it work with Supabase client)
CREATE VIEW public.technicians_map_public AS
SELECT * FROM public.get_technicians_for_map();

-- Grant access to the view
GRANT SELECT ON public.technicians_map_public TO authenticated;
GRANT SELECT ON public.technicians_map_public TO anon;