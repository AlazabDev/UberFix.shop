-- Fix RLS policies for all tables with permission denied errors

-- 1. PROFILES - ensure authenticated users can read their own profile
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
CREATE POLICY profiles_read_own ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- 2. VENDORS - allow authenticated users to read vendors
DROP POLICY IF EXISTS vendors_select_authenticated ON public.vendors;
CREATE POLICY vendors_select_authenticated ON public.vendors
FOR SELECT TO authenticated USING (true);

-- 3. VENDOR_LOCATIONS - allow authenticated users to read vendor locations
DROP POLICY IF EXISTS vendor_locations_select_authenticated ON public.vendor_locations;
CREATE POLICY vendor_locations_select_authenticated ON public.vendor_locations
FOR SELECT TO authenticated USING (true);

-- 4. TECHNICIAN_PROFILES - allow authenticated users to read technician profiles
DROP POLICY IF EXISTS technician_profiles_select_authenticated ON public.technician_profiles;
CREATE POLICY technician_profiles_select_authenticated ON public.technician_profiles
FOR SELECT TO authenticated USING (true);

-- 5. INVOICES - allow authenticated users to read their invoices or staff to read all
DROP POLICY IF EXISTS invoices_select_authenticated ON public.invoices;
CREATE POLICY invoices_select_authenticated ON public.invoices
FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR public.is_staff() OR public.is_owner_email()
);

-- 6. INVOICE_ITEMS - allow authenticated users to read invoice items
DROP POLICY IF EXISTS invoice_items_select_authenticated ON public.invoice_items;
CREATE POLICY invoice_items_select_authenticated ON public.invoice_items
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.invoices i 
    WHERE i.id = invoice_id 
    AND (i.created_by = auth.uid() OR public.is_staff() OR public.is_owner_email())
  )
);

-- 7. NOTIFICATIONS - allow users to read their own notifications
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own ON public.notifications
FOR SELECT TO authenticated USING (recipient_id = auth.uid());

-- 8. CATEGORIES - allow all authenticated users to read categories
DROP POLICY IF EXISTS categories_select_authenticated ON public.categories;
CREATE POLICY categories_select_authenticated ON public.categories
FOR SELECT TO authenticated USING (true);

-- 9. APPOINTMENTS - allow users to read their own appointments or staff to read all
DROP POLICY IF EXISTS appointments_select_authenticated ON public.appointments;
CREATE POLICY appointments_select_authenticated ON public.appointments
FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR vendor_id = auth.uid() OR public.is_staff() OR public.is_owner_email()
);

-- 10. PROPERTIES - allow authenticated users to read properties they created or staff to read all
DROP POLICY IF EXISTS properties_select_authenticated ON public.properties;
CREATE POLICY properties_select_authenticated ON public.properties
FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR public.is_staff() OR public.is_owner_email()
);

-- 11. USER_ROLES - allow users to read their own roles
DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 12. MODULE_PERMISSIONS - allow authenticated users to read permissions
DROP POLICY IF EXISTS module_permissions_select_authenticated ON public.module_permissions;
CREATE POLICY module_permissions_select_authenticated ON public.module_permissions
FOR SELECT TO authenticated USING (true);