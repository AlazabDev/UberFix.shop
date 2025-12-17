
-- Drop existing view first to recreate with different columns
DROP VIEW IF EXISTS public.technician_profiles_safe;

-- Create a secure view for public technician display (Service Map) without sensitive data
CREATE VIEW public.technician_profiles_safe AS
SELECT 
  id,
  full_name,
  city_id,
  district_id,
  status,
  created_at
FROM public.technician_profiles
WHERE status = 'approved';

-- Grant SELECT on the safe view to authenticated users
GRANT SELECT ON public.technician_profiles_safe TO authenticated;

-- Add policy for managers to view technician profiles for approval workflow
CREATE POLICY "techprof_manager_read_pending" ON public.technician_profiles
FOR SELECT
USING (
  (status = 'pending_review' AND has_role(auth.uid(), 'manager'::app_role))
  OR (status = 'pending_review' AND has_role(auth.uid(), 'admin'::app_role))
);
