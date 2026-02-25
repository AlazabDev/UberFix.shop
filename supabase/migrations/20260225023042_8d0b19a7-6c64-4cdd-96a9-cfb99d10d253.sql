
-- إضافة الأعمدة المفقودة إذا كان الجدول موجوداً
DO $$
BEGIN
  -- تحقق إذا الجدول موجود
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wa_conversations' AND table_schema = 'public') THEN
    -- إضافة أعمدة إذا لم تكن موجودة
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wa_conversations' AND column_name = 'conversation_state') THEN
      ALTER TABLE public.wa_conversations ADD COLUMN conversation_state TEXT NOT NULL DEFAULT 'idle';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wa_conversations' AND column_name = 'collected_data') THEN
      ALTER TABLE public.wa_conversations ADD COLUMN collected_data JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wa_conversations' AND column_name = 'messages_history') THEN
      ALTER TABLE public.wa_conversations ADD COLUMN messages_history JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wa_conversations' AND column_name = 'current_request_id') THEN
      ALTER TABLE public.wa_conversations ADD COLUMN current_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wa_conversations' AND column_name = 'sender_name') THEN
      ALTER TABLE public.wa_conversations ADD COLUMN sender_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wa_conversations' AND column_name = 'last_message_at') THEN
      ALTER TABLE public.wa_conversations ADD COLUMN last_message_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
  ELSE
    -- إنشاء الجدول
    CREATE TABLE public.wa_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone_number TEXT NOT NULL UNIQUE,
      sender_name TEXT,
      conversation_state TEXT NOT NULL DEFAULT 'idle',
      current_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
      collected_data JSONB DEFAULT '{}'::jsonb,
      messages_history JSONB DEFAULT '[]'::jsonb,
      last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE public.wa_conversations ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role only wa_conversations" ON public.wa_conversations FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;
