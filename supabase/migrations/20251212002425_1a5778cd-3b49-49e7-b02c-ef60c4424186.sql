-- إصلاح Security Definer View
DROP VIEW IF EXISTS public.technicians_map_public;

-- إعادة إنشاء الـ view بدون SECURITY DEFINER
CREATE VIEW public.technicians_map_public 
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
FROM public.technicians
WHERE is_active = true AND status = 'online';

-- منح الوصول للـ view
GRANT SELECT ON public.technicians_map_public TO anon, authenticated;