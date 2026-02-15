
-- ============================================
-- SECURITY FIX: Comprehensive RLS Hardening
-- ============================================

-- 1. FIX: technician_profiles - Remove TO PUBLIC policies, replace with TO authenticated
DROP POLICY IF EXISTS "Admins can view all technician profiles" ON public.technician_profiles;
DROP POLICY IF EXISTS "Technicians can update their own profile" ON public.technician_profiles;
DROP POLICY IF EXISTS "Technicians can view their own profile" ON public.technician_profiles;

-- 2. FIX: vendors - Remove TO PUBLIC policies, replace with TO authenticated
DROP POLICY IF EXISTS "Admins can view all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Staff can view limited vendor info" ON public.vendors;

-- Recreate technician_profiles policies with TO authenticated
CREATE POLICY "tp_admin_select"
  ON public.technician_profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "tp_self_view"
  ON public.technician_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tp_self_update"
  ON public.technician_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Recreate vendors policies with TO authenticated
CREATE POLICY "vendors_admin_select"
  ON public.vendors FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "vendors_staff_select"
  ON public.vendors FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role));

-- 3. FIX: app_settings - Remove TO PUBLIC policies, replace with TO authenticated
DROP POLICY IF EXISTS "app_settings_select_admin" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_update_admin" ON public.app_settings;

CREATE POLICY "app_settings_select_admin_auth"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "app_settings_update_admin_auth"
  ON public.app_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. FIX: OTP verifications - Ensure only service_role can access
-- Remove old permissive policy
DROP POLICY IF EXISTS "otp_service_only" ON public.otp_verifications;
DROP POLICY IF EXISTS "pol_otp_service_insert" ON public.otp_verifications;
DROP POLICY IF EXISTS "pol_otp_service_update" ON public.otp_verifications;

-- Block all client access (edge functions use service_role which bypasses RLS)
CREATE POLICY "otp_deny_anon"
  ON public.otp_verifications AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "otp_deny_authenticated"
  ON public.otp_verifications AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- 5. FIX: app_secrets - Add RLS policies (RLS already enabled)
CREATE POLICY "app_secrets_service_role_only"
  ON public.app_secrets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "app_secrets_deny_anon"
  ON public.app_secrets AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "app_secrets_deny_authenticated"
  ON public.app_secrets AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- 6. FIX: Deny anon access explicitly for sensitive tables
-- profiles - already authenticated-only but add explicit anon deny
CREATE POLICY "profiles_deny_anon"
  ON public.profiles AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- appointments - add explicit anon deny
CREATE POLICY "appointments_deny_anon"
  ON public.appointments AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- invoices - add explicit anon deny
CREATE POLICY "invoices_deny_anon"
  ON public.invoices AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- technician_profiles - add explicit anon deny
CREATE POLICY "tp_deny_anon"
  ON public.technician_profiles AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- vendors - add explicit anon deny
CREATE POLICY "vendors_deny_anon"
  ON public.vendors AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
