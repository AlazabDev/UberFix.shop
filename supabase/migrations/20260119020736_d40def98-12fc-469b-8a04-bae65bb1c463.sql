
-- ============================================
-- إصلاح الثغرات الأمنية الحرجة
-- ============================================

-- 1. إصلاح جدول appointments - حذف السياسة المفتوحة
DROP POLICY IF EXISTS "appointments_select_authenticated_all" ON public.appointments;

-- 2. إصلاح جدول invoices - حذف السياسات المفتوحة
DROP POLICY IF EXISTS "invoices_select_authenticated_all" ON public.invoices;

-- 3. إصلاح جدول consultation_bookings
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON public.consultation_bookings;

CREATE POLICY "Staff can view consultation bookings"
ON public.consultation_bookings
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);

-- 4. إصلاح جدول documents
DROP POLICY IF EXISTS "Anyone can read documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Allow public insert to documents" ON public.documents;
DROP POLICY IF EXISTS "Allow update documents" ON public.documents;

CREATE POLICY "Restricted read documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY "Restricted update documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
)
WITH CHECK (
  created_by = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Restricted insert documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND
  (has_role(auth.uid(), 'admin'::app_role) OR 
   has_role(auth.uid(), 'manager'::app_role) OR 
   has_role(auth.uid(), 'staff'::app_role))
);

-- 5. إصلاح جدول quote_items
DROP POLICY IF EXISTS "quote_items_select_authenticated" ON public.quote_items;
DROP POLICY IF EXISTS "Anyone can read quote_items" ON public.quote_items;

CREATE POLICY "Restricted read quote_items"
ON public.quote_items
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.documents d 
    WHERE d.id = quote_items.document_id 
    AND d.created_by = auth.uid()
  )
);

-- 6. إصلاح جدول technician_profiles
DROP POLICY IF EXISTS "technician_profiles_select_authenticated" ON public.technician_profiles;
DROP POLICY IF EXISTS "Anyone can read technician_profiles" ON public.technician_profiles;

CREATE POLICY "Restricted read technician_profiles"
ON public.technician_profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);

-- 7. إصلاح جدول technician_wallet
DROP POLICY IF EXISTS "technician_wallet_select_authenticated" ON public.technician_wallet;

CREATE POLICY "Restricted read technician_wallet"
ON public.technician_wallet
FOR SELECT
TO authenticated
USING (
  technician_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- 8. إصلاح جدول technician_transactions
DROP POLICY IF EXISTS "technician_transactions_select_authenticated" ON public.technician_transactions;

CREATE POLICY "Restricted read technician_transactions"
ON public.technician_transactions
FOR SELECT
TO authenticated
USING (
  technician_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- 9. إصلاح جدول technician_withdrawals
DROP POLICY IF EXISTS "technician_withdrawals_select_authenticated" ON public.technician_withdrawals;

CREATE POLICY "Restricted read technician_withdrawals"
ON public.technician_withdrawals
FOR SELECT
TO authenticated
USING (
  technician_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 10. إصلاح جدول profiles
DROP POLICY IF EXISTS "profiles_select_authenticated_all" ON public.profiles;

-- 11. إصلاح جدول vendors (لا يحتوي على created_by)
DROP POLICY IF EXISTS "vendors_read_authenticated" ON public.vendors;
DROP POLICY IF EXISTS "vendors_select_authenticated" ON public.vendors;

CREATE POLICY "Restricted read vendors"
ON public.vendors
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);

-- 12. إصلاح جدول properties
DROP POLICY IF EXISTS "properties_read_authenticated" ON public.properties;
DROP POLICY IF EXISTS "properties_select_authenticated" ON public.properties;

CREATE POLICY "Restricted read properties"
ON public.properties
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() OR
  manager_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);
