
-- Fix 1: Remove SECURITY DEFINER from technicians_map_public view
-- Recreate as a regular view (SECURITY INVOKER is the default)
DROP VIEW IF EXISTS public.technicians_map_public;

CREATE VIEW public.technicians_map_public AS
SELECT id, name, specialization, rating, total_reviews, status,
       current_latitude, current_longitude, location_updated_at,
       hourly_rate, available_from, available_to, bio,
       service_area_radius, is_verified, icon_url, level, phone
FROM public.get_technicians_for_map();

-- Grant access to authenticated and anon (same as before)
GRANT SELECT ON public.technicians_map_public TO authenticated, anon;

-- Fix 2: Revoke anon/authenticated access from notification_stats_daily materialized view
REVOKE ALL ON public.notification_stats_daily FROM anon;
REVOKE ALL ON public.notification_stats_daily FROM authenticated;

-- Only allow admin access via service_role or specific functions
GRANT SELECT ON public.notification_stats_daily TO service_role;
