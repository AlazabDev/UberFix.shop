-- ============================================================================
-- UberFix Update-Safe Architecture - Complete Implementation
-- ============================================================================

-- SECTION 1: Add version tracking to all main tables
ALTER TABLE properties ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);

ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE NOT NULL;

-- SECTION 2: Create audit tables
CREATE TABLE IF NOT EXISTS properties_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  change_summary TEXT
);

CREATE INDEX idx_properties_audit_property_id ON properties_audit(property_id);
CREATE INDEX idx_properties_audit_changed_at ON properties_audit(changed_at DESC);

CREATE TABLE IF NOT EXISTS maintenance_requests_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  change_summary TEXT,
  workflow_transition TEXT
);

CREATE INDEX idx_maintenance_requests_audit_request_id ON maintenance_requests_audit(request_id);
CREATE INDEX idx_maintenance_requests_audit_changed_at ON maintenance_requests_audit(changed_at DESC);

-- Enable RLS
ALTER TABLE properties_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view all properties audit" ON properties_audit
  FOR SELECT TO authenticated
  USING (is_staff(auth.uid()));

CREATE POLICY "Users can view their company requests audit" ON maintenance_requests_audit
  FOR SELECT TO authenticated
  USING (is_staff(auth.uid()) OR request_id IN (
    SELECT id FROM maintenance_requests WHERE company_id = get_current_user_company_id()
  ));