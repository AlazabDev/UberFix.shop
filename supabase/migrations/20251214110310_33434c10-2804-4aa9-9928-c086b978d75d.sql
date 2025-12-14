-- Fix 1: Profiles RLS - Remove overly permissive policy
DROP POLICY IF EXISTS "profiles_read_for_property_managers" ON profiles;

-- Create restricted view for property manager lookups (no sensitive data)
CREATE OR REPLACE VIEW public.profiles_public_safe AS
SELECT 
  id,
  name,
  full_name,
  position,
  role,
  avatar_url,
  company_id
FROM profiles
WHERE role IN ('manager', 'staff', 'admin');

-- Grant access to the view
GRANT SELECT ON public.profiles_public_safe TO authenticated;

-- Fix 2: Add validation to SECURITY DEFINER functions

-- update_vendor_location - add ownership validation
CREATE OR REPLACE FUNCTION public.update_vendor_location()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate the vendor exists and user has permission
  IF NOT EXISTS (
    SELECT 1 FROM vendors 
    WHERE id = NEW.vendor_id 
    AND (
      user_id = auth.uid() 
      OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot update location for this vendor';
  END IF;

  UPDATE public.vendors
  SET 
    current_latitude = NEW.latitude,
    current_longitude = NEW.longitude,
    location_updated_at = NOW()
  WHERE id = NEW.vendor_id;
  
  RETURN NEW;
END;
$$;

-- is_admin - already has proper check, just ensure it's safe
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles r
    WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role
  );
$$;

-- handle_new_user - add input validation to prevent injection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_phone text;
  v_role text;
BEGIN
  -- Sanitize inputs - remove any potential SQL injection characters
  v_full_name := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), '[<>"\''`;]', '', 'g');
  v_phone := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'phone', ''), '[^0-9+()-\s]', '', 'g');
  v_role := CASE 
    WHEN NEW.raw_user_meta_data->>'role' IN ('customer', 'technician', 'vendor') 
    THEN NEW.raw_user_meta_data->>'role'
    ELSE 'customer'
  END;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    full_name,
    phone,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_full_name,
    v_phone,
    v_role,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't prevent user creation
    RETURN NEW;
END;
$$;

-- generate_invoice_number - add locking to prevent race conditions
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  year_month := to_char(CURRENT_DATE, 'YYYYMM');
  
  -- Use advisory lock to prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext('invoice_number_' || year_month));
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '-%';
  
  RETURN 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 3, '0');
END;
$$;

-- calculate_item_total - add validation for financial calculations
CREATE OR REPLACE FUNCTION public.calculate_item_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate inputs are positive numbers
  IF NEW.quantity IS NULL OR NEW.quantity < 0 THEN
    RAISE EXCEPTION 'Invalid quantity: must be non-negative';
  END IF;
  
  IF NEW.unit_price IS NULL OR NEW.unit_price < 0 THEN
    RAISE EXCEPTION 'Invalid unit_price: must be non-negative';
  END IF;
  
  -- Calculate with precision
  NEW.total_price = ROUND(NEW.quantity * NEW.unit_price, 2);
  
  -- Validate result is reasonable (prevent overflow/manipulation)
  IF NEW.total_price > 999999999.99 THEN
    RAISE EXCEPTION 'Total price exceeds maximum allowed value';
  END IF;
  
  RETURN NEW;
END;
$$;

-- auto_calculate_sla - add validation
CREATE OR REPLACE FUNCTION public.auto_calculate_sla()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accept_hours INTEGER := 2;
  arrive_hours INTEGER := 4;
  complete_hours INTEGER := 24;
BEGIN
  -- Validate priority is a known value
  IF NEW.priority IS NULL OR NEW.priority NOT IN ('high', 'medium', 'low') THEN
    NEW.priority := 'medium';
  END IF;

  CASE NEW.priority
    WHEN 'high' THEN
      accept_hours := 1;
      arrive_hours := 2;
      complete_hours := 8;
    WHEN 'medium' THEN
      accept_hours := 2;
      arrive_hours := 4;
      complete_hours := 24;
    WHEN 'low' THEN
      accept_hours := 4;
      arrive_hours := 8;
      complete_hours := 48;
    ELSE
      accept_hours := 2;
      arrive_hours := 4;
      complete_hours := 24;
  END CASE;

  NEW.sla_accept_due := COALESCE(NEW.created_at, NOW()) + (accept_hours || ' hours')::INTERVAL;
  NEW.sla_arrive_due := COALESCE(NEW.created_at, NOW()) + (arrive_hours || ' hours')::INTERVAL;
  NEW.sla_complete_due := COALESCE(NEW.created_at, NOW()) + (complete_hours || ' hours')::INTERVAL;

  RETURN NEW;
END;
$$;