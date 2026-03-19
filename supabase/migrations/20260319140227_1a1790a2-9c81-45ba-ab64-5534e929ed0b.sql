
-- ═══════════════════════════════════════════════════════
-- 1. API Consumers Table - لإدارة مفاتيح API للمواقع الخارجية
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.api_consumers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                          -- اسم الموقع/التطبيق
  api_key TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  channel TEXT NOT NULL DEFAULT 'api',         -- القناة المرتبطة
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 30,
  allowed_origins TEXT[] DEFAULT '{}',         -- النطاقات المسموح بها (CORS)
  company_id UUID REFERENCES public.companies(id),
  branch_id UUID REFERENCES public.branches(id),
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  total_requests BIGINT NOT NULL DEFAULT 0
);

-- تفعيل RLS
ALTER TABLE public.api_consumers ENABLE ROW LEVEL SECURITY;

-- فقط المالكين والمديرين يمكنهم إدارة مفاتيح API
CREATE POLICY "api_consumers_deny_anon" ON public.api_consumers
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "api_consumers_owner_admin_all" ON public.api_consumers
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'owner') OR
    public.is_owner_email()
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'owner') OR
    public.is_owner_email()
  );

-- Trigger لتحديث updated_at
CREATE TRIGGER update_api_consumers_updated_at
  BEFORE UPDATE ON public.api_consumers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index للبحث السريع بالمفتاح
CREATE INDEX idx_api_consumers_api_key ON public.api_consumers(api_key) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════
-- 2. إصلاح Views المكشوفة - تحويلها إلى SECURITY INVOKER
-- ═══════════════════════════════════════════════════════

-- إصلاح profile views
DO $$ BEGIN
  -- profiles_minimal_public
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'profiles_minimal_public') THEN
    DROP VIEW IF EXISTS public.profiles_minimal_public;
    CREATE VIEW public.profiles_minimal_public
    WITH (security_invoker = true)
    AS SELECT id, name, role FROM public.profiles;
  END IF;

  -- profiles_names_only
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'profiles_names_only') THEN
    DROP VIEW IF EXISTS public.profiles_names_only;
    CREATE VIEW public.profiles_names_only
    WITH (security_invoker = true)
    AS SELECT id, name, full_name FROM public.profiles;
  END IF;

  -- profiles_public_safe
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'profiles_public_safe') THEN
    DROP VIEW IF EXISTS public.profiles_public_safe;
    CREATE VIEW public.profiles_public_safe
    WITH (security_invoker = true)
    AS SELECT id, name, full_name, role, avatar_url, company_id FROM public.profiles;
  END IF;

  -- profiles_safe
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'profiles_safe') THEN
    DROP VIEW IF EXISTS public.profiles_safe;
    CREATE VIEW public.profiles_safe
    WITH (security_invoker = true)
    AS SELECT id, name, full_name, email, role, avatar_url, company_id, created_at, updated_at FROM public.profiles;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════
-- 3. إصلاح wa_template_events - منع الإدراج المجهول
-- ═══════════════════════════════════════════════════════

DO $$ BEGIN
  -- حذف السياسة القديمة إن وجدت
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wa_template_events' AND policyname LIKE '%insert%'
  ) THEN
    DROP POLICY IF EXISTS "wa_template_events_insert" ON public.wa_template_events;
    DROP POLICY IF EXISTS "Users can insert events for their tenant templates" ON public.wa_template_events;
  END IF;
END $$;

-- سياسة إدراج جديدة للمصادقين فقط
CREATE POLICY "wa_template_events_insert_authenticated"
  ON public.wa_template_events
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- إضافة سياسة RESTRICTIVE لمنع المجهولين
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wa_template_events' AND policyname = 'wa_template_events_deny_anon'
  ) THEN
    CREATE POLICY "wa_template_events_deny_anon"
      ON public.wa_template_events
      AS RESTRICTIVE FOR ALL TO anon USING (false);
  END IF;
END $$;
