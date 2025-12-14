-- Drop the problematic recursive policy
DROP POLICY IF EXISTS profiles_owner_read_all ON public.profiles;

-- Create a security definer function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner_email()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email = ANY(ARRAY['mohamed@alazab.com', 'admin@alazab.com', 'uberfix@alazab.com', 'magdy@alazab.com', 'ceo@alazab.com', 'm.uberfix@alazab.com']::text[])
  )
$$;

-- Create policy using the security definer function (avoids recursion)
CREATE POLICY profiles_owner_read_all ON public.profiles
FOR SELECT USING (public.is_owner_email());