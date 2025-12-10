-- إضافة بيانات تجريبية سريعة

-- 1. أيقونات التخصص
INSERT INTO specialization_icons (name, name_ar, icon_path, color, is_active)
SELECT * FROM (VALUES
  ('electrical', 'كهرباء', '/icons/electrical.svg', '#FFD700', true),
  ('plumbing', 'سباكة', '/icons/plumbing.svg', '#1E90FF', true),
  ('hvac', 'تكييف', '/icons/hvac.svg', '#00CED1', true)
) AS v(name, name_ar, icon_path, color, is_active)
WHERE NOT EXISTS (SELECT 1 FROM specialization_icons WHERE name = v.name);

-- 2. قاعة الشرف
INSERT INTO hall_of_excellence (technician_id, achievement_title, achievement_type, achievement_date, achievement_description, is_featured)
SELECT t.id, 'فني متميز', 'monthly', CURRENT_DATE - 30, 'إنجاز متميز في خدمة العملاء', true
FROM technicians t WHERE t.is_active = true LIMIT 5;

-- 3. جوائز شهرية
INSERT INTO monthly_excellence_awards (technician_id, award_month, award_type, reward_value)
SELECT t.id, DATE_TRUNC('month', CURRENT_DATE)::date, 'gold', 1000
FROM technicians t WHERE t.is_active = true LIMIT 3;

-- 4. بطل العام
INSERT INTO annual_grand_winners (technician_id, award_year, story)
SELECT t.id, 2024, 'فني العام المتميز'
FROM technicians t WHERE t.is_active = true AND t.rating >= 4.0 LIMIT 1;

-- 5. طلبات صيانة تجريبية
INSERT INTO maintenance_requests (company_id, branch_id, title, priority, status, client_name, client_phone)
SELECT c.id, b.id, 'طلب صيانة تجريبي', 'medium', 'Open'::mr_status, 'عميل تجريبي', '+201000000000'
FROM companies c JOIN branches b ON b.company_id = c.id LIMIT 5;

-- 6. تحديث app_settings
UPDATE app_settings SET app_name = 'UberFix.shop', company_email = 'support@uberfix.shop', updated_at = NOW() WHERE id IS NOT NULL;