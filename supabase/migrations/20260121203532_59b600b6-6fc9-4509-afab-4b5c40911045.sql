-- Tighten RLS for PII/financial tables while preserving functionality

-- Helper: drop all existing policies on target tables to avoid lingering public access
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('appointments','invoices','technician_profiles','vendor_locations')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_locations ENABLE ROW LEVEL SECURITY;

-- =====================
-- appointments
-- =====================
CREATE POLICY appointments_service_role_all
ON public.appointments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY appointments_staff_select
ON public.appointments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY appointments_creator_select
ON public.appointments
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY appointments_creator_insert
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (
  (created_by = auth.uid())
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY appointments_creator_update
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  (created_by = auth.uid())
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
)
WITH CHECK (
  (created_by = auth.uid())
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY appointments_staff_delete
ON public.appointments
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

-- =====================
-- invoices
-- =====================
CREATE POLICY invoices_service_role_all
ON public.invoices
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY invoices_staff_select
ON public.invoices
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY invoices_creator_select
ON public.invoices
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY invoices_creator_insert
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (
  (created_by = auth.uid())
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY invoices_creator_update
ON public.invoices
FOR UPDATE
TO authenticated
USING (
  (created_by = auth.uid())
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
)
WITH CHECK (
  (created_by = auth.uid())
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY invoices_staff_delete
ON public.invoices
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

-- =====================
-- technician_profiles (PII)
-- =====================
CREATE POLICY technician_profiles_service_role_all
ON public.technician_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY technician_profiles_owner_select
ON public.technician_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY technician_profiles_staff_select
ON public.technician_profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY technician_profiles_owner_insert
ON public.technician_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY technician_profiles_owner_update
ON public.technician_profiles
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
)
WITH CHECK (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY technician_profiles_staff_delete
ON public.technician_profiles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- =====================
-- vendor_locations (restrict; public access only via Edge Function)
-- =====================
CREATE POLICY vendor_locations_service_role_all
ON public.vendor_locations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY vendor_locations_staff_select
ON public.vendor_locations
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY vendor_locations_staff_write
ON public.vendor_locations
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY vendor_locations_staff_update
ON public.vendor_locations
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);

CREATE POLICY vendor_locations_staff_delete
ON public.vendor_locations
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);
