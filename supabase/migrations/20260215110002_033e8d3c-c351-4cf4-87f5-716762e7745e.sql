
-- =====================================================
-- COMPREHENSIVE SECURITY FIX: All RLS vulnerabilities
-- =====================================================

-- =====================================================
-- 1. FIX wa_* tables: Replace USING(true) with role-based
-- =====================================================

-- wa_api_keys
DROP POLICY IF EXISTS "Authenticated manage wa_api_keys" ON public.wa_api_keys;
CREATE POLICY "wa_api_keys_admin_only" ON public.wa_api_keys
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- wa_contacts
DROP POLICY IF EXISTS "Authenticated manage wa_contacts" ON public.wa_contacts;
CREATE POLICY "wa_contacts_admin_only" ON public.wa_contacts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- wa_conversations
DROP POLICY IF EXISTS "Authenticated manage wa_conversations" ON public.wa_conversations;
CREATE POLICY "wa_conversations_admin_only" ON public.wa_conversations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- wa_flows
DROP POLICY IF EXISTS "Authenticated manage wa_flows" ON public.wa_flows;
CREATE POLICY "wa_flows_admin_only" ON public.wa_flows
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- wa_media
DROP POLICY IF EXISTS "Authenticated manage wa_media" ON public.wa_media;
CREATE POLICY "wa_media_admin_only" ON public.wa_media
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- wa_messages
DROP POLICY IF EXISTS "Authenticated manage wa_messages" ON public.wa_messages;
CREATE POLICY "wa_messages_admin_only" ON public.wa_messages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- wa_numbers
DROP POLICY IF EXISTS "Authenticated manage wa_numbers" ON public.wa_numbers;
CREATE POLICY "wa_numbers_admin_only" ON public.wa_numbers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- wa_projects
DROP POLICY IF EXISTS "Authenticated users can insert wa_projects" ON public.wa_projects;
DROP POLICY IF EXISTS "Authenticated users can update wa_projects" ON public.wa_projects;
CREATE POLICY "wa_projects_admin_insert" ON public.wa_projects
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "wa_projects_admin_update" ON public.wa_projects
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- wa_templates
DROP POLICY IF EXISTS "Authenticated manage wa_templates" ON public.wa_templates;
CREATE POLICY "wa_templates_admin_only" ON public.wa_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- wa_webhooks
DROP POLICY IF EXISTS "Authenticated manage wa_webhooks" ON public.wa_webhooks;
CREATE POLICY "wa_webhooks_admin_only" ON public.wa_webhooks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 2. FIX properties: Remove overly permissive anon QR policies
--    Keep only safe view for QR, restrict direct table access
-- =====================================================

-- Remove the broad anon SELECT that exposes all active properties
DROP POLICY IF EXISTS "prop_qr_anon_read" ON public.properties;
DROP POLICY IF EXISTS "Limited public access for active properties" ON public.properties;

-- Create a single restricted anon policy via the safe view only
-- The properties_qr_public view already exists and is used by edge functions
-- For direct table: deny anon completely
CREATE POLICY "properties_deny_anon" ON public.properties
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- Remove duplicate authenticated SELECT policies
DROP POLICY IF EXISTS "Restricted read properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated property access" ON public.properties;

-- =====================================================
-- 3. FIX technician_profiles: Remove redundant/broad SELECT policies
-- =====================================================

-- Remove overly broad staff_select (staff shouldn't see ALL technician PII)
DROP POLICY IF EXISTS "technician_profiles_staff_select" ON public.technician_profiles;
-- Remove duplicates - keep only secure_select and self views
DROP POLICY IF EXISTS "technician_profiles_owner_select" ON public.technician_profiles;
DROP POLICY IF EXISTS "technician_profiles_restricted_select" ON public.technician_profiles;
DROP POLICY IF EXISTS "tp_admin_select" ON public.technician_profiles;
DROP POLICY IF EXISTS "tp_self_view" ON public.technician_profiles;

-- Single clean SELECT policy
CREATE POLICY "tp_select_clean" ON public.technician_profiles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

-- =====================================================
-- 4. FIX vendors: Remove staff broad access to vendor contacts
-- =====================================================

DROP POLICY IF EXISTS "vendors_staff_select" ON public.vendors;
DROP POLICY IF EXISTS "Restricted read vendors" ON public.vendors;
-- vendors_admin_select already restricts to admin/manager - keep it

-- =====================================================
-- 5. FIX profiles: Remove duplicate SELECT policies
-- =====================================================

DROP POLICY IF EXISTS "profiles_unified_select" ON public.profiles;
-- Keep profiles_secure_select which includes staff with company scope

-- =====================================================
-- 6. FIX invoices: Remove duplicate SELECT policies
-- =====================================================

DROP POLICY IF EXISTS "invoices_creator_select" ON public.invoices;
DROP POLICY IF EXISTS "invoices_staff_select" ON public.invoices;
-- Keep invoices_select_secure which combines both

-- Restrict invoices to owner/admin/manager/finance only (not general staff)
DROP POLICY IF EXISTS "invoices_select_secure" ON public.invoices;
CREATE POLICY "invoices_select_restricted" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'finance'::app_role)
  );

-- Also restrict invoice delete/update to not include general staff
DROP POLICY IF EXISTS "invoices_staff_delete" ON public.invoices;
CREATE POLICY "invoices_admin_delete" ON public.invoices
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "invoices_creator_update" ON public.invoices;
CREATE POLICY "invoices_update_restricted" ON public.invoices
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'finance'::app_role)
  );

-- =====================================================
-- 7. FIX appointments: Restrict to admin/manager only (not general staff)
-- =====================================================

DROP POLICY IF EXISTS "appointments_staff_select" ON public.appointments;
DROP POLICY IF EXISTS "appointments_staff_delete" ON public.appointments;
DROP POLICY IF EXISTS "appointments_creator_update" ON public.appointments;

CREATE POLICY "appointments_select_restricted" ON public.appointments
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "appointments_update_restricted" ON public.appointments
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "appointments_delete_restricted" ON public.appointments
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 8. FIX document_reviewers: Restrict email access
-- =====================================================

-- Check existing SELECT policies
DROP POLICY IF EXISTS "Admins insert document_reviewers" ON public.document_reviewers;
DROP POLICY IF EXISTS "Update reviewer by valid hash" ON public.document_reviewers;

-- Restricted access: only admin/manager can see/manage reviewers
CREATE POLICY "doc_reviewers_select" ON public.document_reviewers
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "doc_reviewers_insert" ON public.document_reviewers
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "doc_reviewers_update" ON public.document_reviewers
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

-- =====================================================
-- 9. FIX technician_wallet: Remove duplicate SELECT policies
-- =====================================================

DROP POLICY IF EXISTS "Technicians view own wallet v2" ON public.technician_wallet;
DROP POLICY IF EXISTS "technician_wallet_select_own" ON public.technician_wallet;
DROP POLICY IF EXISTS "wallet_select" ON public.technician_wallet;
-- Keep technician_wallet_strict_select (owner/admin/accounting)

-- Also restrict the ALL policy for accounting to just admin
DROP POLICY IF EXISTS "Admin and accounting manage wallets" ON public.technician_wallet;
CREATE POLICY "wallet_admin_manage" ON public.technician_wallet
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 10. FIX technician_profiles: Remove redundant UPDATE
-- =====================================================

DROP POLICY IF EXISTS "technician_profiles_owner_update" ON public.technician_profiles;
-- Keep tp_self_update (self only) and admin can update via service_role
