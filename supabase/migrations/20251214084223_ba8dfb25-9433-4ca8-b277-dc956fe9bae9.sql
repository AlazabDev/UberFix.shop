-- Create authorized owners table
CREATE TABLE IF NOT EXISTS public.authorized_owners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.authorized_owners ENABLE ROW LEVEL SECURITY;

-- Insert authorized owner emails
INSERT INTO public.authorized_owners (email) VALUES
    ('mohamed@alazab.com'),
    ('admin@alazab.com'),
    ('uberfix@alazab.com'),
    ('magdy@alazab.com'),
    ('ceo@alazab.com'),
    ('m.uberfix@alazab.com')
ON CONFLICT (email) DO NOTHING;

-- Create security definer function to check if user is authorized owner
CREATE OR REPLACE FUNCTION public.is_authorized_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.authorized_owners ao
    JOIN public.profiles p ON p.email = ao.email
    WHERE p.id = _user_id
      AND ao.is_active = true
  )
$$;

-- RLS: Only owners can read authorized_owners table
CREATE POLICY "Only owners can read authorized_owners"
ON public.authorized_owners
FOR SELECT
TO authenticated
USING (public.is_authorized_owner(auth.uid()));

-- Update existing profiles to owner role for authorized emails
UPDATE public.profiles 
SET role = 'owner'
WHERE email IN (
    'mohamed@alazab.com',
    'admin@alazab.com',
    'uberfix@alazab.com',
    'magdy@alazab.com',
    'ceo@alazab.com',
    'm.uberfix@alazab.com'
);

-- Create function to automatically set owner role on login for authorized emails
CREATE OR REPLACE FUNCTION public.sync_owner_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.authorized_owners WHERE email = NEW.email AND is_active = true) THEN
    NEW.role := 'owner';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on profiles
DROP TRIGGER IF EXISTS sync_owner_role_trigger ON public.profiles;
CREATE TRIGGER sync_owner_role_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_owner_role();