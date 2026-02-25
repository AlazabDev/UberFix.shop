
-- إصلاح Security Definer View
DROP VIEW IF EXISTS profiles_names_only;
CREATE VIEW profiles_names_only 
WITH (security_invoker = true) AS
SELECT id, name, full_name, role, company_id
FROM profiles;

-- 1. documents: تقييد القراءة
DROP POLICY IF EXISTS "documents_select" ON documents;
DROP POLICY IF EXISTS "docs_select_staff" ON documents;
CREATE POLICY "documents_select_strict" ON documents
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin')
  );

-- 2. properties: تقييد القراءة
DROP POLICY IF EXISTS "properties_select" ON properties;
DROP POLICY IF EXISTS "Users can view properties" ON properties;
CREATE POLICY "properties_select_strict" ON properties
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'manager')
  );

-- 3. vendors: تقييد إلى owner/admin فقط (لا يوجد user_id)
DROP POLICY IF EXISTS "vendors_select" ON vendors;
DROP POLICY IF EXISTS "Vendors are viewable by managers" ON vendors;
CREATE POLICY "vendors_select_strict" ON vendors
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'manager')
  );

-- 4. expenses: تقييد
DROP POLICY IF EXISTS "expenses_select" ON expenses;
DROP POLICY IF EXISTS "Users can view expenses" ON expenses;
CREATE POLICY "expenses_select_strict" ON expenses
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'finance')
  );

-- 5. technician_transactions: تقييد
DROP POLICY IF EXISTS "technician_transactions_select" ON technician_transactions;
DROP POLICY IF EXISTS "tt_select" ON technician_transactions;
CREATE POLICY "tt_select_strict" ON technician_transactions
  FOR SELECT TO authenticated
  USING (
    technician_id = get_technician_id_for_user(auth.uid()) OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin')
  );

-- 6. maintenance_contracts: تقييد
DROP POLICY IF EXISTS "contracts_select" ON maintenance_contracts;
DROP POLICY IF EXISTS "mc_select" ON maintenance_contracts;
CREATE POLICY "contracts_select_strict" ON maintenance_contracts
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'owner') OR 
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'manager')
  );
