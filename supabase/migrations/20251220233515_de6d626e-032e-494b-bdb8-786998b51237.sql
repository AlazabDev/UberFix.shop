-- ===============================================
-- Fix remaining policies - Drop existing and recreate
-- ===============================================

-- Drop the conflicting policy
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_system" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

-- Recreate profiles policies
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_system"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_delete_admin"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===============================================
-- 3. FIX: app_settings table - Strengthen owner-only access
-- ===============================================

-- Drop existing policies
DROP POLICY IF EXISTS "owner_only" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_owner_only" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_select" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_update" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can view app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Only owners can update app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_select_owner" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_update_owner" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_insert_owner" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_delete_owner" ON public.app_settings;

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated owners can read app_settings (sensitive data)
CREATE POLICY "app_settings_select_owner"
ON public.app_settings
FOR SELECT
TO authenticated
USING (public.is_owner_email() OR public.has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only owners can update app_settings
CREATE POLICY "app_settings_update_owner"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (public.is_owner_email())
WITH CHECK (public.is_owner_email());

-- Policy: Only owners can insert app_settings
CREATE POLICY "app_settings_insert_owner"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_owner_email());

-- Policy: Only owners can delete app_settings
CREATE POLICY "app_settings_delete_owner"
ON public.app_settings
FOR DELETE
TO authenticated
USING (public.is_owner_email());

-- ===============================================
-- 4. Create safe view for public app settings (non-sensitive data only)
-- ===============================================

-- Drop and recreate safe view
DROP VIEW IF EXISTS public.app_settings_public_safe;

CREATE VIEW public.app_settings_public_safe 
WITH (security_invoker = true)
AS
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
  show_footer,
  enable_technician_rating,
  show_technicians_on_map,
  google_maps_enabled,
  map_style
FROM public.app_settings;

-- Grant select on public safe view
GRANT SELECT ON public.app_settings_public_safe TO authenticated;
GRANT SELECT ON public.app_settings_public_safe TO anon;