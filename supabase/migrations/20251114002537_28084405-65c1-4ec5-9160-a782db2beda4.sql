-- ===================================================================
-- إصلاح search_path لجميع الـ Functions المتبقية
-- ===================================================================

-- 1. update_vendors_updated_at
CREATE OR REPLACE FUNCTION public.update_vendors_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2. get_user_tenant (تم إصلاحها بالفعل في الكود الحالي ولكن سنعيد التأكيد)
CREATE OR REPLACE FUNCTION public.get_user_tenant()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT tenant_id FROM public.user_profiles WHERE auth_user_id = auth.uid()
  );
END;
$function$;

-- 3. update_vendor_location (تم إصلاحها بالفعل ولكن سنعيد التأكيد)
CREATE OR REPLACE FUNCTION public.update_vendor_location()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.vendors
  SET 
    current_latitude = NEW.latitude,
    current_longitude = NEW.longitude,
    location_updated_at = NOW()
  WHERE id = NEW.vendor_id;
  
  RETURN NEW;
END;
$function$;

-- 4. get_cities_for_user (تم إصلاحها بالفعل ولكن سنعيد التأكيد)
CREATE OR REPLACE FUNCTION public.get_cities_for_user(p_user_id uuid)
RETURNS TABLE(city_id uuid, name text, country text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_memberships um
    WHERE um.user_id = p_user_id
      AND um.is_active = true
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.id, c.name, c.country
  FROM public.cities c
  WHERE c.is_public = true
     OR EXISTS (
       SELECT 1 FROM public.user_city_access uca
       WHERE uca.city_id = c.id
         AND uca.user_id = p_user_id
     );
END;
$function$;

-- 5. update_technician_progress
CREATE OR REPLACE FUNCTION public.update_technician_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE technicians
  SET progress_level = COALESCE((
    SELECT SUM(progress_value)
    FROM technician_tasks
    WHERE technician_id = NEW.technician_id AND completed = TRUE
  ), 0),
  progress_label = CASE
    WHEN (SELECT SUM(progress_value) FROM technician_tasks WHERE technician_id = NEW.technician_id AND completed = TRUE) >= 100 THEN 'مكتمل'
    WHEN (SELECT SUM(progress_value) FROM technician_tasks WHERE technician_id = NEW.technician_id AND completed = TRUE) >= 75 THEN 'تحميل المستندات'
    WHEN (SELECT SUM(progress_value) FROM technician_tasks WHERE technician_id = NEW.technician_id AND completed = TRUE) >= 50 THEN 'الملف المهني'
    ELSE 'البيانات الأساسية'
  END
  WHERE id = NEW.technician_id;
  RETURN NEW;
END;
$function$;

-- 6. get_table_row_counts
CREATE OR REPLACE FUNCTION public.get_table_row_counts()
RETURNS TABLE(table_name text, row_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    tbl_name text;
BEGIN
    FOR tbl_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        RETURN QUERY EXECUTE 
            'SELECT ''' || tbl_name || ''', COUNT(*) FROM public.' || quote_ident(tbl_name);
    END LOOP;
END;
$function$;

-- 7. update_error_logs_updated_at
CREATE OR REPLACE FUNCTION public.update_error_logs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- تعليق: تم إصلاح جميع الـ functions بإضافة SET search_path TO 'public'