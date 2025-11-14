-- ===================================================================
-- حذف الجداول غير المستخدمة لتحسين الأداء (34 جدول)
-- ===================================================================

DROP TABLE IF EXISTS public.quick_maintenance_requests CASCADE;
DROP TABLE IF EXISTS public.request_attachments CASCADE;
DROP TABLE IF EXISTS public.request_events CASCADE;
DROP TABLE IF EXISTS public.request_lines CASCADE;
DROP TABLE IF EXISTS public.request_reviews CASCADE;
DROP TABLE IF EXISTS public.request_status_history CASCADE;
DROP TABLE IF EXISTS public.service_checklists CASCADE;
DROP TABLE IF EXISTS public.service_price_tiers CASCADE;
DROP TABLE IF EXISTS public.technician_applications CASCADE;
DROP TABLE IF EXISTS public.technician_centers CASCADE;
DROP TABLE IF EXISTS public.technician_documents CASCADE;
DROP TABLE IF EXISTS public.technician_locations CASCADE;
DROP TABLE IF EXISTS public.technician_progress CASCADE;
DROP TABLE IF EXISTS public.technician_regions CASCADE;
DROP TABLE IF EXISTS public.technician_reviews CASCADE;
DROP TABLE IF EXISTS public.technician_tasks CASCADE;
DROP TABLE IF EXISTS public.units CASCADE;
DROP TABLE IF EXISTS public.vendor_location_history CASCADE;
DROP TABLE IF EXISTS public.work_tasks CASCADE;
DROP TABLE IF EXISTS public.map_locations CASCADE;
DROP TABLE IF EXISTS public.map_markers CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.project_phases CASCADE;
DROP TABLE IF EXISTS public.project_tasks CASCADE;
DROP TABLE IF EXISTS public.project_updates CASCADE;
DROP TABLE IF EXISTS public.project_views CASCADE;
DROP TABLE IF EXISTS public.app_control_history CASCADE;
DROP TABLE IF EXISTS public.service_categories CASCADE;
DROP TABLE IF EXISTS public.service_subcategories CASCADE;
DROP TABLE IF EXISTS public.service_icons CASCADE;
DROP TABLE IF EXISTS public.subcategories CASCADE;
DROP TABLE IF EXISTS public.status_defs CASCADE;
DROP TABLE IF EXISTS public.status_transitions CASCADE;