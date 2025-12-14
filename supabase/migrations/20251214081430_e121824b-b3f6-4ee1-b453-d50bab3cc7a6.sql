-- Add INSERT policy for profiles table to allow users to create their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Add a SELECT policy that allows authenticated users to read manager/supervisor names for properties
CREATE POLICY "profiles_read_for_property_managers" ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND id IN (
    SELECT manager_id FROM properties WHERE manager_id IS NOT NULL
  )
);