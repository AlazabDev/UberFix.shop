
-- Fix: Explicitly set security_invoker on the view
DROP VIEW IF EXISTS public.technicians_map_public;

CREATE VIEW public.technicians_map_public
WITH (security_invoker = true) AS
SELECT id, name, specialization, rating, total_reviews, status,
       current_latitude, current_longitude, location_updated_at,
       hourly_rate, available_from, available_to, bio,
       service_area_radius, is_verified, icon_url, level, phone
FROM public.get_technicians_for_map();

GRANT SELECT ON public.technicians_map_public TO authenticated, anon;
