-- =====================================================
-- WhatsApp Templates Management System - Schema
-- =====================================================

-- Template status enum
CREATE TYPE wa_template_status AS ENUM (
  'draft',
  'submitted',
  'pending',
  'approved',
  'rejected',
  'paused',
  'disabled',
  'deleted'
);

-- Template category enum
CREATE TYPE wa_template_category AS ENUM (
  'utility',
  'marketing',
  'authentication'
);

-- Template quality level enum
CREATE TYPE wa_template_quality AS ENUM (
  'unknown',
  'high',
  'medium',
  'low'
);

-- =====================================================
-- Main Templates Table
-- =====================================================
CREATE TABLE public.wa_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Multi-tenant isolation
  tenant_id UUID NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  
  -- Meta identifiers (null until submitted)
  meta_template_id TEXT,
  meta_template_name TEXT,
  
  -- Core template info
  name TEXT NOT NULL,
  category wa_template_category NOT NULL DEFAULT 'utility',
  language TEXT NOT NULL DEFAULT 'ar',
  
  -- Status & Quality
  status wa_template_status NOT NULL DEFAULT 'draft',
  quality wa_template_quality DEFAULT 'unknown',
  rejection_reason TEXT,
  quality_reason TEXT,
  
  -- Template components (JSON structure)
  header_type TEXT CHECK (header_type IN ('text', 'image', 'video', 'document', 'none')),
  header_content TEXT,
  header_media_url TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]'::jsonb,
  
  -- Full component structure for Meta API
  components JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  version INTEGER NOT NULL DEFAULT 1,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_template_per_tenant UNIQUE (tenant_id, name, language),
  CONSTRAINT valid_body CHECK (length(body_text) > 0 AND length(body_text) <= 1024)
);

-- Indexes for performance
CREATE INDEX idx_wa_templates_tenant ON public.wa_templates(tenant_id);
CREATE INDEX idx_wa_templates_status ON public.wa_templates(status);
CREATE INDEX idx_wa_templates_category ON public.wa_templates(category);
CREATE INDEX idx_wa_templates_name ON public.wa_templates(name);
CREATE INDEX idx_wa_templates_meta_id ON public.wa_templates(meta_template_id);
CREATE INDEX idx_wa_templates_updated ON public.wa_templates(updated_at DESC);

-- =====================================================
-- Template Events / Audit Log Table
-- =====================================================
CREATE TABLE public.wa_template_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- References
  template_id UUID NOT NULL REFERENCES public.wa_templates(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  
  -- Event details
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL DEFAULT 'user', -- 'user', 'meta_webhook', 'system'
  
  -- State changes
  old_status wa_template_status,
  new_status wa_template_status,
  old_quality wa_template_quality,
  new_quality wa_template_quality,
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  correlation_id TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for audit queries
CREATE INDEX idx_wa_template_events_template ON public.wa_template_events(template_id);
CREATE INDEX idx_wa_template_events_tenant ON public.wa_template_events(tenant_id);
CREATE INDEX idx_wa_template_events_type ON public.wa_template_events(event_type);
CREATE INDEX idx_wa_template_events_created ON public.wa_template_events(created_at DESC);
CREATE INDEX idx_wa_template_events_correlation ON public.wa_template_events(correlation_id);

-- =====================================================
-- Enable RLS
-- =====================================================
ALTER TABLE public.wa_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_template_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for wa_templates
-- =====================================================

-- Users can view templates in their tenant
CREATE POLICY "Users can view own tenant templates"
  ON public.wa_templates
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
    )
  );

-- Users with manager/admin role can create templates
CREATE POLICY "Managers can create templates"
  ON public.wa_templates
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT p.company_id FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'manager', 'owner')
    )
  );

-- Managers can update non-locked templates
CREATE POLICY "Managers can update templates"
  ON public.wa_templates
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT p.company_id FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'manager', 'owner')
    )
  );

-- Only admins can delete templates
CREATE POLICY "Admins can delete templates"
  ON public.wa_templates
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT p.company_id FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'owner')
    )
  );

-- =====================================================
-- RLS Policies for wa_template_events
-- =====================================================

-- Users can view events in their tenant
CREATE POLICY "Users can view own tenant events"
  ON public.wa_template_events
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
    )
  );

-- System/Managers can insert events
CREATE POLICY "Managers can insert events"
  ON public.wa_template_events
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT p.company_id FROM profiles p 
      WHERE p.id = auth.uid()
    )
    OR actor_id IS NULL -- Allow system/webhook inserts
  );

-- =====================================================
-- Trigger for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_wa_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER wa_templates_updated_at
  BEFORE UPDATE ON public.wa_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_wa_templates_updated_at();

-- =====================================================
-- Function to log template events automatically
-- =====================================================
CREATE OR REPLACE FUNCTION log_wa_template_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.wa_template_events (
      template_id,
      tenant_id,
      actor_id,
      event_type,
      event_source,
      old_status,
      new_status,
      metadata
    ) VALUES (
      NEW.id,
      NEW.tenant_id,
      auth.uid(),
      'status_change',
      'user',
      OLD.status,
      NEW.status,
      jsonb_build_object('trigger', 'auto')
    );
  END IF;
  
  -- Log quality changes
  IF OLD.quality IS DISTINCT FROM NEW.quality THEN
    INSERT INTO public.wa_template_events (
      template_id,
      tenant_id,
      actor_id,
      event_type,
      event_source,
      old_quality,
      new_quality,
      metadata
    ) VALUES (
      NEW.id,
      NEW.tenant_id,
      auth.uid(),
      'quality_change',
      'user',
      OLD.quality,
      NEW.quality,
      jsonb_build_object('trigger', 'auto')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER wa_templates_audit_trigger
  AFTER UPDATE ON public.wa_templates
  FOR EACH ROW
  EXECUTE FUNCTION log_wa_template_change();