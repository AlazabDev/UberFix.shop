-- Fix RLS policies for testing and authenticated access

-- 1. Ensure profiles table has proper RLS for authenticated users
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Fix technician_profiles RLS policies
DROP POLICY IF EXISTS "Authenticated users can view technician profiles" ON public.technician_profiles;
CREATE POLICY "Authenticated users can view technician profiles"
ON public.technician_profiles
FOR SELECT
TO authenticated
USING (true);

-- 3. Fix appointments base table RLS for the safe view to work
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.appointments;
CREATE POLICY "Authenticated users can view appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (true);

-- 4. Fix invoices base table RLS for the safe view to work
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
CREATE POLICY "Authenticated users can view invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (true);

-- 5. Fix technician_wallet RLS
DROP POLICY IF EXISTS "Authenticated users can view wallets" ON public.technician_wallet;
CREATE POLICY "Authenticated users can view wallets"
ON public.technician_wallet
FOR SELECT
TO authenticated
USING (true);

-- 6. Fix technician_transactions RLS
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.technician_transactions;
CREATE POLICY "Authenticated users can view transactions"
ON public.technician_transactions
FOR SELECT
TO authenticated
USING (true);

-- 7. Fix technician_withdrawals RLS
DROP POLICY IF EXISTS "Authenticated users can view withdrawals" ON public.technician_withdrawals;
CREATE POLICY "Authenticated users can view withdrawals"
ON public.technician_withdrawals
FOR SELECT
TO authenticated
USING (true);

-- 8. Fix technician related tables RLS
DROP POLICY IF EXISTS "Authenticated can view technician_service_prices" ON public.technician_service_prices;
CREATE POLICY "Authenticated can view technician_service_prices"
ON public.technician_service_prices
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can view technician_coverage_areas" ON public.technician_coverage_areas;
CREATE POLICY "Authenticated can view technician_coverage_areas"
ON public.technician_coverage_areas
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can view technician_documents" ON public.technician_documents;
CREATE POLICY "Authenticated can view technician_documents"
ON public.technician_documents
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can view technician_trades" ON public.technician_trades;
CREATE POLICY "Authenticated can view technician_trades"
ON public.technician_trades
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can view technician_performance" ON public.technician_performance;
CREATE POLICY "Authenticated can view technician_performance"
ON public.technician_performance
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can view technician_tasks" ON public.technician_tasks;
CREATE POLICY "Authenticated can view technician_tasks"
ON public.technician_tasks
FOR SELECT
TO authenticated
USING (true);