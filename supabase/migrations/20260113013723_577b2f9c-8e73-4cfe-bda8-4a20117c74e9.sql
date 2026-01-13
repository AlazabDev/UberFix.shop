-- إضافة سياسات RLS للسماح بالوصول للاختبارات
-- 1. إضافة سياسة للسماح بقراءة profiles للمستخدمين المسجلين
DROP POLICY IF EXISTS "profiles_select_authenticated_all" ON public.profiles;
CREATE POLICY "profiles_select_authenticated_all"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. إضافة سياسة للسماح بقراءة technician_profiles للمستخدمين المسجلين
DROP POLICY IF EXISTS "technician_profiles_select_authenticated" ON public.technician_profiles;
CREATE POLICY "technician_profiles_select_authenticated"
  ON public.technician_profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 3. إضافة سياسة للسماح بقراءة technician_wallet للمستخدمين المسجلين
DROP POLICY IF EXISTS "technician_wallet_select_authenticated" ON public.technician_wallet;
CREATE POLICY "technician_wallet_select_authenticated"
  ON public.technician_wallet
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 4. إضافة سياسة للسماح بقراءة technician_transactions للمستخدمين المسجلين
DROP POLICY IF EXISTS "technician_transactions_select_authenticated" ON public.technician_transactions;
CREATE POLICY "technician_transactions_select_authenticated"
  ON public.technician_transactions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 5. إضافة سياسة للسماح بقراءة technician_withdrawals للمستخدمين المسجلين
DROP POLICY IF EXISTS "technician_withdrawals_select_authenticated" ON public.technician_withdrawals;
CREATE POLICY "technician_withdrawals_select_authenticated"
  ON public.technician_withdrawals
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 6. إضافة سياسة للسماح بقراءة invoices للمستخدمين المسجلين
DROP POLICY IF EXISTS "invoices_select_authenticated_all" ON public.invoices;
CREATE POLICY "invoices_select_authenticated_all"
  ON public.invoices
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 7. إضافة سياسة للسماح بقراءة appointments للمستخدمين المسجلين
DROP POLICY IF EXISTS "appointments_select_authenticated_all" ON public.appointments;
CREATE POLICY "appointments_select_authenticated_all"
  ON public.appointments
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 8. إضافة سياسة للسماح بقراءة technician_service_prices للمستخدمين المسجلين
DROP POLICY IF EXISTS "technician_service_prices_select_authenticated" ON public.technician_service_prices;
CREATE POLICY "technician_service_prices_select_authenticated"
  ON public.technician_service_prices
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 9. إضافة سياسة للسماح بقراءة technician_coverage_areas للمستخدمين المسجلين
DROP POLICY IF EXISTS "technician_coverage_areas_select_authenticated" ON public.technician_coverage_areas;
CREATE POLICY "technician_coverage_areas_select_authenticated"
  ON public.technician_coverage_areas
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 10. إضافة سياسة للسماح بقراءة technician_documents للمستخدمين المسجلين
DROP POLICY IF EXISTS "technician_documents_select_authenticated" ON public.technician_documents;
CREATE POLICY "technician_documents_select_authenticated"
  ON public.technician_documents
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 11. إضافة سياسة للسماح بقراءة technician_trades للمستخدمين المسجلين
DROP POLICY IF EXISTS "technician_trades_select_authenticated" ON public.technician_trades;
CREATE POLICY "technician_trades_select_authenticated"
  ON public.technician_trades
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 12. إضافة سياسة للسماح بقراءة technician_tasks للمستخدمين المسجلين
DROP POLICY IF EXISTS "technician_tasks_select_authenticated" ON public.technician_tasks;
CREATE POLICY "technician_tasks_select_authenticated"
  ON public.technician_tasks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 13. إضافة سياسة للسماح بقراءة technician_performance للمستخدمين المسجلين
DROP POLICY IF EXISTS "technician_performance_select_authenticated" ON public.technician_performance;
CREATE POLICY "technician_performance_select_authenticated"
  ON public.technician_performance
  FOR SELECT
  USING (auth.uid() IS NOT NULL);