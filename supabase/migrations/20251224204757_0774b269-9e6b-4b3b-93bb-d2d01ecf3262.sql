-- Fix the security warning by setting security_invoker on the view
ALTER VIEW public.technicians_map_public SET (security_invoker = true);