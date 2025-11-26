-- تفعيل RLS لجداول الخدمات

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- Policies for service_categories (جداول مرجعية عامة)
CREATE POLICY "pol_service_categories_public_read"
  ON public.service_categories FOR SELECT
  USING (true);

CREATE POLICY "pol_service_categories_admin"
  ON public.service_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for service_subcategories
CREATE POLICY "pol_service_subcats_public_read"
  ON public.service_subcategories FOR SELECT
  USING (true);

CREATE POLICY "pol_service_subcats_admin"
  ON public.service_subcategories FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for service_items
CREATE POLICY "pol_service_items_public_read"
  ON public.service_items FOR SELECT
  USING (true);

CREATE POLICY "pol_service_items_admin"
  ON public.service_items FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for service_addons
CREATE POLICY "pol_service_addons_public_read"
  ON public.service_addons FOR SELECT
  USING (true);

CREATE POLICY "pol_service_addons_admin"
  ON public.service_addons FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for service_packages
CREATE POLICY "pol_service_packages_public_read"
  ON public.service_packages FOR SELECT
  USING (true);

CREATE POLICY "pol_service_packages_admin"
  ON public.service_packages FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Policies for service_orders (customer_id هو integer)
CREATE POLICY "pol_service_orders_view_all"
  ON public.service_orders FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "pol_service_orders_insert_authenticated"
  ON public.service_orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "pol_service_orders_admin_all"
  ON public.service_orders FOR ALL
  USING (has_role(auth.uid(), 'admin'));