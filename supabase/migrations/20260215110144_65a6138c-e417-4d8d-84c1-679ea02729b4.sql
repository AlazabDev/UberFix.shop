
-- =====================================================
-- FIX ALL POLICIES USING "TO public" → "TO authenticated"
-- And add RESTRICTIVE anon deny where missing
-- =====================================================

-- =====================================================
-- 1. BRANCHES: Fix TO public policies
-- =====================================================
DROP POLICY IF EXISTS "Allow users to manage their company's branches" ON public.branches;
DROP POLICY IF EXISTS "Users can view company branches" ON public.branches;

CREATE POLICY "branches_company_manage" ON public.branches
  FOR ALL TO authenticated
  USING (company_id = get_current_user_company_id())
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "branches_deny_anon" ON public.branches
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- =====================================================
-- 2. COMPANIES: Fix TO public policies
-- =====================================================
DROP POLICY IF EXISTS "Allow users to see their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;

CREATE POLICY "companies_own_select" ON public.companies
  FOR SELECT TO authenticated
  USING (id = get_current_user_company_id());

CREATE POLICY "companies_deny_anon" ON public.companies
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- =====================================================
-- 3. DOCUMENTS: Fix TO public SELECT policies
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
DROP POLICY IF EXISTS "documents_select_staff" ON public.documents;
DROP POLICY IF EXISTS "Restricted read documents" ON public.documents;

CREATE POLICY "documents_select_restricted" ON public.documents
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

-- Remove duplicate insert policies
DROP POLICY IF EXISTS "Restricted insert documents" ON public.documents;
DROP POLICY IF EXISTS "documents_update_staff" ON public.documents;

CREATE POLICY "documents_deny_anon" ON public.documents
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- =====================================================
-- 4. EXPENSES: Fix TO public policies
-- =====================================================
DROP POLICY IF EXISTS "expenses_select" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete" ON public.expenses;

CREATE POLICY "expenses_select_auth" ON public.expenses
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR is_staff(auth.uid()));

CREATE POLICY "expenses_insert_auth" ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "expenses_update_auth" ON public.expenses
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_staff(auth.uid()));

CREATE POLICY "expenses_delete_auth" ON public.expenses
  FOR DELETE TO authenticated
  USING (is_staff(auth.uid()));

CREATE POLICY "expenses_deny_anon" ON public.expenses
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- =====================================================
-- 5. FACEBOOK_LEADS: Fix TO public policies
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all leads" ON public.facebook_leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.facebook_leads;

CREATE POLICY "leads_select_admin" ON public.facebook_leads
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "leads_update_admin" ON public.facebook_leads
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'owner'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "leads_deny_anon" ON public.facebook_leads
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- =====================================================
-- 6. NOTIFICATIONS: Fix TO public policies
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "المستخدمون يمكنهم رؤية إشعاراتهم" ON public.notifications;
DROP POLICY IF EXISTS "المستخدمون يمكنهم تحديث إشعاراتهم" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;

-- Keep notifications_read_authenticated (already TO authenticated)
-- Add delete policy
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "notifications_deny_anon" ON public.notifications
  AS RESTRICTIVE FOR SELECT TO anon USING (false);

-- Remove duplicate insert
DROP POLICY IF EXISTS "Authenticated notifications insert" ON public.notifications;

-- =====================================================
-- 7. TECHNICIAN_TRANSACTIONS: Fix TO public policies
-- =====================================================
DROP POLICY IF EXISTS "Admins manage transactions" ON public.technician_transactions;
DROP POLICY IF EXISTS "Technicians view own transactions" ON public.technician_transactions;
DROP POLICY IF EXISTS "technician_transactions_read_authenticated" ON public.technician_transactions;
DROP POLICY IF EXISTS "Restricted read technician_transactions" ON public.technician_transactions;

-- Keep technician_transactions_select_own (already TO authenticated, properly scoped)
CREATE POLICY "transactions_admin_manage" ON public.technician_transactions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "transactions_deny_anon" ON public.technician_transactions
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- =====================================================
-- 8. TECHNICIAN_WITHDRAWALS: Fix TO public policies
-- =====================================================
DROP POLICY IF EXISTS "Admins manage withdrawals" ON public.technician_withdrawals;
DROP POLICY IF EXISTS "Technicians create withdrawal requests" ON public.technician_withdrawals;
DROP POLICY IF EXISTS "Technicians view own withdrawals" ON public.technician_withdrawals;
DROP POLICY IF EXISTS "technician_withdrawals_read_authenticated" ON public.technician_withdrawals;
DROP POLICY IF EXISTS "Authenticated users can view withdrawals" ON public.technician_withdrawals;

-- Keep Restricted read technician_withdrawals (already TO authenticated)
CREATE POLICY "withdrawals_admin_manage" ON public.technician_withdrawals
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "withdrawals_insert_own" ON public.technician_withdrawals
  FOR INSERT TO authenticated
  WITH CHECK (technician_id = get_technician_id_for_user(auth.uid()));

CREATE POLICY "withdrawals_deny_anon" ON public.technician_withdrawals
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- =====================================================
-- 9. MAINTENANCE_REQUESTS: Add anon deny
-- =====================================================
CREATE POLICY "mr_deny_anon" ON public.maintenance_requests
  AS RESTRICTIVE FOR SELECT TO anon USING (false);

-- =====================================================
-- 10. TECHNICIANS: Already has auth-only policies, add anon deny
-- =====================================================
CREATE POLICY "technicians_deny_anon" ON public.technicians
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- =====================================================
-- 11. TECHNICIAN_WALLET: Add anon deny
-- =====================================================
CREATE POLICY "wallet_deny_anon" ON public.technician_wallet
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- =====================================================
-- 12. CONSULTATION_BOOKINGS: Keep anon INSERT for public form, deny SELECT
-- =====================================================
CREATE POLICY "bookings_deny_anon_read" ON public.consultation_bookings
  AS RESTRICTIVE FOR SELECT TO anon USING (false);

-- =====================================================
-- 13. MAINTENANCE_CONTRACTS: Add anon deny  
-- =====================================================
CREATE POLICY "contracts_deny_anon" ON public.maintenance_contracts
  AS RESTRICTIVE FOR ALL TO anon USING (false);
