-- ============================================
-- إضافة الأدوار المفقودة إلى enum app_role
-- ============================================

-- إضافة owner و finance إلى enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';