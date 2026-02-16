
-- Fix infinite recursion: change ALL policies to INSERT/UPDATE/DELETE only
-- so SELECT doesn't trigger profiles lookup

-- STORES
DROP POLICY IF EXISTS "stores_admin_write" ON stores;
CREATE POLICY "stores_admin_insert" ON stores FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));
CREATE POLICY "stores_admin_update" ON stores FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));
CREATE POLICY "stores_admin_delete" ON stores FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));

-- MAINTENANCE_REQUESTS_ARCHIVE
DROP POLICY IF EXISTS "archive_admin_write" ON maintenance_requests_archive;
CREATE POLICY "archive_admin_insert" ON maintenance_requests_archive FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));
CREATE POLICY "archive_admin_update" ON maintenance_requests_archive FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));
CREATE POLICY "archive_admin_delete" ON maintenance_requests_archive FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));

-- RATE_ITEMS
DROP POLICY IF EXISTS "rate_items_admin_write" ON rate_items;
CREATE POLICY "rate_items_admin_insert" ON rate_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','finance')));
CREATE POLICY "rate_items_admin_update" ON rate_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','finance')));
CREATE POLICY "rate_items_admin_delete" ON rate_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','finance')));

-- MALLS
DROP POLICY IF EXISTS "malls_admin_write" ON malls;
CREATE POLICY "malls_admin_insert" ON malls FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));
CREATE POLICY "malls_admin_update" ON malls FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));
CREATE POLICY "malls_admin_delete" ON malls FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));

-- Also fix the profiles_secure_select to avoid self-reference recursion
DROP POLICY IF EXISTS "profiles_secure_select" ON profiles;
CREATE POLICY "profiles_secure_select" ON profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR has_role(auth.uid(), 'owner'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);
