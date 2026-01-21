-- Create safe read views to avoid exposing encrypted/extra columns

-- Appointments safe view (exclude *_enc fields and embed limited related data)
create or replace view public.appointments_safe
with (security_invoker=on) as
select
  a.id,
  a.title,
  a.description,
  a.customer_name,
  a.customer_phone,
  a.customer_email,
  a.appointment_date,
  a.appointment_time,
  a.duration_minutes,
  a.status,
  a.property_id,
  a.vendor_id,
  a.maintenance_request_id,
  a.location,
  a.notes,
  a.reminder_sent,
  a.created_by,
  a.created_at,
  a.updated_at,
  p.name as property_name,
  p.address as property_address,
  v.name as vendor_name,
  v.specialization as vendor_specialization
from public.appointments a
left join public.properties p on p.id = a.property_id
left join public.vendors_public_safe v on v.id = a.vendor_id;

-- Invoices safe view (explicit columns only)
create or replace view public.invoices_safe
with (security_invoker=on) as
select
  id,
  invoice_number,
  customer_name,
  customer_email,
  customer_phone,
  amount,
  currency,
  due_date,
  issue_date,
  status,
  payment_method,
  notes,
  created_by,
  created_at,
  updated_at,
  version,
  is_locked,
  last_modified_by,
  payment_reference
from public.invoices;

-- Ensure views are accessible under same RLS rules as base tables
grant select on public.appointments_safe to authenticated;
grant select on public.invoices_safe to authenticated;