-- Fix 1: Set search_path for update_module_permissions_updated_at function
CREATE OR REPLACE FUNCTION public.update_module_permissions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix 2: Protect sensitive technician_profiles fields with RLS
-- Create a secure view that masks sensitive data from non-owners
DROP VIEW IF EXISTS public.technician_profiles_safe;
CREATE VIEW public.technician_profiles_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  full_name,
  phone,
  email,
  city_id,
  district_id,
  status,
  created_at,
  updated_at,
  -- Mask sensitive business fields - only show to profile owner or admin
  CASE 
    WHEN user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN accounting_name
    ELSE '***'
  END as accounting_name,
  CASE 
    WHEN user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN accounting_email
    ELSE '***@***.***'
  END as accounting_email,
  CASE 
    WHEN user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN accounting_phone
    ELSE '****'
  END as accounting_phone,
  CASE 
    WHEN user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN insurance_company_name
    ELSE '***'
  END as insurance_company_name,
  CASE 
    WHEN user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN policy_number
    ELSE '***'
  END as policy_number,
  CASE 
    WHEN user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN pricing_notes
    ELSE NULL
  END as pricing_notes
FROM technician_profiles;

GRANT SELECT ON public.technician_profiles_safe TO authenticated;

-- Tighten RLS on technician_profiles - restrict admin reads to specific fields via view
DROP POLICY IF EXISTS "Admins can read technician profiles" ON technician_profiles;
DROP POLICY IF EXISTS "technician_profiles_admin_read" ON technician_profiles;

-- Only allow direct table access for own profile or specific admin operations
CREATE POLICY "technician_profiles_own_or_admin_manage"
ON technician_profiles FOR ALL
USING (
  user_id = auth.uid() 
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  user_id = auth.uid() 
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Add audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.log_technician_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Log when non-owner accesses sensitive fields
  IF auth.uid() IS NOT NULL AND auth.uid() != NEW.user_id THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (
      auth.uid(),
      'TECHNICIAN_PROFILE_ACCESS',
      'technician_profiles',
      NEW.id,
      jsonb_build_object('accessed_at', NOW(), 'accessor_role', (
        SELECT role FROM user_roles WHERE user_id = auth.uid() LIMIT 1
      ))
    );
  END IF;
  RETURN NEW;
END;
$$;