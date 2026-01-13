
-- =====================================================
-- ROOT CAUSE FIX: Permission denied errors on critical tables
-- Problem: RLS policies are too restrictive for authenticated users
-- Solution: Add proper SELECT policies for authenticated users
-- Tables verified: profiles, appointments, invoices, technician_*, properties, vendors
-- =====================================================

-- 1. FIX: profiles table
DROP POLICY IF EXISTS "profiles_read_authenticated" ON public.profiles;
CREATE POLICY "profiles_read_authenticated"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager', 'staff')
  )
);

-- 2. FIX: appointments table
DROP POLICY IF EXISTS "appointments_read_authenticated" ON public.appointments;
CREATE POLICY "appointments_read_authenticated"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() 
    OR vendor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 3. FIX: invoices table
DROP POLICY IF EXISTS "invoices_read_authenticated" ON public.invoices;
CREATE POLICY "invoices_read_authenticated"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 4. FIX: technician_profiles table
DROP POLICY IF EXISTS "technician_profiles_read_authenticated" ON public.technician_profiles;
CREATE POLICY "technician_profiles_read_authenticated"
ON public.technician_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 5. FIX: technician_wallet table
DROP POLICY IF EXISTS "technician_wallet_read_authenticated" ON public.technician_wallet;
CREATE POLICY "technician_wallet_read_authenticated"
ON public.technician_wallet
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    technician_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 6. FIX: technician_transactions table
DROP POLICY IF EXISTS "technician_transactions_read_authenticated" ON public.technician_transactions;
CREATE POLICY "technician_transactions_read_authenticated"
ON public.technician_transactions
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    technician_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 7. FIX: technician_withdrawals table
DROP POLICY IF EXISTS "technician_withdrawals_read_authenticated" ON public.technician_withdrawals;
CREATE POLICY "technician_withdrawals_read_authenticated"
ON public.technician_withdrawals
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    technician_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 8. FIX: technician_service_prices table
DROP POLICY IF EXISTS "technician_service_prices_read_authenticated" ON public.technician_service_prices;
CREATE POLICY "technician_service_prices_read_authenticated"
ON public.technician_service_prices
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    technician_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 9. FIX: technician_coverage_areas table
DROP POLICY IF EXISTS "technician_coverage_areas_read_authenticated" ON public.technician_coverage_areas;
CREATE POLICY "technician_coverage_areas_read_authenticated"
ON public.technician_coverage_areas
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    technician_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 10. FIX: technician_documents table
DROP POLICY IF EXISTS "technician_documents_read_authenticated" ON public.technician_documents;
CREATE POLICY "technician_documents_read_authenticated"
ON public.technician_documents
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    technician_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 11. FIX: technician_trades table
DROP POLICY IF EXISTS "technician_trades_read_authenticated" ON public.technician_trades;
CREATE POLICY "technician_trades_read_authenticated"
ON public.technician_trades
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    technician_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 12. FIX: technician_tasks table
DROP POLICY IF EXISTS "technician_tasks_read_authenticated" ON public.technician_tasks;
CREATE POLICY "technician_tasks_read_authenticated"
ON public.technician_tasks
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    technician_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 13. FIX: technician_performance table
DROP POLICY IF EXISTS "technician_performance_read_authenticated" ON public.technician_performance;
CREATE POLICY "technician_performance_read_authenticated"
ON public.technician_performance
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    technician_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 14. FIX: technicians table (uses created_by, not user_id)
DROP POLICY IF EXISTS "technicians_read_authenticated" ON public.technicians;
CREATE POLICY "technicians_read_authenticated"
ON public.technicians
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 15. FIX: properties table (uses manager_id)
DROP POLICY IF EXISTS "properties_read_authenticated" ON public.properties;
CREATE POLICY "properties_read_authenticated"
ON public.properties
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    manager_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'manager', 'staff')
    )
  )
);

-- 16. FIX: vendors table (no created_by - allow all authenticated with roles)
DROP POLICY IF EXISTS "vendors_read_authenticated" ON public.vendors;
CREATE POLICY "vendors_read_authenticated"
ON public.vendors
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager', 'staff')
  )
);

-- 17. FIX: notifications table
DROP POLICY IF EXISTS "notifications_read_authenticated" ON public.notifications;
CREATE POLICY "notifications_read_authenticated"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  recipient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager', 'staff')
  )
);
