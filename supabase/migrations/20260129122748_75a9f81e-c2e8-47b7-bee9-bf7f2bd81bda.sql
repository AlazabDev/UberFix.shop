
-- PART 1: Basic test data (no foreign key dependencies on auth.users)

-- 1. consultation_bookings
INSERT INTO consultation_bookings (full_name, email, phone, service_type, preferred_date, preferred_time, message, status)
VALUES 
  ('أحمد محمد علي', 'ahmed@example.com', '+201234567890', 'plumbing', '2026-02-01', '10:00', 'أحتاج استشارة حول تجديد السباكة', 'pending'),
  ('سارة أحمد', 'sara@example.com', '+201234567891', 'electrical', '2026-02-02', '14:00', 'مشكلة في الكهرباء', 'confirmed'),
  ('محمود حسن', 'mahmoud@example.com', '+201234567892', 'ac_maintenance', '2026-02-03', '09:00', 'صيانة تكييف مركزي', 'completed');
