-- =====================================================
-- ملف البيانات التجريبية لنظام UberFix
-- =====================================================
-- يمكن تنفيذ هذا الملف عبر SQL Editor في Supabase

-- =====================================================
-- 1. إضافة عقارات تجريبية
-- =====================================================
INSERT INTO properties (
  name, code, address, type, area, floors, rooms, bathrooms, parking_spaces,
  city_id, district_id, latitude, longitude, manager_id,
  status, description, amenities, value
) VALUES
  (
    'برج السلام التجاري', 
    'PROP-' || substr(md5(random()::text), 1, 8),
    'شارع التحرير، وسط البلد',
    'تجاري', 
    2500.00, 
    15, 
    45, 
    12, 
    30,
    1, 
    1, 
    30.0444, 
    31.2357, 
    (SELECT id FROM profiles LIMIT 1),
    'نشط', 
    'برج تجاري حديث في قلب القاهرة بمساحات مكتبية متنوعة',
    ARRAY['مصعد', 'أمن', 'موقف سيارات', 'إنترنت'], 
    15000000.00
  ),
  (
    'مجمع الأندلس السكني', 
    'PROP-' || substr(md5(random()::text), 1, 8),
    'شارع الهرم، الجيزة',
    'سكني', 
    5000.00, 
    8, 
    96, 
    96, 
    100,
    2, 
    5, 
    30.0131, 
    31.2089, 
    (SELECT id FROM profiles LIMIT 1),
    'نشط', 
    'مجمع سكني راقي يحتوي على وحدات سكنية فاخرة',
    ARRAY['حمام سباحة', 'نادي رياضي', 'حديقة', 'أمن', 'مصعد'], 
    25000000.00
  ),
  (
    'مول النخيل التجاري', 
    'PROP-' || substr(md5(random()::text), 1, 8),
    'طريق الإسكندرية الصحراوي',
    'تجاري', 
    8000.00, 
    4, 
    120, 
    30, 
    200,
    1, 
    2, 
    30.0626, 
    31.2497, 
    (SELECT id FROM profiles LIMIT 1),
    'نشط', 
    'مول تجاري ضخم يضم محلات ومطاعم ومراكز ترفيهية',
    ARRAY['مطاعم', 'سينما', 'موقف سيارات', 'مصاعد', 'تكييف مركزي'], 
    50000000.00
  ),
  (
    'فيلا الياسمين', 
    'PROP-' || substr(md5(random()::text), 1, 8),
    'التجمع الخامس، القاهرة الجديدة',
    'سكني', 
    450.00, 
    2, 
    6, 
    4, 
    4,
    1, 
    3, 
    30.0272, 
    31.4296, 
    (SELECT id FROM profiles LIMIT 1),
    'نشط', 
    'فيلا فاخرة مستقلة في منطقة راقية',
    ARRAY['حديقة', 'موقف خاص', 'نظام أمني', 'مسبح خاص'], 
    8000000.00
  ),
  (
    'العمارة السكنية المدينة', 
    'PROP-' || substr(md5(random()::text), 1, 8),
    'مدينة نصر، القاهرة',
    'سكني', 
    1200.00, 
    6, 
    24, 
    24, 
    12,
    1, 
    4, 
    30.0594, 
    31.3379, 
    (SELECT id FROM profiles LIMIT 1),
    'نشط', 
    'عمارة سكنية في موقع حيوي بمدينة نصر',
    ARRAY['مصعد', 'أمن', 'موقف سيارات'], 
    6000000.00
  );

-- =====================================================
-- 2. إضافة موردين تجريبيين
-- =====================================================
INSERT INTO vendors (
  name, 
  company_name, 
  email, 
  phone, 
  specialization, 
  rating, 
  status, 
  address, 
  experience_years, 
  unit_rate, 
  total_jobs,
  current_latitude, 
  current_longitude, 
  is_tracking_enabled
) VALUES
  (
    'أحمد محمود', 
    'شركة الصيانة المتكاملة', 
    'ahmed.mahmoud' || substr(md5(random()::text), 1, 4) || '@maintenance.com', 
    '01234567890',
    ARRAY['كهرباء', 'سباكة', 'نجارة'], 
    4.8,
    'نشط', 
    'مدينة نصر، القاهرة', 
    10, 
    150.00, 
    45,
    30.0594, 
    31.3379, 
    true
  ),
  (
    'محمد السيد', 
    'الكهربائي المحترف', 
    'mohamed.elsayed' || substr(md5(random()::text), 1, 4) || '@electrician.com', 
    '01098765432',
    ARRAY['كهرباء', 'إضاءة'], 
    4.6,
    'نشط', 
    'مصر الجديدة، القاهرة', 
    8, 
    120.00, 
    32,
    30.0881, 
    31.3310, 
    true
  ),
  (
    'خالد حسن', 
    'السباك الماهر', 
    'khaled.hassan' || substr(md5(random()::text), 1, 4) || '@plumber.com', 
    '01123456789',
    ARRAY['سباكة', 'صرف صحي'], 
    4.9,
    'نشط', 
    'المعادي، القاهرة', 
    15, 
    180.00, 
    67,
    29.9602, 
    31.2576, 
    true
  ),
  (
    'عمر فتحي', 
    'شركة النظافة الذهبية', 
    'omar.fathy' || substr(md5(random()::text), 1, 4) || '@cleaning.com', 
    '01198765432',
    ARRAY['تنظيف', 'تعقيم'], 
    4.7,
    'نشط', 
    'الدقي، الجيزة', 
    6, 
    80.00, 
    28,
    30.0385, 
    31.2121, 
    false
  ),
  (
    'ياسر علي', 
    'مكافحة الآفات المتقدمة', 
    'yasser.ali' || substr(md5(random()::text), 1, 4) || '@pest.com', 
    '01156789012',
    ARRAY['مكافحة حشرات', 'تطهير'], 
    4.5,
    'نشط', 
    'الهرم، الجيزة', 
    12, 
    200.00, 
    51,
    30.0131, 
    31.2089, 
    true
  ),
  (
    'طارق عبدالله', 
    'فني التكييفات', 
    'tarek.abdullah' || substr(md5(random()::text), 1, 4) || '@ac.com', 
    '01187654321',
    ARRAY['تكييف', 'تبريد'], 
    4.8,
    'نشط', 
    'التجمع الخامس', 
    9, 
    160.00, 
    38,
    30.0272, 
    31.4296, 
    true
  ),
  (
    'حسام الدين', 
    'الدهان الماهر', 
    'hossam.eldin' || substr(md5(random()::text), 1, 4) || '@painter.com', 
    '01276543210',
    ARRAY['دهانات', 'ديكور'], 
    4.4,
    'نشط', 
    'المهندسين، الجيزة', 
    7, 
    100.00, 
    29,
    30.0626, 
    31.2001, 
    false
  );

-- =====================================================
-- 3. إضافة طلبات صيانة تجريبية
-- =====================================================
WITH 
  random_property AS (SELECT id FROM properties ORDER BY random() LIMIT 1),
  random_vendor AS (SELECT id FROM vendors ORDER BY random() LIMIT 1),
  random_category AS (SELECT id FROM categories ORDER BY random() LIMIT 1),
  random_user AS (SELECT id FROM profiles ORDER BY random() LIMIT 1),
  random_company AS (SELECT id FROM companies LIMIT 1),
  random_branch AS (SELECT id FROM branches ORDER BY random() LIMIT 1)
INSERT INTO maintenance_requests (
  title,
  description,
  status,
  priority,
  property_id,
  assigned_vendor_id,
  category_id,
  created_by,
  company_id,
  branch_id,
  client_name,
  client_phone,
  client_email,
  location,
  estimated_cost,
  workflow_stage,
  latitude,
  longitude
) 
SELECT 
  'تسريب مياه في الحمام',
  'يوجد تسريب شديد في أنابيب المياه بالحمام الرئيسي يحتاج إصلاح عاجل',
  'Open'::mr_status,
  'عاجل',
  (SELECT id FROM random_property),
  (SELECT id FROM random_vendor),
  (SELECT id FROM random_category),
  (SELECT id FROM random_user),
  (SELECT id FROM random_company),
  (SELECT id FROM random_branch),
  'محمد أحمد',
  '01234567890',
  'client1@example.com',
  'الشقة 501، الدور الخامس',
  500.00,
  'submitted',
  30.0444,
  31.2357
UNION ALL
SELECT 
  'عطل في التكييف المركزي',
  'التكييف المركزي في المكاتب لا يعمل بكفاءة ويحتاج صيانة',
  'Assigned'::mr_status,
  'متوسط',
  (SELECT id FROM properties ORDER BY random() LIMIT 1),
  (SELECT id FROM vendors WHERE 'تكييف' = ANY(specialization) ORDER BY random() LIMIT 1),
  (SELECT id FROM categories ORDER BY random() LIMIT 1),
  (SELECT id FROM random_user),
  (SELECT id FROM random_company),
  (SELECT id FROM random_branch),
  'أحمد حسن',
  '01098765432',
  'client2@example.com',
  'المكتب 302، الدور الثالث',
  800.00,
  'assigned',
  30.0626,
  31.2497
UNION ALL
SELECT 
  'كسر في زجاج النافذة',
  'زجاج النافذة الأمامية مكسور ويحتاج استبدال فوري',
  'In_Progress'::mr_status,
  'عادي',
  (SELECT id FROM properties ORDER BY random() LIMIT 1),
  (SELECT id FROM random_vendor),
  (SELECT id FROM random_category),
  (SELECT id FROM random_user),
  (SELECT id FROM random_company),
  (SELECT id FROM random_branch),
  'سارة محمود',
  '01123456789',
  'client3@example.com',
  'الشقة 204',
  300.00,
  'in_progress',
  30.0131,
  31.2089
UNION ALL
SELECT 
  'صيانة دورية للمصاعد',
  'صيانة شهرية روتينية لجميع المصاعد في المبنى',
  'Pending_Approval'::mr_status,
  'عادي',
  (SELECT id FROM properties ORDER BY random() LIMIT 1),
  NULL,
  (SELECT id FROM random_category),
  (SELECT id FROM random_user),
  (SELECT id FROM random_company),
  (SELECT id FROM random_branch),
  'إدارة المبنى',
  '01198765432',
  'building@example.com',
  'جميع المصاعد',
  1200.00,
  'draft',
  30.0594,
  31.3379
UNION ALL
SELECT 
  'تنظيف شامل للمبنى',
  'تنظيف شامل للمبنى قبل افتتاح المكاتب الجديدة',
  'Open'::mr_status,
  'متوسط',
  (SELECT id FROM properties ORDER BY random() LIMIT 1),
  (SELECT id FROM vendors WHERE 'تنظيف' = ANY(specialization) ORDER BY random() LIMIT 1),
  (SELECT id FROM categories WHERE name LIKE '%نظافة%' LIMIT 1),
  (SELECT id FROM random_user),
  (SELECT id FROM random_company),
  (SELECT id FROM random_branch),
  'مدير المشروع',
  '01156789012',
  'manager@example.com',
  'جميع الطوابق',
  2000.00,
  'submitted',
  30.0272,
  31.4296;

-- =====================================================
-- 4. إضافة مواعيد تجريبية
-- =====================================================
WITH 
  random_property AS (SELECT id FROM properties ORDER BY random() LIMIT 1),
  random_vendor AS (SELECT id FROM vendors ORDER BY random() LIMIT 1),
  random_request AS (SELECT id FROM maintenance_requests ORDER BY random() LIMIT 1),
  random_user AS (SELECT id FROM profiles ORDER BY random() LIMIT 1)
INSERT INTO appointments (
  title,
  description,
  appointment_date,
  appointment_time,
  duration_minutes,
  status,
  customer_name,
  customer_phone,
  customer_email,
  location,
  property_id,
  vendor_id,
  maintenance_request_id,
  created_by
)
SELECT 
  'معاينة موقع التسريب',
  'زيارة للمعاينة وتقدير تكلفة الإصلاح',
  CURRENT_DATE + INTERVAL '2 days',
  '10:00:00',
  60,
  'scheduled',
  'محمد أحمد',
  '01234567890',
  'client1@example.com',
  'الشقة 501، الدور الخامس',
  (SELECT id FROM random_property),
  (SELECT id FROM random_vendor),
  (SELECT id FROM random_request),
  (SELECT id FROM random_user)
UNION ALL
SELECT 
  'صيانة التكييف',
  'موعد الصيانة الدورية للتكييف المركزي',
  CURRENT_DATE + INTERVAL '1 day',
  '14:00:00',
  120,
  'confirmed',
  'أحمد حسن',
  '01098765432',
  'client2@example.com',
  'المكتب 302',
  (SELECT id FROM properties ORDER BY random() LIMIT 1),
  (SELECT id FROM vendors WHERE 'تكييف' = ANY(specialization) ORDER BY random() LIMIT 1),
  (SELECT id FROM maintenance_requests ORDER BY random() LIMIT 1),
  (SELECT id FROM random_user)
UNION ALL
SELECT 
  'تركيب زجاج جديد',
  'موعد تركيب الزجاج الجديد للنافذة',
  CURRENT_DATE + INTERVAL '3 days',
  '09:00:00',
  90,
  'scheduled',
  'سارة محمود',
  '01123456789',
  'client3@example.com',
  'الشقة 204',
  (SELECT id FROM properties ORDER BY random() LIMIT 1),
  (SELECT id FROM random_vendor),
  (SELECT id FROM maintenance_requests ORDER BY random() LIMIT 1),
  (SELECT id FROM random_user);

-- =====================================================
-- 5. إضافة مصروفات تجريبية
-- =====================================================
WITH 
  random_request AS (SELECT id FROM maintenance_requests ORDER BY random() LIMIT 1),
  random_user AS (SELECT id FROM profiles ORDER BY random() LIMIT 1)
INSERT INTO expenses (
  category,
  description,
  amount,
  expense_date,
  maintenance_request_id,
  created_by
)
SELECT 
  'مواد',
  'أنابيب وخراطيم للسباكة',
  250.00,
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  (SELECT id FROM random_request),
  (SELECT id FROM random_user)
UNION ALL
SELECT 
  'أجور',
  'أجور فريق التنظيف',
  800.00,
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  (SELECT id FROM maintenance_requests ORDER BY random() LIMIT 1),
  (SELECT id FROM random_user)
UNION ALL
SELECT 
  'معدات',
  'معدات صيانة التكييف',
  450.00,
  CURRENT_TIMESTAMP,
  (SELECT id FROM maintenance_requests ORDER BY random() LIMIT 1),
  (SELECT id FROM random_user);

-- =====================================================
-- تأكيد النجاح
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ تم إضافة البيانات التجريبية بنجاح!';
  RAISE NOTICE '📊 العقارات: % سجل', (SELECT COUNT(*) FROM properties);
  RAISE NOTICE '👷 الموردين: % سجل', (SELECT COUNT(*) FROM vendors);
  RAISE NOTICE '🔧 طلبات الصيانة: % سجل', (SELECT COUNT(*) FROM maintenance_requests);
  RAISE NOTICE '📅 المواعيد: % سجل', (SELECT COUNT(*) FROM appointments);
  RAISE NOTICE '💰 المصروفات: % سجل', (SELECT COUNT(*) FROM expenses);
END $$;
