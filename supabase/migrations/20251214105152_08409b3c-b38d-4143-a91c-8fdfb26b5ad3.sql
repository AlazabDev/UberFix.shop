-- Fix: Public Maintenance Request Creation Lacks Validation
-- This migration adds proper validation to prevent spam attacks on public maintenance requests

-- 1. Create Egyptian phone validation function
CREATE OR REPLACE FUNCTION public.is_valid_egyptian_phone(phone text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF phone IS NULL THEN
    RETURN false;
  END IF;
  -- Egyptian phone format: +20XXXXXXXXXX or 01XXXXXXXXX or 201XXXXXXXXX
  RETURN phone ~ '^(\+?20|0)[0-9]{10,11}$';
END;
$$;

-- 2. Drop the existing vulnerable policy
DROP POLICY IF EXISTS "Controlled maintenance request insert" ON maintenance_requests;

-- 3. Create new validated policy with rate limiting and duplicate prevention
CREATE POLICY "Validated public request insert"
  ON maintenance_requests FOR INSERT
  WITH CHECK (
    -- Case 1: Authenticated users - must own the request
    (auth.uid() IS NOT NULL AND created_by = auth.uid())
    OR
    -- Case 2: Public requests (QR code) with strict validation
    (
      auth.uid() IS NULL
      AND property_id IS NOT NULL
      -- Property must exist
      AND EXISTS (SELECT 1 FROM properties WHERE id = maintenance_requests.property_id)
      
      -- Required fields validation
      AND client_name IS NOT NULL
      AND length(trim(client_name)) >= 3
      AND client_phone IS NOT NULL
      AND length(client_phone) >= 10
      AND client_phone ~ '^[0-9+()-\s]+$'
      
      -- Description must be meaningful (at least 10 chars)
      AND description IS NOT NULL
      AND length(trim(description)) >= 10
      
      -- Rate limiting: max 3 requests per phone per day
      AND (
        SELECT count(*)
        FROM maintenance_requests mr2
        WHERE mr2.client_phone = maintenance_requests.client_phone
          AND mr2.created_at >= CURRENT_DATE
      ) < 3
      
      -- Prevent exact duplicates within 1 hour
      AND NOT EXISTS (
        SELECT 1
        FROM maintenance_requests mr3
        WHERE mr3.client_phone = maintenance_requests.client_phone
          AND mr3.property_id = maintenance_requests.property_id
          AND mr3.description = maintenance_requests.description
          AND mr3.created_at >= (now() - interval '1 hour')
      )
    )
  );

-- 4. Create function to notify admins about suspicious requests
CREATE OR REPLACE FUNCTION public.notify_suspicious_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  daily_count integer;
  admin_id uuid;
BEGIN
  -- Only check for unauthenticated requests
  IF NEW.created_by IS NULL AND NEW.client_phone IS NOT NULL THEN
    -- Check if same phone submitted many requests today
    SELECT count(*) INTO daily_count
    FROM maintenance_requests
    WHERE client_phone = NEW.client_phone
      AND created_at >= CURRENT_DATE;
    
    IF daily_count >= 2 THEN
      -- Notify all admins about suspicious activity
      FOR admin_id IN 
        SELECT p.id 
        FROM profiles p 
        JOIN user_roles ur ON ur.user_id = p.id 
        WHERE ur.role = 'admin'
      LOOP
        INSERT INTO notifications (recipient_id, title, message, type)
        VALUES (
          admin_id,
          'طلب مشبوه - نشاط متكرر',
          'تم استلام ' || daily_count || ' طلبات من نفس الرقم: ' || NEW.client_phone || ' للعقار: ' || NEW.property_id,
          'warning'
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Create trigger for suspicious request detection
DROP TRIGGER IF EXISTS trg_check_suspicious_requests ON maintenance_requests;
CREATE TRIGGER trg_check_suspicious_requests
  AFTER INSERT ON maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_suspicious_request();

-- 6. Add index for faster rate limit queries
CREATE INDEX IF NOT EXISTS idx_mr_client_phone_created_at 
  ON maintenance_requests (client_phone, created_at) 
  WHERE client_phone IS NOT NULL;