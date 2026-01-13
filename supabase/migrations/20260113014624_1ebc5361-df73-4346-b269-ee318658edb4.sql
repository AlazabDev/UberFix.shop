
-- =====================================================
-- CRITICAL FIX: admin@alazab.com has no role in user_roles
-- This is causing permission denied errors
-- =====================================================

-- Add admin role for the current admin user
INSERT INTO user_roles (user_id, role)
VALUES ('cb81e2cf-4652-40ab-9631-cd179d7639cc', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Also ensure staff roles for testing
INSERT INTO user_roles (user_id, role)
VALUES ('cb81e2cf-4652-40ab-9631-cd179d7639cc', 'staff')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
VALUES ('cb81e2cf-4652-40ab-9631-cd179d7639cc', 'manager')
ON CONFLICT (user_id, role) DO NOTHING;
