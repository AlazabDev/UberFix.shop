-- Create facebook_leads table for storing lead data from Facebook Lead Ads
CREATE TABLE public.facebook_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leadgen_id TEXT UNIQUE NOT NULL,
  form_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  ad_id TEXT,
  adgroup_id TEXT,
  campaign_id TEXT,
  
  -- Lead data
  full_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  address TEXT,
  service_type TEXT,
  message TEXT,
  
  -- Raw data from Facebook
  raw_data JSONB,
  field_data JSONB,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'new',
  maintenance_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.facebook_leads ENABLE ROW LEVEL SECURITY;

-- Allow admins/managers to view all leads
CREATE POLICY "Admins can view all leads"
  ON public.facebook_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager', 'owner')
    )
  );

-- Allow admins/managers to update leads
CREATE POLICY "Admins can update leads"
  ON public.facebook_leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager', 'owner')
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_facebook_leads_leadgen_id ON public.facebook_leads(leadgen_id);
CREATE INDEX idx_facebook_leads_status ON public.facebook_leads(status);
CREATE INDEX idx_facebook_leads_created_at ON public.facebook_leads(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_facebook_leads_updated_at
  BEFORE UPDATE ON public.facebook_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();