
-- 1) Stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text,
  phone text,
  email text,
  category text DEFAULT 'retail',
  status text DEFAULT 'active',
  area numeric DEFAULT 0,
  opening_date timestamptz,
  region_id uuid,
  map_url text,
  is_deleted boolean DEFAULT false,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_auth_read" ON public.stores FOR SELECT TO authenticated USING (true);
CREATE POLICY "stores_admin_write" ON public.stores FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));

-- 2) Maintenance requests archive
CREATE TABLE IF NOT EXISTS public.maintenance_requests_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id),
  title text NOT NULL,
  description text,
  status text DEFAULT 'completed',
  priority text DEFAULT 'medium',
  service_type text DEFAULT 'maintenance',
  primary_service_id uuid,
  estimated_cost numeric DEFAULT 0,
  actual_cost numeric DEFAULT 0,
  scheduled_date timestamptz,
  completion_date timestamptz,
  is_deleted boolean DEFAULT false,
  created_by uuid,
  updated_by uuid,
  assigned_to uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.maintenance_requests_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "archive_auth_read" ON public.maintenance_requests_archive FOR SELECT TO authenticated USING (true);
CREATE POLICY "archive_admin_write" ON public.maintenance_requests_archive FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));

-- 3) Rate items
CREATE TABLE IF NOT EXISTS public.rate_items (
  id serial PRIMARY KEY,
  rate_card_id uuid,
  trade_id integer,
  normal_hourly numeric DEFAULT 0,
  after_hours_hourly numeric DEFAULT 0,
  min_billable_hours numeric DEFAULT 0,
  trip_charge numeric DEFAULT 0,
  notes text,
  min_invoice numeric DEFAULT 0
);

ALTER TABLE public.rate_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_items_auth_read" ON public.rate_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "rate_items_admin_write" ON public.rate_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','finance')));

-- 4) Malls directory
CREATE TABLE IF NOT EXISTS public.malls (
  id serial PRIMARY KEY,
  name text NOT NULL,
  location text,
  type text DEFAULT 'مول'
);

ALTER TABLE public.malls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "malls_auth_read" ON public.malls FOR SELECT TO authenticated USING (true);
CREATE POLICY "malls_admin_write" ON public.malls FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','admin','manager')));

-- Indexes
CREATE INDEX idx_stores_status ON public.stores(status);
CREATE INDEX idx_stores_category ON public.stores(category);
CREATE INDEX idx_archive_store_id ON public.maintenance_requests_archive(store_id);
CREATE INDEX idx_archive_status ON public.maintenance_requests_archive(status);
CREATE INDEX idx_archive_scheduled ON public.maintenance_requests_archive(scheduled_date);
CREATE INDEX idx_malls_type ON public.malls(type);
