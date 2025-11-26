-- Fix search_path for security definer functions
-- These functions need explicit search_path to prevent security issues

-- Fix calculate_distance function
DROP FUNCTION IF EXISTS public.calculate_distance(numeric, numeric, numeric, numeric);
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * 
      cos(radians(lon2) - radians(lon1)) + 
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$;

-- Fix find_nearest_vendor function
DROP FUNCTION IF EXISTS public.find_nearest_vendor(numeric, numeric, text);
CREATE OR REPLACE FUNCTION public.find_nearest_vendor(
  request_latitude numeric, 
  request_longitude numeric, 
  service_specialization text DEFAULT NULL::text
)
RETURNS TABLE(vendor_id uuid, vendor_name text, distance numeric, phone text, email text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.name,
    calculate_distance(request_latitude, request_longitude, vl.latitude, vl.longitude) as dist,
    v.phone,
    v.email
  FROM vendors v
  JOIN vendor_locations vl ON v.id = vl.vendor_id
  WHERE v.status = 'active' 
    AND vl.is_active = true
    AND (service_specialization IS NULL OR service_specialization = ANY(v.specialization))
  ORDER BY dist ASC
  LIMIT 5;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION public.calculate_distance IS 'Calculates distance between two points using Haversine formula';
COMMENT ON FUNCTION public.find_nearest_vendor IS 'Finds nearest active vendors within service area';