-- تفعيل RLS للجداول بدون policies

ALTER TABLE IF EXISTS public.technician_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.technician_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.technician_skill_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.technician_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.technician_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.technician_verifications ENABLE ROW LEVEL SECURITY;

-- Policies for technician_agreements
DROP POLICY IF EXISTS "pol_tech_agreements_view" ON public.technician_agreements;
CREATE POLICY "pol_tech_agreements_view"
  ON public.technician_agreements FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM technician_applications WHERE user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "pol_tech_agreements_update" ON public.technician_agreements;
CREATE POLICY "pol_tech_agreements_update"
  ON public.technician_agreements FOR UPDATE
  USING (
    application_id IN (
      SELECT id FROM technician_applications WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pol_tech_agreements_admin" ON public.technician_agreements;
CREATE POLICY "pol_tech_agreements_admin"
  ON public.technician_agreements FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for technician_applications
DROP POLICY IF EXISTS "pol_tech_apps_insert_public" ON public.technician_applications;
CREATE POLICY "pol_tech_apps_insert_public"
  ON public.technician_applications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "pol_tech_apps_view_own" ON public.technician_applications;
CREATE POLICY "pol_tech_apps_view_own"
  ON public.technician_applications FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "pol_tech_apps_admin" ON public.technician_applications;
CREATE POLICY "pol_tech_apps_admin"
  ON public.technician_applications FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for technician_skill_tests
DROP POLICY IF EXISTS "pol_skill_tests_own" ON public.technician_skill_tests;
CREATE POLICY "pol_skill_tests_own"
  ON public.technician_skill_tests FOR ALL
  USING (technician_id = auth.uid())
  WITH CHECK (technician_id = auth.uid());

DROP POLICY IF EXISTS "pol_skill_tests_admin" ON public.technician_skill_tests;
CREATE POLICY "pol_skill_tests_admin"
  ON public.technician_skill_tests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for technician_tasks
DROP POLICY IF EXISTS "pol_tech_tasks_view" ON public.technician_tasks;
CREATE POLICY "pol_tech_tasks_view"
  ON public.technician_tasks FOR SELECT
  USING (technician_id = auth.uid() OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "pol_tech_tasks_update" ON public.technician_tasks;
CREATE POLICY "pol_tech_tasks_update"
  ON public.technician_tasks FOR UPDATE
  USING (technician_id = auth.uid())
  WITH CHECK (technician_id = auth.uid());

DROP POLICY IF EXISTS "pol_tech_tasks_admin" ON public.technician_tasks;
CREATE POLICY "pol_tech_tasks_admin"
  ON public.technician_tasks FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for technician_training
DROP POLICY IF EXISTS "pol_tech_training_view" ON public.technician_training;
CREATE POLICY "pol_tech_training_view"
  ON public.technician_training FOR SELECT
  USING (technician_id = auth.uid() OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "pol_tech_training_update" ON public.technician_training;
CREATE POLICY "pol_tech_training_update"
  ON public.technician_training FOR UPDATE
  USING (technician_id = auth.uid());

DROP POLICY IF EXISTS "pol_tech_training_admin" ON public.technician_training;
CREATE POLICY "pol_tech_training_admin"
  ON public.technician_training FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for technician_verifications
DROP POLICY IF EXISTS "pol_tech_verif_view" ON public.technician_verifications;
CREATE POLICY "pol_tech_verif_view"
  ON public.technician_verifications FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM technician_applications WHERE user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "pol_tech_verif_admin" ON public.technician_verifications;
CREATE POLICY "pol_tech_verif_admin"
  ON public.technician_verifications FOR ALL
  USING (has_role(auth.uid(), 'admin'));