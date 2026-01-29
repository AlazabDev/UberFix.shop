
-- PART 2: message_logs and technician-related data

DO $$
DECLARE
  v_technician_id UUID;
  v_request_id UUID;
  v_auth_user_id UUID;
BEGIN
  SELECT id INTO v_technician_id FROM technicians LIMIT 1;
  SELECT id INTO v_request_id FROM maintenance_requests LIMIT 1;
  SELECT id INTO v_auth_user_id FROM auth.users LIMIT 1;

  -- message_logs
  INSERT INTO message_logs (recipient, message_type, message_content, provider, status, request_id)
  VALUES 
    ('+201234567890', 'sms', 'تم استلام طلب الصيانة رقم #001', 'twilio', 'delivered', v_request_id),
    ('+201234567891', 'whatsapp', 'مرحباً، سيصل الفني خلال ساعة', 'meta', 'sent', v_request_id),
    ('+201234567892', 'sms', 'تم إكمال طلب الصيانة بنجاح', 'twilio', 'delivered', v_request_id);

  -- reviews (customer_id references auth.users)
  IF v_request_id IS NOT NULL AND v_technician_id IS NOT NULL AND v_auth_user_id IS NOT NULL THEN
    INSERT INTO reviews (technician_id, customer_id, request_id, rating, comment)
    VALUES 
      (v_technician_id, v_auth_user_id, v_request_id, 5, 'خدمة ممتازة وسريعة'),
      (v_technician_id, v_auth_user_id, v_request_id, 4, 'عمل جيد ولكن تأخر قليلاً');
  END IF;

  -- technician_levels
  IF v_technician_id IS NOT NULL THEN
    INSERT INTO technician_levels (technician_id, current_level, level_updated_at, promotion_history)
    VALUES (v_technician_id, 'pro', NOW(), '[{"level": "technician", "date": "2025-01-01"}, {"level": "pro", "date": "2026-01-01"}]'::jsonb)
    ON CONFLICT (technician_id) DO NOTHING;
  END IF;

  -- technician_badges
  IF v_technician_id IS NOT NULL THEN
    INSERT INTO technician_badges (technician_id, badge_type, badge_title, badge_description, awarded_for, awarded_at)
    VALUES 
      (v_technician_id, 'gold_monthly', 'فني الشهر الذهبي', 'أفضل أداء شهري', 'التميز في يناير 2026', NOW()),
      (v_technician_id, 'crown_annual', 'التاج السنوي', 'أفضل فني للعام', 'التميز السنوي 2025', NOW()),
      (v_technician_id, 'legacy', 'إرث التميز', 'إنجازات استثنائية', 'خمس سنوات من التميز', NOW());
  END IF;

  -- technician_performance (scores max 9.99)
  IF v_technician_id IS NOT NULL THEN
    INSERT INTO technician_performance (technician_id, total_tasks, completed_tasks, cancelled_tasks, average_rating, punctuality_score, quality_score, professionalism_score, total_points, complaints_count, excellence_count, last_calculated_at)
    VALUES (v_technician_id, 50, 45, 2, 4.70, 9.25, 9.50, 9.00, 1500, 1, 5, NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  -- technician_daily_stats
  IF v_technician_id IS NOT NULL THEN
    INSERT INTO technician_daily_stats (technician_id, date, visits_assigned, visits_accepted, visits_rejected, visits_cancelled, visits_completed, total_earnings, average_rating, average_response_time, average_arrival_time, complaints_received)
    VALUES 
      (v_technician_id, '2026-01-28', 5, 4, 0, 1, 3, 750, 4.8, 15, 30, 0),
      (v_technician_id, '2026-01-27', 6, 5, 1, 0, 4, 1000, 4.6, 12, 25, 0),
      (v_technician_id, '2026-01-26', 3, 3, 0, 0, 2, 500, 5.0, 10, 20, 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- technician_wallet
  IF v_technician_id IS NOT NULL THEN
    INSERT INTO technician_wallet (technician_id, balance_current, balance_pending, balance_locked, total_earnings, total_withdrawn, minimum_withdrawal)
    VALUES (v_technician_id, 5000, 1500, 0, 25000, 20000, 100)
    ON CONFLICT DO NOTHING;
  END IF;

  -- technician_transactions
  IF v_technician_id IS NOT NULL THEN
    INSERT INTO technician_transactions (technician_id, request_id, transaction_type, amount, platform_fee, net_amount, description, status)
    VALUES 
      (v_technician_id, v_request_id, 'earning', 600, 60, 540, 'إكمال طلب صيانة', 'completed'),
      (v_technician_id, v_request_id, 'bonus', 200, 0, 200, 'مكافأة تقييم ممتاز', 'completed'),
      (v_technician_id, NULL, 'withdrawal', 2000, 0, 2000, 'سحب إلى المحفظة', 'completed');
  END IF;

  -- push_subscriptions (user_id references auth.users)
  IF v_auth_user_id IS NOT NULL THEN
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key)
    VALUES (v_auth_user_id, 'https://fcm.googleapis.com/fcm/send/example-endpoint-123', 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM', 'tBHItJI5svbpez7KI4CCXg')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;
