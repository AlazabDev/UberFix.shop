
-- إكمال الإصلاحات المتبقية

-- حذف السياسة الموجودة ثم إعادة إنشائها
DROP POLICY IF EXISTS "Technicians view own wallet" ON public.technician_wallet;
DROP POLICY IF EXISTS "Admin and accounting manage wallets" ON public.technician_wallet;

CREATE POLICY "Technicians view own wallet v2"
  ON public.technician_wallet
  FOR SELECT
  TO authenticated
  USING (
    technician_id IN (
      SELECT t.id FROM technicians t
      JOIN technician_profiles tp ON t.technician_profile_id = tp.id
      WHERE tp.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'accounting')
  );

CREATE POLICY "Admin and accounting manage wallets"
  ON public.technician_wallet
  FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accounting')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accounting')
  );

-- سياسة technician_performance
DROP POLICY IF EXISTS "View performance for active technicians" ON public.technician_performance;

CREATE POLICY "View performance for active technicians"
  ON public.technician_performance
  FOR SELECT
  TO authenticated
  USING (
    technician_id IN (
      SELECT t.id FROM technicians t
      JOIN technician_profiles tp ON t.technician_profile_id = tp.id
      WHERE tp.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'manager')
    OR technician_id IN (
      SELECT assigned_technician_id FROM maintenance_requests
      WHERE created_by = auth.uid() AND assigned_technician_id IS NOT NULL
    )
  );

-- trigger لـ updated_at
CREATE OR REPLACE FUNCTION public.update_technician_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_technician_profiles_updated_at ON public.technician_profiles;
CREATE TRIGGER trigger_technician_profiles_updated_at
  BEFORE UPDATE ON public.technician_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_technician_profiles_updated_at();

-- سياسة technician_tasks
DROP POLICY IF EXISTS "Technicians manage own tasks" ON public.technician_tasks;
CREATE POLICY "Technicians manage own tasks"
  ON public.technician_tasks
  FOR ALL
  TO authenticated
  USING (
    technician_id IN (
      SELECT t.id FROM technicians t
      JOIN technician_profiles tp ON t.technician_profile_id = tp.id
      WHERE tp.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'dispatcher')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatcher')
  );

-- سياسة technician_service_prices
DROP POLICY IF EXISTS "Technicians manage own service prices" ON public.technician_service_prices;
DROP POLICY IF EXISTS "Public view service prices" ON public.technician_service_prices;

CREATE POLICY "Technicians manage own service prices"
  ON public.technician_service_prices
  FOR ALL
  TO authenticated
  USING (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    technician_id IN (
      SELECT id FROM technician_profiles WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Public view service prices"
  ON public.technician_service_prices
  FOR SELECT
  USING (true);
