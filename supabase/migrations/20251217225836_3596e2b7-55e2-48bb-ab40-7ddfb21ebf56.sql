-- Add service-map module for customer role
INSERT INTO module_permissions (role, module_key, module_name, is_enabled)
VALUES ('customer', 'service-map', 'خريطة الخدمات', true);