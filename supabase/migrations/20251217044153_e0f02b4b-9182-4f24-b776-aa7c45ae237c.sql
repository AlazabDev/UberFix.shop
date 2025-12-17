-- Fix notify_customer_on_status_change to add permission validation
CREATE OR REPLACE FUNCTION public.notify_customer_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
  v_recipient_id UUID;
BEGIN
  -- Validate caller has permission (staff, assigned tech, or creator)
  IF NOT (
    NEW.created_by = auth.uid() OR 
    NEW.assigned_technician_id = auth.uid() OR
    NEW.last_modified_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'staff', 'owner')
    )
  ) THEN
    -- Skip notification if unauthorized - don't raise exception to avoid breaking updates
    RETURN NEW;
  END IF;

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

  -- Build notification based on new status
  CASE NEW.status
    WHEN 'pending' THEN
      v_title := 'طلب صيانة جديد';
      v_message := 'تم استلام طلب الصيانة الخاص بك: ' || COALESCE(NEW.title, 'بدون عنوان');
    WHEN 'assigned' THEN
      v_title := 'تم تعيين فني';
      v_message := 'تم تعيين فني لطلب الصيانة الخاص بك';
    WHEN 'in_progress' THEN
      v_title := 'جاري العمل';
      v_message := 'بدأ العمل على طلب الصيانة الخاص بك';
    WHEN 'completed' THEN
      v_title := 'تم إكمال الطلب';
      v_message := 'تم إكمال طلب الصيانة الخاص بك بنجاح';
    WHEN 'cancelled' THEN
      v_title := 'تم إلغاء الطلب';
      v_message := 'تم إلغاء طلب الصيانة';
    ELSE
      v_title := 'تحديث حالة الطلب';
      v_message := 'تم تحديث حالة طلب الصيانة إلى: ' || NEW.status;
  END CASE;

  -- Insert notification
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    title,
    message,
    type,
    entity_type,
    entity_id
  ) VALUES (
    v_recipient_id,
    auth.uid(),
    v_title,
    v_message,
    'maintenance_update',
    'maintenance_request',
    NEW.id
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the update
    RAISE WARNING 'notify_customer_on_status_change error: %', SQLERRM;
    RETURN NEW;
END;
$$;