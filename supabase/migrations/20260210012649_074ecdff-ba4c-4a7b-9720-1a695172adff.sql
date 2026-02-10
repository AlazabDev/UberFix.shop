
-- Create contract status enum
DO $$ BEGIN
  CREATE TYPE public.contract_status AS ENUM ('draft', 'active', 'expired', 'suspended', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create contract billing type enum
DO $$ BEGIN
  CREATE TYPE public.contract_billing_type AS ENUM ('per_request', 'monthly', 'quarterly', 'semi_annual', 'annual');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create maintenance_contracts table
CREATE TABLE public.maintenance_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  branch_id UUID REFERENCES public.branches(id),
  
  -- Contract Info
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Client Info
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  property_id UUID REFERENCES public.properties(id),
  
  -- Contract Terms
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  billing_type contract_billing_type NOT NULL DEFAULT 'per_request',
  contract_value NUMERIC(12,2) DEFAULT 0,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  
  -- Limits
  max_requests INTEGER,
  used_requests INTEGER DEFAULT 0,
  includes_parts BOOLEAN DEFAULT false,
  
  -- Coverage
  covered_services TEXT[],
  excluded_services TEXT[],
  sla_response_hours INTEGER DEFAULT 24,
  sla_resolution_hours INTEGER DEFAULT 72,
  
  -- Status
  status contract_status NOT NULL DEFAULT 'draft',
  renewal_reminder_days INTEGER DEFAULT 30,
  auto_renew BOOLEAN DEFAULT false,
  
  -- Notes
  terms_and_conditions TEXT,
  internal_notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Enable RLS
ALTER TABLE public.maintenance_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "contracts_select" ON public.maintenance_contracts
FOR SELECT TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "contracts_insert" ON public.maintenance_contracts
FOR INSERT TO authenticated
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "contracts_update" ON public.maintenance_contracts
FOR UPDATE TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "contracts_delete" ON public.maintenance_contracts
FOR DELETE TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'owner'::app_role)
);

-- Add contract_id to maintenance_requests
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES public.maintenance_contracts(id);

-- Create index for performance
CREATE INDEX idx_contracts_company ON public.maintenance_contracts(company_id);
CREATE INDEX idx_contracts_status ON public.maintenance_contracts(status);
CREATE INDEX idx_contracts_end_date ON public.maintenance_contracts(end_date);
CREATE INDEX idx_mr_contract ON public.maintenance_requests(contract_id);

-- Trigger for updated_at
CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.maintenance_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Revoke public access
REVOKE ALL ON public.maintenance_contracts FROM anon;
