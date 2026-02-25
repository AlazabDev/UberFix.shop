
-- تفعيل pg_net للاستدعاء HTTP من داخل الدوال
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- دالة الإشعار التلقائي عند تغيير حالة الطلب
CREATE OR REPLACE FUNCTION public.auto_notify_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_stage TEXT;
  v_url TEXT;
  v_anon_key TEXT;
BEGIN
  -- فقط عند تغيير الحالة أو مرحلة سير العمل
  IF (OLD.status IS NOT DISTINCT FROM NEW.status) 
     AND (OLD.workflow_stage IS NOT DISTINCT FROM NEW.workflow_stage) THEN
    RETURN NEW;
  END IF;

  -- تجاهل إذا لم يكن هناك رقم هاتف
  IF NEW.client_phone IS NULL OR trim(NEW.client_phone) = '' THEN
    RETURN NEW;
  END IF;

  v_new_stage := COALESCE(NEW.workflow_stage, 
    CASE NEW.status
      WHEN 'Open' THEN 'submitted'
      WHEN 'In Progress' THEN 'in_progress'
      WHEN 'Completed' THEN 'completed'
      WHEN 'Closed' THEN 'closed'
      WHEN 'Cancelled' THEN 'cancelled'
      ELSE 'submitted'
    END
  );

  -- بناء الرابط
  v_url := 'https://zrrffsjbfkphridqyais.supabase.co/functions/v1/send-maintenance-notification';
  v_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpycmZmc2piZmtwaHJpZHF5YWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MzE1NzMsImV4cCI6MjA3MjAwNzU3M30.AwzY48mSUGeopBv5P6gzAPlipTbQasmXK8DR-L_Tm9A';

  -- استدعاء Edge Function عبر pg_net
  PERFORM net.http_post(
    url := v_url,
    body := jsonb_build_object(
      'request_id', NEW.id::text,
      'event_type', 'status_change',
      'old_status', OLD.status,
      'new_status', NEW.status,
      'old_stage', OLD.workflow_stage,
      'new_stage', v_new_stage,
      'send_whatsapp', true,
      'send_email', true
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- لا نريد أن يتوقف التحديث بسبب خطأ في الإشعار
  RAISE WARNING 'auto_notify error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- ربط الـ trigger
DROP TRIGGER IF EXISTS trg_auto_notify_status_change ON public.maintenance_requests;
CREATE TRIGGER trg_auto_notify_status_change
  AFTER UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_notify_on_status_change();
