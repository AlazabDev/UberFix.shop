
-- Fix SECURITY DEFINER views by recreating them with SECURITY INVOKER
DROP VIEW IF EXISTS profiles_safe;
DROP VIEW IF EXISTS properties_qr_public;

-- Recreate profiles_safe with SECURITY INVOKER (default)
CREATE VIEW profiles_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  full_name,
  avatar_url,
  position,
  role,
  company_id
FROM profiles;

-- Recreate properties_qr_public with SECURITY INVOKER
CREATE VIEW properties_qr_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  code,
  type,
  status,
  city_id,
  district_id
FROM properties
WHERE status = 'active';

-- Grant access for QR scanning
GRANT SELECT ON properties_qr_public TO anon, authenticated;
GRANT SELECT ON profiles_safe TO authenticated;

-- Add policy for anon access to properties (for QR)
CREATE POLICY "prop_qr_anon_read" ON properties FOR SELECT TO anon
USING (status = 'active');
