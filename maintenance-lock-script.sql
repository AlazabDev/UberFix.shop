-- ════════════════════════════════════════════════════════════════════════════════
-- LOCK REPORT – production – 2025-01-12 08:27 UTC
-- ════════════════════════════════════════════════════════════════════════════════

-- 📋 MAINTENANCE LOCK ACTIVATION SCRIPT
-- Environment: production
-- Expected Duration: 60 minutes
-- Executed by: System Administrator

-- ════════════════════════════════════════════════════════════════════════════════
-- STEP 1: VERIFY TABLE EXISTS
-- ════════════════════════════════════════════════════════════════════════════════

SELECT 
  id, 
  is_locked, 
  message, 
  updated_at 
FROM public.app_control 
WHERE id = 'global';

-- Expected: Row exists with is_locked = false

-- ════════════════════════════════════════════════════════════════════════════════
-- STEP 2: ACTIVATE MAINTENANCE LOCK
-- ════════════════════════════════════════════════════════════════════════════════

UPDATE public.app_control
SET 
  is_locked = true,
  message = 'نقوم الآن بصيانة مجدولة لتحسين أداء النظام. ستعود الخدمة خلال 60 دقيقة بإذن الله. لأي طارئ: 0227047955 أو admin@alazab.online',
  updated_at = NOW()
WHERE id = 'global'
RETURNING id, is_locked, message, updated_at;

-- Expected: is_locked = true with the maintenance message

-- ════════════════════════════════════════════════════════════════════════════════
-- STEP 3: VERIFY LOCK IS ACTIVE
-- ════════════════════════════════════════════════════════════════════════════════

SELECT 
  id,
  is_locked,
  message,
  updated_at,
  CASE 
    WHEN is_locked = true THEN '✅ SYSTEM LOCKED'
    ELSE '❌ SYSTEM NOT LOCKED'
  END as status
FROM public.app_control 
WHERE id = 'global';

-- ════════════════════════════════════════════════════════════════════════════════
-- UNLOCK SCRIPT (TO BE EXECUTED WHEN MAINTENANCE IS COMPLETE)
-- ════════════════════════════════════════════════════════════════════════════════
/*
UPDATE public.app_control
SET 
  is_locked = false,
  message = NULL,
  updated_at = NOW()
WHERE id = 'global'
RETURNING id, is_locked, updated_at;
*/

-- ════════════════════════════════════════════════════════════════════════════════
-- EMERGENCY CONTACTS
-- ════════════════════════════════════════════════════════════════════════════════
-- Phone: 0227047955
-- Email: admin@alazab.online
-- ════════════════════════════════════════════════════════════════════════════════
