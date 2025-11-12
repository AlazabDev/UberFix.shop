-- Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, resource, action)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for role_permissions
CREATE POLICY "Admins can manage role_permissions"
  ON public.role_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "All users can view role_permissions"
  ON public.role_permissions
  FOR SELECT
  USING (true);

-- Insert default permissions
INSERT INTO public.role_permissions (role, resource, action) VALUES
  ('admin', 'all', 'all'),
  ('manager', 'requests', 'view'),
  ('manager', 'requests', 'edit'),
  ('manager', 'technicians', 'view'),
  ('technician', 'requests', 'view'),
  ('technician', 'own_requests', 'edit'),
  ('customer', 'own_requests', 'view'),
  ('customer', 'own_requests', 'create')
ON CONFLICT (role, resource, action) DO NOTHING;