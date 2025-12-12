
-- إنشاء view آمن للفنيين للعرض العام (بدون بيانات حساسة)
DROP VIEW IF EXISTS public.technicians_public_safe;
CREATE VIEW public.technicians_public_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  specialization,
  rating,
  total_reviews,
  is_active,
  status,
  level,
  lat,
  lng,
  icon_url
FROM public.technicians
WHERE is_active = true AND status = 'available';

GRANT SELECT ON public.technicians_public_safe TO anon, authenticated;
