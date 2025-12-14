-- Drop and recreate the profiles_read_own policy to ensure it works correctly
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;

-- Allow users to read their own profile (matching on id = auth.uid())
CREATE POLICY profiles_read_own ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Also add policy to allow owner emails to read all profiles
CREATE POLICY profiles_owner_read_all ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.email = ANY(ARRAY['mohamed@alazab.com', 'admin@alazab.com', 'uberfix@alazab.com', 'magdy@alazab.com', 'ceo@alazab.com', 'm.uberfix@alazab.com']::text[])
  )
);