-- Recreate view with security_invoker to enforce RLS of underlying table
DROP VIEW IF EXISTS public.vw_maintenance_requests_public;

CREATE VIEW public.vw_maintenance_requests_public
WITH (security_invoker = true)
AS
SELECT 
    id,
    company_id,
    branch_id,
    asset_id,
    opened_by_role,
    channel,
    title,
    description,
    category_id,
    subcategory_id,
    priority,
    sla_deadline,
    status,
    created_at,
    created_by,
    client_name,
    client_phone,
    client_email,
    location,
    service_type,
    estimated_cost,
    actual_cost,
    rating,
    workflow_stage,
    sla_due_date,
    assigned_vendor_id,
    vendor_notes,
    archived_at,
    updated_at,
    property_id,
    latitude,
    longitude,
    sla_accept_due,
    sla_arrive_due,
    sla_complete_due,
    customer_notes,
    version,
    last_modified_by
FROM maintenance_requests;

-- Grant access to authenticated users (RLS on maintenance_requests will filter rows)
GRANT SELECT ON public.vw_maintenance_requests_public TO authenticated;

-- Revoke from anon to prevent unauthenticated access
REVOKE ALL ON public.vw_maintenance_requests_public FROM anon;