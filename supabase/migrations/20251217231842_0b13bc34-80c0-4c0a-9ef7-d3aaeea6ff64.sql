
-- Drop existing views first
DROP VIEW IF EXISTS technicians_public_safe CASCADE;
DROP VIEW IF EXISTS vendors_public_safe CASCADE;
DROP VIEW IF EXISTS app_settings_safe CASCADE;

-- 1. technicians policy & safe view
DROP POLICY IF EXISTS "tech_read" ON technicians;

CREATE POLICY "tech_read_auth" ON technicians FOR SELECT TO authenticated
USING (id = get_technician_id_for_user(auth.uid()) OR is_staff(auth.uid()));

CREATE VIEW technicians_public_safe
WITH (security_invoker = true)
AS
SELECT 
  id, name, specialization, profile_image, icon_url,
  rating, total_reviews, status, is_active, level,
  ROUND(lat::numeric, 2) as lat_approx,
  ROUND(lng::numeric, 2) as lng_approx
FROM technicians
WHERE is_active = true AND status = 'available';

GRANT SELECT ON technicians_public_safe TO anon, authenticated;

-- 2. vendors policy & safe view
DROP POLICY IF EXISTS "v_read" ON vendors;

CREATE POLICY "vendors_read_auth" ON vendors FOR SELECT TO authenticated
USING (is_staff(auth.uid()) OR has_role(auth.uid(), 'manager'::app_role));

CREATE VIEW vendors_public_safe
WITH (security_invoker = true)
AS
SELECT 
  id, name, company_name, specialization, rating, status, address
FROM vendors
WHERE status = 'active';

GRANT SELECT ON vendors_public_safe TO authenticated;

-- 3. Secure function for client info
CREATE OR REPLACE FUNCTION get_mr_client_info(request_id uuid)
RETURNS TABLE (client_name text, client_phone text, client_email text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
  VALUES (auth.uid(), 'CLIENT_INFO_ACCESS', 'maintenance_requests', request_id, jsonb_build_object('accessed_at', NOW()));
  RETURN QUERY SELECT mr.client_name, mr.client_phone, mr.client_email FROM maintenance_requests mr WHERE mr.id = request_id;
END;
$$;

-- 4. OTP - Disable direct access
DROP POLICY IF EXISTS "pol_otp_service_insert" ON otp_verifications;
DROP POLICY IF EXISTS "pol_otp_service_update" ON otp_verifications;
CREATE POLICY "otp_service_only" ON otp_verifications FOR ALL USING (false) WITH CHECK (false);

-- 5. app_settings - Owner only
DROP POLICY IF EXISTS "app_settings_admin_select" ON app_settings;
DROP POLICY IF EXISTS "app_settings_admin_update" ON app_settings;
DROP POLICY IF EXISTS "app_settings_admin_insert" ON app_settings;

CREATE VIEW app_settings_safe WITH (security_invoker = true) AS
SELECT id, app_name, app_logo_url, primary_color, secondary_color, background_color,
  theme_mode, default_language, timezone, default_currency,
  company_phone, company_email, company_address,
  enable_email_notifications, enable_sms_notifications, enable_in_app_notifications,
  allow_self_registration, require_manager_approval, enable_technician_rating,
  show_technicians_on_map, google_maps_enabled, map_style, show_footer, updated_at
FROM app_settings;

GRANT SELECT ON app_settings_safe TO authenticated;
CREATE POLICY "settings_owner_only" ON app_settings FOR ALL TO authenticated USING (is_owner_email()) WITH CHECK (is_owner_email());
