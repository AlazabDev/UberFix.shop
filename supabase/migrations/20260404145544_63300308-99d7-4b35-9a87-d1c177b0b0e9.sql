
DROP FUNCTION IF EXISTS public.public_track_request(text);

CREATE OR REPLACE FUNCTION public.public_track_request(query_text text)
RETURNS TABLE(
  id uuid, request_number text, title text, description text, status text,
  workflow_stage text, created_at timestamptz, updated_at timestamptz,
  client_name text, location text, priority text, service_type text,
  sla_due_date timestamptz, rating integer, channel text, branch_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cleaned text;
BEGIN
  cleaned := trim(query_text);
  IF cleaned ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN QUERY
    SELECT mr.id, mr.request_number, mr.title, mr.description, mr.status::text, mr.workflow_stage,
           mr.created_at, mr.updated_at, mr.client_name, mr.location, mr.priority,
           mr.service_type, mr.sla_due_date, mr.rating, mr.channel, b.name as branch_name
    FROM maintenance_requests mr LEFT JOIN branches b ON b.id = mr.branch_id
    WHERE mr.id = cleaned::uuid LIMIT 1;
    IF FOUND THEN RETURN; END IF;
  END IF;
  RETURN QUERY
  SELECT mr.id, mr.request_number, mr.title, mr.description, mr.status::text, mr.workflow_stage,
         mr.created_at, mr.updated_at, mr.client_name, mr.location, mr.priority,
         mr.service_type, mr.sla_due_date, mr.rating, mr.channel, b.name as branch_name
  FROM maintenance_requests mr LEFT JOIN branches b ON b.id = mr.branch_id
  WHERE upper(mr.request_number) = upper(cleaned) LIMIT 1;
  IF FOUND THEN RETURN; END IF;
  RETURN QUERY
  SELECT mr.id, mr.request_number, mr.title, mr.description, mr.status::text, mr.workflow_stage,
         mr.created_at, mr.updated_at, mr.client_name, mr.location, mr.priority,
         mr.service_type, mr.sla_due_date, mr.rating, mr.channel, b.name as branch_name
  FROM maintenance_requests mr LEFT JOIN branches b ON b.id = mr.branch_id
  WHERE mr.client_phone = cleaned
     OR mr.client_phone = regexp_replace(cleaned, '^\+?20', '0')
     OR regexp_replace(mr.client_phone, '^\+?20', '0') = regexp_replace(cleaned, '^\+?20', '0')
  ORDER BY mr.created_at DESC LIMIT 5;
END;
$function$;
