
-- =====================================================
-- SECURITY FIX: Restrict public access to sensitive tables
-- Following adaptive security pattern: use safe views, don't disable functionality
-- =====================================================

-- 1. FIX: profiles table - remove any public read access
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;

-- 2. FIX: technician_profiles - ensure no public access  
DROP POLICY IF EXISTS "technician_profiles_public_read" ON technician_profiles;

-- 3. FIX: invoices - remove any public access policies, add proper RLS
DROP POLICY IF EXISTS "invoices_public_read" ON invoices;

-- Ensure invoices has proper restrictive policies
DROP POLICY IF EXISTS "invoices_select_secure" ON invoices;
CREATE POLICY "invoices_select_secure" ON invoices
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() 
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

-- 4. FIX: maintenance_requests - change mr_insert_combined from public to authenticated
DROP POLICY IF EXISTS "mr_insert_combined" ON maintenance_requests;
CREATE POLICY "mr_insert_authenticated" ON maintenance_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    OR is_staff(auth.uid())
  );

-- Allow service role for edge functions (public QR submissions use edge function)
DROP POLICY IF EXISTS "mr_service_role_insert" ON maintenance_requests;
CREATE POLICY "mr_service_role_insert" ON maintenance_requests
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 5. FIX: profiles_insert_auth - change from public to authenticated
DROP POLICY IF EXISTS "profiles_insert_auth" ON profiles;
CREATE POLICY "profiles_insert_authenticated" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- 6. FIX: profiles_update_own_v2 - change from public to authenticated
DROP POLICY IF EXISTS "profiles_update_own_v2" ON profiles;
CREATE POLICY "profiles_update_own_secure" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. FIX: documents policies - change from public to authenticated
DROP POLICY IF EXISTS "Staff can insert documents" ON documents;
CREATE POLICY "documents_insert_staff" ON documents
  FOR INSERT TO authenticated
  WITH CHECK (is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can update documents" ON documents;
CREATE POLICY "documents_update_staff" ON documents
  FOR UPDATE TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
CREATE POLICY "documents_delete_admin" ON documents
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Staff can view all documents" ON documents;
CREATE POLICY "documents_select_staff" ON documents
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR is_staff(auth.uid())
  );

-- 8. FIX: document_audit_logs - remove public SELECT with qual:true
DROP POLICY IF EXISTS "Allow select document_audit_logs" ON document_audit_logs;

-- 9. FIX: document_comments - remove public SELECT with qual:true
DROP POLICY IF EXISTS "Allow select document_comments" ON document_comments;
DROP POLICY IF EXISTS "Staff can insert comments" ON document_comments;
CREATE POLICY "document_comments_insert_staff" ON document_comments
  FOR INSERT TO authenticated
  WITH CHECK (is_staff(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own comments" ON document_comments;
CREATE POLICY "document_comments_update" ON document_comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_staff(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR is_staff(auth.uid()));

-- 10. FIX: document_signatures - remove public SELECT with qual:true
DROP POLICY IF EXISTS "Allow select document_signatures" ON document_signatures;
DROP POLICY IF EXISTS "Staff can insert signatures" ON document_signatures;
CREATE POLICY "document_signatures_insert_staff" ON document_signatures
  FOR INSERT TO authenticated
  WITH CHECK (is_staff(auth.uid()) OR signer_id = auth.uid());

-- 11. FIX: document_versions - remove public SELECT with qual:true
DROP POLICY IF EXISTS "Allow select document_versions" ON document_versions;
DROP POLICY IF EXISTS "Staff can insert document versions" ON document_versions;
CREATE POLICY "document_versions_insert_staff" ON document_versions
  FOR INSERT TO authenticated
  WITH CHECK (is_staff(auth.uid()));

-- 12. FIX: technician_wallet - restrict access
DROP POLICY IF EXISTS "Authenticated users can view wallets" ON technician_wallet;
DROP POLICY IF EXISTS "technician_wallet_select_own" ON technician_wallet;
CREATE POLICY "technician_wallet_select_own" ON technician_wallet
  FOR SELECT TO authenticated
  USING (
    technician_id = get_technician_id_for_user(auth.uid())
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

-- 13. FIX: technician_transactions - restrict access
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON technician_transactions;
DROP POLICY IF EXISTS "technician_transactions_select_own" ON technician_transactions;
CREATE POLICY "technician_transactions_select_own" ON technician_transactions
  FOR SELECT TO authenticated
  USING (
    technician_id = get_technician_id_for_user(auth.uid())
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

-- 14. Add service_role full access for edge functions where needed
DROP POLICY IF EXISTS "invoices_service_role_all" ON invoices;
CREATE POLICY "invoices_service_role_all" ON invoices
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "documents_service_role_all" ON documents;
CREATE POLICY "documents_service_role_all" ON documents
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
