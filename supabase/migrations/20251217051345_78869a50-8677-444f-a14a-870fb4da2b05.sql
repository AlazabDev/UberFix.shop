-- إنشاء Views آمنة (مصحح)

-- View آمن للفنيين في خريطة الخدمة
DROP VIEW IF EXISTS public.technicians_map_public;

CREATE VIEW public.technicians_map_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  specialization,
  profile_image,
  rating,
  total_reviews,
  status,
  level,
  icon_url,
  lat,
  lng,
  current_latitude,
  current_longitude
FROM public.technicians
WHERE is_active = true;

GRANT SELECT ON public.technicians_map_public TO authenticated;

-- View آمن للعقارات في QR
DROP VIEW IF EXISTS public.properties_qr_public;

CREATE VIEW public.properties_qr_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  code,
  address,
  type,
  icon_url,
  latitude,
  longitude
FROM public.properties
WHERE status = 'active';

GRANT SELECT ON public.properties_qr_public TO anon;
GRANT SELECT ON public.properties_qr_public TO authenticated;