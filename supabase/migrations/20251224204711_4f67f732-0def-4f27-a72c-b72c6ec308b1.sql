-- Fix the Security Definer View warning by setting security_invoker = true
-- This makes the view respect the RLS policies of the querying user, not the view creator
ALTER VIEW public.technicians_map_public SET (security_invoker = true);