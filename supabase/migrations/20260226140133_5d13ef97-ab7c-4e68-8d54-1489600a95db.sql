
-- جدول المحادثات
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL,
  technician_id uuid REFERENCES public.technicians(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول الرسائل
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'technician', 'system')),
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  file_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- فهارس
CREATE INDEX idx_chat_conversations_customer ON public.chat_conversations(customer_id);
CREATE INDEX idx_chat_conversations_technician ON public.chat_conversations(technician_id);
CREATE INDEX idx_chat_conversations_request ON public.chat_conversations(request_id);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);

-- RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- سياسات المحادثات
CREATE POLICY "Users can view their conversations" ON public.chat_conversations
  FOR SELECT USING (
    auth.uid() = customer_id 
    OR auth.uid() IN (
      SELECT tp.user_id FROM technician_profiles tp 
      JOIN technicians t ON t.technician_profile_id = tp.id 
      WHERE t.id = technician_id
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Customers can create conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Participants can update conversations" ON public.chat_conversations
  FOR UPDATE USING (
    auth.uid() = customer_id 
    OR auth.uid() IN (
      SELECT tp.user_id FROM technician_profiles tp 
      JOIN technicians t ON t.technician_profile_id = tp.id 
      WHERE t.id = technician_id
    )
  );

-- سياسات الرسائل
CREATE POLICY "Participants can view messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c 
      WHERE c.id = conversation_id 
      AND (
        c.customer_id = auth.uid() 
        OR auth.uid() IN (
          SELECT tp.user_id FROM technician_profiles tp 
          JOIN technicians t ON t.technician_profile_id = tp.id 
          WHERE t.id = c.technician_id
        )
        OR public.has_role(auth.uid(), 'admin')
      )
    )
  );

CREATE POLICY "Participants can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chat_conversations c 
      WHERE c.id = conversation_id 
      AND (
        c.customer_id = auth.uid() 
        OR auth.uid() IN (
          SELECT tp.user_id FROM technician_profiles tp 
          JOIN technicians t ON t.technician_profile_id = tp.id 
          WHERE t.id = c.technician_id
        )
      )
    )
  );

CREATE POLICY "Participants can mark messages read" ON public.chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c 
      WHERE c.id = conversation_id 
      AND (
        c.customer_id = auth.uid() 
        OR auth.uid() IN (
          SELECT tp.user_id FROM technician_profiles tp 
          JOIN technicians t ON t.technician_profile_id = tp.id 
          WHERE t.id = c.technician_id
        )
      )
    )
  );

-- تحديث last_message_at تلقائيا
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE chat_conversations 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_conversation_last_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- تفعيل Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
