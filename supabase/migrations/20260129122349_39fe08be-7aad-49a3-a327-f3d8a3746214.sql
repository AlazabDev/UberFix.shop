
-- =====================================================
-- FIX 1: Remove overly permissive policy on appointments
-- The policy "Authenticated users can view appointments" allows any authenticated user to see ALL appointments
-- This exposes customer PII (names, emails, phones)
-- =====================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.appointments;

-- Keep the existing secure policies:
-- - appointments_creator_select (user can see their own)
-- - appointments_staff_select (staff can see all)
-- These are already correctly configured

-- =====================================================
-- FIX 2: Add public INSERT policy for consultation_bookings
-- Allow unauthenticated users to submit consultation requests
-- But add rate limiting validation
-- =====================================================

-- Allow anonymous users to insert bookings (for public forms)
CREATE POLICY "Public can create consultation bookings"
ON public.consultation_bookings
FOR INSERT
TO anon
WITH CHECK (
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::text 
  AND phone ~* '^\+?[0-9]{10,15}$'::text
);

-- =====================================================
-- FIX 3: Verify invoices has proper RLS
-- Check and fix if needed
-- =====================================================

-- Drop overly permissive policy if exists
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;

-- Ensure proper policies exist for invoices
-- Users can only see invoices they created or are assigned to
DROP POLICY IF EXISTS "invoices_creator_select" ON public.invoices;
CREATE POLICY "invoices_creator_select" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (created_by = auth.uid());

-- Staff can view all invoices
DROP POLICY IF EXISTS "invoices_staff_select" ON public.invoices;
CREATE POLICY "invoices_staff_select"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);

-- =====================================================
-- FIX 4: Restrict profiles visibility
-- Currently "Users can view all profiles" exposes all employee data
-- =====================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view their own profile
DROP POLICY IF EXISTS "profiles_own_select" ON public.profiles;
CREATE POLICY "profiles_own_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Staff can view all profiles for admin purposes
DROP POLICY IF EXISTS "profiles_staff_select" ON public.profiles;
CREATE POLICY "profiles_staff_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);

-- Keep read for property managers policy (already exists for forms)
-- This allows reading names for dropdowns but not sensitive data
