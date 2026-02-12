
-- WhatsApp Hub Schema

-- Projects table for multi-project support
CREATE TABLE IF NOT EXISTS public.wa_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- WhatsApp Numbers
CREATE TABLE IF NOT EXISTS public.wa_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.wa_projects(id) ON DELETE CASCADE NOT NULL,
  phone_number_id TEXT,
  display_number TEXT NOT NULL,
  waba_id TEXT,
  status TEXT DEFAULT 'active',
  number_type TEXT DEFAULT 'connected' CHECK (number_type IN ('connected','digital','sandbox')),
  activation_code TEXT,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts
CREATE TABLE IF NOT EXISTS public.wa_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.wa_projects(id) ON DELETE CASCADE NOT NULL,
  wa_id TEXT,
  phone TEXT NOT NULL,
  display_name TEXT,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations
CREATE TABLE IF NOT EXISTS public.wa_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.wa_projects(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.wa_contacts(id) ON DELETE CASCADE NOT NULL,
  phone_number_id TEXT,
  status TEXT DEFAULT 'active',
  assigned_to UUID REFERENCES auth.users(id),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.wa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.wa_projects(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.wa_conversations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.wa_contacts(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in','out')),
  msg_type TEXT DEFAULT 'text',
  body TEXT,
  media_id UUID,
  meta_message_id TEXT,
  status TEXT DEFAULT 'sent',
  phone TEXT,
  contact_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Media Files
CREATE TABLE IF NOT EXISTS public.wa_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.wa_projects(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES public.wa_messages(id) ON DELETE SET NULL,
  phone_number_id TEXT,
  filename TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  media_type TEXT DEFAULT 'image',
  storage_path TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Templates
CREATE TABLE IF NOT EXISTS public.wa_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.wa_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  language TEXT DEFAULT 'ar',
  category TEXT DEFAULT 'UTILITY',
  status TEXT DEFAULT 'APPROVED',
  meta_template_id TEXT,
  components_json JSONB,
  phone_number_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ
);

-- Flows
CREATE TABLE IF NOT EXISTS public.wa_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.wa_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  version INT DEFAULT 1,
  flow_json JSONB,
  meta_flow_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS public.wa_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.wa_projects(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- API Keys
CREATE TABLE IF NOT EXISTS public.wa_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.wa_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_wa_contacts_project ON public.wa_contacts(project_id, created_at DESC);
CREATE INDEX idx_wa_messages_project ON public.wa_messages(project_id, created_at DESC);
CREATE INDEX idx_wa_messages_conversation ON public.wa_messages(conversation_id, created_at DESC);
CREATE INDEX idx_wa_media_project ON public.wa_media(project_id, received_at DESC);
CREATE INDEX idx_wa_conversations_project ON public.wa_conversations(project_id, last_message_at DESC);

-- Enable RLS
ALTER TABLE public.wa_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies - authenticated users can access all (project-level filtering in app)
CREATE POLICY "Authenticated users can read wa_projects" ON public.wa_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert wa_projects" ON public.wa_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update wa_projects" ON public.wa_projects FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated read wa_numbers" ON public.wa_numbers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage wa_numbers" ON public.wa_numbers FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated read wa_contacts" ON public.wa_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage wa_contacts" ON public.wa_contacts FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated read wa_conversations" ON public.wa_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage wa_conversations" ON public.wa_conversations FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated read wa_messages" ON public.wa_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage wa_messages" ON public.wa_messages FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated read wa_media" ON public.wa_media FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage wa_media" ON public.wa_media FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated read wa_templates" ON public.wa_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage wa_templates" ON public.wa_templates FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated read wa_flows" ON public.wa_flows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage wa_flows" ON public.wa_flows FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated read wa_webhooks" ON public.wa_webhooks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage wa_webhooks" ON public.wa_webhooks FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated read wa_api_keys" ON public.wa_api_keys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage wa_api_keys" ON public.wa_api_keys FOR ALL TO authenticated USING (true);

-- Seed a default project
INSERT INTO public.wa_projects (name, slug) VALUES ('أوبر فيكس', 'uberfix');
