-- Fix #4: Restrict technicians contact exposure to authenticated users only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view active technicians" ON technicians;

-- Create new policy for authenticated users only
CREATE POLICY "authenticated_view_active_technicians"
  ON technicians FOR SELECT
  TO authenticated
  USING (is_active = true);

-- For public/anonymous: create a limited view without sensitive contact info
-- This allows Service Map to show technician locations without exposing phone/email
CREATE OR REPLACE VIEW public.technicians_public AS
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