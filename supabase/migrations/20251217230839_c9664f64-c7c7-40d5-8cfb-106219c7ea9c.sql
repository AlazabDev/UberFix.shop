
-- Fix module key naming to match code (underscore format)
UPDATE module_permissions SET module_key = 'service_map' WHERE module_key = 'service-map';

-- Also ensure all module keys match the code format
UPDATE module_permissions SET module_key = 'all_requests' WHERE module_key = 'all-requests';
