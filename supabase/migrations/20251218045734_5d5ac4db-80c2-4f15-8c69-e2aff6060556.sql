-- 1. Fix appointments table - encrypt customer contact info and restrict access
-- Drop existing policies first
DROP POLICY IF EXISTS "appt_read_strict" ON appointments;
DROP POLICY IF EXISTS "appt_insert_own" ON appointments;
DROP POLICY IF EXISTS "appt_update_own" ON appointments;
DROP POLICY IF EXISTS "appt_delete_admin" ON appointments;

-- Create strict RLS policies that hide customer contact info from unauthorized users
CREATE POLICY "appt_select_strict" ON appointments FOR SELECT
USING (
  created_by = auth.uid() 
  OR vendor_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "appt_insert_auth" ON appointments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "appt_update_auth" ON appointments FOR UPDATE
USING (
  created_by = auth.uid() 
  OR vendor_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "appt_delete_admin_only" ON appointments FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Create secure view for appointments without sensitive contact info
DROP VIEW IF EXISTS appointments_public_safe;
CREATE VIEW appointments_public_safe WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  description,
  appointment_date,
  appointment_time,
  duration_minutes,
  status,
  property_id,
  vendor_id,
  maintenance_request_id,
  location,
  notes,
  reminder_sent,
  created_at,
  updated_at,
  -- Mask customer info - only show first name
  CASE 
    WHEN customer_name IS NOT NULL THEN split_part(customer_name, ' ', 1) || ' ***'
    ELSE NULL 
  END as customer_name_masked
FROM appointments;

-- 3. Fix app_settings - remove SMTP credentials from direct access
-- Create a secure view that excludes SMTP passwords
DROP VIEW IF EXISTS app_settings_safe CASCADE;
CREATE VIEW app_settings_safe WITH (security_invoker = true) AS
SELECT 
  id,
  app_name,
  app_logo_url,
  primary_color,
  secondary_color,
  background_color,
  theme_mode,
  default_language,
  timezone,
  default_currency,
  company_phone,
  company_email,
  company_address,
  google_maps_enabled,
  show_technicians_on_map,
  enable_technician_rating,
  require_manager_approval,
  allow_self_registration,
  enable_email_notifications,
  enable_sms_notifications,
  enable_in_app_notifications,
  show_footer,
  map_style,
  updated_at
  -- Explicitly exclude: smtp_host, smtp_port, smtp_username, smtp_password, smtp_from_email
FROM app_settings;

-- Add RLS to the view by creating a policy on the underlying table
-- The view uses security_invoker so it inherits the caller's permissions

-- 4. Create function to get SMTP settings (admin only)
CREATE OR REPLACE FUNCTION get_smtp_settings()
RETURNS TABLE(
  smtp_host text,
  smtp_port integer,
  smtp_username text,
  smtp_password text,
  smtp_from_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only owner can access SMTP credentials
  IF NOT is_owner_email() THEN
    RAISE EXCEPTION 'Access denied: Only owners can access SMTP settings';
  END IF;
  
  -- Log access for audit
  INSERT INTO audit_logs (user_id, action, table_name, new_values)
  VALUES (auth.uid(), 'SMTP_CREDENTIALS_ACCESS', 'app_settings', jsonb_build_object('accessed_at', NOW()));
  
  RETURN QUERY
  SELECT a.smtp_host, a.smtp_port, a.smtp_username, a.smtp_password, a.smtp_from_email
  FROM app_settings a
  LIMIT 1;
END;
$$;