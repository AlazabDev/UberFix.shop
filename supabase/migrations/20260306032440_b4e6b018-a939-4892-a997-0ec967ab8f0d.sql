-- =============================================
-- 1. Remove phone from technicians_map_public view
-- =============================================
DROP VIEW IF EXISTS public.technicians_map_public;

CREATE VIEW public.technicians_map_public
WITH (security_invoker = true) AS
SELECT id, name, specialization, rating, total_reviews, status,
       current_latitude, current_longitude, location_updated_at,
       hourly_rate, available_from, available_to, bio,
       service_area_radius, is_verified, icon_url, level
FROM public.technicians
WHERE is_active = true AND is_verified = true;

GRANT SELECT ON public.technicians_map_public TO authenticated, anon;

-- Drop the old function that exposed phone
DROP FUNCTION IF EXISTS public.get_technicians_for_map();

-- =============================================
-- 2. Create safe SMTP access function (owner-only with audit)
-- =============================================
CREATE OR REPLACE FUNCTION public.get_smtp_settings_secure()
RETURNS TABLE(
  smtp_host text,
  smtp_port integer,
  smtp_username text,
  smtp_password text,
  smtp_from_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_owner_email() THEN
    RAISE EXCEPTION 'Access denied: Only owners can access SMTP credentials';
  END IF;

  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
  VALUES (
    auth.uid(),
    'SMTP_CREDENTIALS_ACCESS',
    'app_settings',
    (SELECT id FROM app_settings LIMIT 1),
    jsonb_build_object('accessed_at', NOW())
  );

  RETURN QUERY
  SELECT s.smtp_host, s.smtp_port, s.smtp_username, s.smtp_password, s.smtp_from_email
  FROM app_settings s
  LIMIT 1;
END;
$$;

-- =============================================
-- 3. Admin-safe view excluding smtp_password
-- =============================================
DROP VIEW IF EXISTS public.app_settings_admin_safe;

CREATE VIEW public.app_settings_admin_safe
WITH (security_invoker = true) AS
SELECT 
  id, app_name, app_logo_url, company_email, company_phone, company_address,
  default_currency, timezone, default_language, allow_self_registration,
  order_stages, max_execution_time, allow_edit_after_start, require_manager_approval,
  show_technicians_on_map, enable_technician_rating, allow_technician_quotes,
  technician_statuses, notification_types, enable_email_notifications,
  enable_sms_notifications, enable_in_app_notifications, enable_reminders,
  notification_templates, theme_mode, primary_color, secondary_color,
  background_color, map_style, show_footer, custom_css,
  google_maps_enabled, erpnext_enabled, erpnext_url,
  smtp_host, smtp_port, smtp_username, smtp_from_email,
  enable_2fa, auto_backup_enabled, backup_frequency,
  lock_sensitive_settings, session_timeout,
  created_at, updated_at, updated_by
FROM app_settings;

GRANT SELECT ON public.app_settings_admin_safe TO authenticated;

-- =============================================
-- 4. Safe view for contracts masking client PII
-- =============================================
DROP VIEW IF EXISTS public.maintenance_contracts_safe;

CREATE VIEW public.maintenance_contracts_safe
WITH (security_invoker = true) AS
SELECT 
  id, title, contract_number, status, billing_type,
  start_date, end_date, contract_value,
  company_id, branch_id, property_id,
  max_requests, used_requests, auto_renew,
  covered_services, excluded_services,
  sla_response_hours, sla_resolution_hours,
  includes_parts, discount_percentage,
  created_at, updated_at, created_by,
  CASE WHEN (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
    THEN client_name ELSE '***' END AS client_name,
  CASE WHEN (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
    THEN client_email ELSE NULL END AS client_email,
  CASE WHEN (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
    THEN client_phone ELSE NULL END AS client_phone
FROM maintenance_contracts;

GRANT SELECT ON public.maintenance_contracts_safe TO authenticated;