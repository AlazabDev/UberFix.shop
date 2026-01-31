-- Add missing customer permissions
INSERT INTO module_permissions (role, module_key, module_name, is_enabled) 
VALUES 
  ('customer', 'vendors', 'الموردين والفنيين', true),
  ('customer', 'all_requests', 'كل الطلبات', true)
ON CONFLICT (role, module_key) DO NOTHING;