
-- UFBot Knowledge Base: training files
CREATE TABLE public.ufbot_knowledge_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'text',
  text_content TEXT,
  file_size INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UFBot Knowledge Base: manual Q&A entries
CREATE TABLE public.ufbot_knowledge_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'general',
  question TEXT,
  answer TEXT NOT NULL,
  keywords TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UFBot conversation logs
CREATE TABLE public.ufbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ufbot_knowledge_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ufbot_knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ufbot_conversations ENABLE ROW LEVEL SECURITY;

-- Knowledge files: admin only
CREATE POLICY "Admins manage knowledge files"
ON public.ufbot_knowledge_files FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager'));

-- Knowledge entries: admin only
CREATE POLICY "Admins manage knowledge entries"
ON public.ufbot_knowledge_entries FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager'));

-- Conversations: users see own, admins see all
CREATE POLICY "Users manage own conversations"
ON public.ufbot_conversations FOR ALL
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- Triggers
CREATE TRIGGER update_ufbot_knowledge_files_updated_at
BEFORE UPDATE ON public.ufbot_knowledge_files
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ufbot_knowledge_entries_updated_at
BEFORE UPDATE ON public.ufbot_knowledge_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ufbot_conversations_updated_at
BEFORE UPDATE ON public.ufbot_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for training files
INSERT INTO storage.buckets (id, name, public) VALUES ('ufbot-training', 'ufbot-training', false);

CREATE POLICY "Admins upload training files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ufbot-training' AND (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'manager'))
));

CREATE POLICY "Admins read training files"
ON storage.objects FOR SELECT
USING (bucket_id = 'ufbot-training' AND (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'manager'))
));

CREATE POLICY "Admins delete training files"
ON storage.objects FOR DELETE
USING (bucket_id = 'ufbot-training' AND (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'manager'))
));
