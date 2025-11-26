-- جدول التحقق من OTP
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  action TEXT DEFAULT 'verify',
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pol_otp_service_insert"
  ON public.otp_verifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "pol_otp_service_update"
  ON public.otp_verifications FOR UPDATE
  USING (true);

CREATE INDEX idx_otp_phone_valid ON public.otp_verifications(phone, verified, expires_at);
