-- إنشاء جدول التحكم في قفل النظام
CREATE TABLE IF NOT EXISTS public.app_control (
  id TEXT PRIMARY KEY DEFAULT 'global',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.app_control ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للجميع
CREATE POLICY "app_control_select_all" ON public.app_control
  FOR SELECT USING (true);

-- سياسة الكتابة للـadmins فقط
CREATE POLICY "app_control_admin_only" ON public.app_control
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- إدراج السجل الافتراضي
INSERT INTO public.app_control (id, is_locked, message) 
VALUES ('global', false, NULL)
ON CONFLICT (id) DO NOTHING;