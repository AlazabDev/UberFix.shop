-- حذف الجداول الفارغة وغير المستخدمة في الكود
-- نبدأ بإلغاء الـ Foreign Keys أولاً

-- 1. حذف جداول التدقيق الفارغة (Audit tables)
DROP TABLE IF EXISTS maintenance_requests_public_audit CASCADE;
DROP TABLE IF EXISTS properties_audit CASCADE;
DROP TABLE IF EXISTS maintenance_requests_audit CASCADE;

-- 2. حذف جداول الفني غير المستخدمة والفارغة
DROP TABLE IF EXISTS technician_complaints CASCADE;
DROP TABLE IF EXISTS technician_level_history CASCADE;
DROP TABLE IF EXISTS technician_portfolio CASCADE;
DROP TABLE IF EXISTS technician_work_zones CASCADE;

-- 3. حذف جداول الخدمات غير المستخدمة
DROP TABLE IF EXISTS service_addons CASCADE;
DROP TABLE IF EXISTS service_orders CASCADE;
DROP TABLE IF EXISTS service_packages CASCADE;
DROP TABLE IF EXISTS service_prices CASCADE;

-- 4. حذف جداول أخرى غير مستخدمة
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS regions CASCADE;

-- ملاحظة: نحتفظ بـ sla_policies لأنها مستخدمة في database function calculate_sla_deadlines