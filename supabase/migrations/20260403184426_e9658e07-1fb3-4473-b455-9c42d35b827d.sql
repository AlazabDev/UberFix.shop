
-- Fix notify_customer_on_status_change to use correct mr_status enum values
CREATE OR REPLACE FUNCTION public.notify_customer_on_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_title TEXT;
  v_message TEXT;
  v_recipient_id UUID;
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Determine recipient (the creator of the request)
  v_recipient_id := NEW.created_by;
  
  -- Skip if no recipient
  IF v_recipient_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Build notification based on new status (using mr_status enum values)
  CASE NEW.status
    WHEN 'Open' THEN
      v_title := 'طلب صيانة جديد';
      v_message := 'تم استلام طلب الصيانة الخاص بك: ' || COALESCE(NEW.title, 'بدون عنوان');
    WHEN 'Assigned' THEN
      v_title := 'تم تعيين فني';
      v_message := 'تم تعيين فني لطلب الصيانة الخاص بك';
    WHEN 'In Progress' THEN
      v_title := 'جاري العمل';
      v_message := 'بدأ العمل على طلب الصيانة الخاص بك';
    WHEN 'Completed' THEN
      v_title := 'تم إكمال الطلب';
      v_message := 'تم إكمال طلب الصيانة الخاص بك بنجاح';
    WHEN 'Closed' THEN
      v_title := 'تم إغلاق الطلب';
      v_message := 'تم إغلاق طلب الصيانة بنجاح';
    WHEN 'Cancelled' THEN
      v_title := 'تم إلغاء الطلب';
      v_message := 'تم إلغاء طلب الصيانة';
    WHEN 'On Hold' THEN
      v_title := 'تم تعليق الطلب';
      v_message := 'تم تعليق طلب الصيانة مؤقتاً';
    WHEN 'Rejected' THEN
      v_title := 'تم رفض الطلب';
      v_message := 'تم رفض طلب الصيانة';
    ELSE
      v_title := 'تحديث حالة الطلب';
      v_message := 'تم تحديث حالة طلب الصيانة إلى: ' || NEW.status;
  END CASE;

  -- Insert in-app notification
  INSERT INTO notifications (
    recipient_id,
    title,
    message,
    type,
    entity_type,
    entity_id
  ) VALUES (
    v_recipient_id,
    v_title,
    v_message,
    'maintenance_update',
    'maintenance_request',
    NEW.id
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_customer_on_status_change error: %', SQLERRM;
    RETURN NEW;
END;
$function$;
