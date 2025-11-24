-- إزالة الـ policy الخاطئة التي أظهرت جميع العقارات للجميع
DROP POLICY IF EXISTS "public_read_properties_for_qr" ON properties;

-- التأكد من أن المستخدمين يرون فقط عقاراتهم الخاصة
-- هذه الـ policies الموجودة بالفعل ستضمن الأمان:
-- 1. users_view_own_properties: المستخدم يرى العقارات التي أنشأها أو يديرها
-- 2. properties_staff_select: الموظفون يرون جميع العقارات

-- لا حاجة لإضافة policies جديدة، الموجودة كافية
-- سنستخدم edge function للـ QR requests بدلاً من public policy