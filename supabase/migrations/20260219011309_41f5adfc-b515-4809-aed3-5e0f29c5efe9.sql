-- Fix stores policies to use has_role() instead of direct profiles query
DROP POLICY IF EXISTS "stores_admin_delete" ON public.stores;
DROP POLICY IF EXISTS "stores_admin_insert" ON public.stores;
DROP POLICY IF EXISTS "stores_admin_update" ON public.stores;

CREATE POLICY "stores_admin_insert" ON public.stores
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "stores_admin_update" ON public.stores
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "stores_admin_delete" ON public.stores
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Fix archive policies similarly
DROP POLICY IF EXISTS "archive_admin_delete" ON public.maintenance_requests_archive;
DROP POLICY IF EXISTS "archive_admin_insert" ON public.maintenance_requests_archive;
DROP POLICY IF EXISTS "archive_admin_update" ON public.maintenance_requests_archive;

CREATE POLICY "archive_admin_insert" ON public.maintenance_requests_archive
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "archive_admin_update" ON public.maintenance_requests_archive
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "archive_admin_delete" ON public.maintenance_requests_archive
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Add manager to profiles SELECT for better data access
DROP POLICY IF EXISTS "profiles_secure_select" ON public.profiles;
CREATE POLICY "profiles_secure_select" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR 
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role)
);