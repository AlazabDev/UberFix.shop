-- Add RLS policy for public access to submit requests via QR code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'maintenance_requests' 
    AND policyname = 'Allow anonymous to insert maintenance requests'
  ) THEN
    CREATE POLICY "Allow anonymous to insert maintenance requests"
    ON public.maintenance_requests
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Add trigger to send WhatsApp notification when status changes
CREATE OR REPLACE FUNCTION notify_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send notification if status or workflow_stage changed
  IF (TG_OP = 'UPDATE' AND (
    OLD.status IS DISTINCT FROM NEW.status OR 
    OLD.workflow_stage IS DISTINCT FROM NEW.workflow_stage
  )) THEN
    -- Log that we should send notification
    -- The actual sending will be handled by application code
    RAISE NOTICE 'Status changed for request % from % to %', 
      NEW.id, OLD.workflow_stage, NEW.workflow_stage;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS maintenance_request_status_notification ON public.maintenance_requests;
CREATE TRIGGER maintenance_request_status_notification
AFTER UPDATE ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION notify_on_status_change();