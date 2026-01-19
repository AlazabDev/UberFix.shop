-- إصلاح الدوال التي لا تحتوي على search_path

-- 1. trigger_daftra_sync
CREATE OR REPLACE FUNCTION public.trigger_daftra_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Log the sync trigger
  INSERT INTO public.daftra_sync_logs (
    maintenance_request_id,
    sync_type,
    status,
    request_payload
  ) VALUES (
    NEW.id,
    'auto_trigger',
    'pending',
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$;

-- 2. update_documents_updated_at (إذا لم يكن لديه search_path)
CREATE OR REPLACE FUNCTION public.update_documents_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. validate_sensitive_settings
CREATE OR REPLACE FUNCTION public.validate_sensitive_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate SMTP settings if provided
  IF NEW.smtp_host IS NOT NULL AND NEW.smtp_host != '' THEN
    IF NEW.smtp_port IS NULL OR NEW.smtp_port < 1 OR NEW.smtp_port > 65535 THEN
      RAISE EXCEPTION 'Invalid SMTP port';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;