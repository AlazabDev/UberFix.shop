-- ============================================
-- نظام الفنيين الشامل - UberFix.shop
-- Financial System, Rewards, Levels & Wallet
-- ============================================

-- 1) جدول المحفظة المالية للفني
CREATE TABLE IF NOT EXISTS public.technician_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance_current NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  balance_pending NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  balance_locked NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  total_earnings NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  total_withdrawn NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  last_withdrawal_at TIMESTAMPTZ,
  minimum_withdrawal NUMERIC(12, 2) DEFAULT 300.00 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2) جدول عمليات السحب
CREATE TABLE IF NOT EXISTS public.technician_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('vodafone_cash', 'bank_transfer', 'instapay', 'wallet')),
  account_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3) جدول المعاملات المالية
CREATE TABLE IF NOT EXISTS public.technician_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earning', 'withdrawal', 'bonus', 'penalty', 'refund', 'adjustment')),
  amount NUMERIC(12, 2) NOT NULL,
  platform_fee NUMERIC(12, 2) DEFAULT 0.00,
  net_amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4) جدول الحوافز الشهرية
CREATE TABLE IF NOT EXISTS public.technician_monthly_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL, -- أول يوم في الشهر
  commitment_bonus NUMERIC(12, 2) DEFAULT 0.00, -- 25 زيارة = 300 جنيه
  quality_bonus NUMERIC(12, 2) DEFAULT 0.00, -- تقييم ≥ 4.8 = 200 جنيه
  time_bonus NUMERIC(12, 2) DEFAULT 0.00, -- وقت وصول ≤ 20 دقيقة = 150 جنيه
  top_rated_bonus NUMERIC(12, 2) DEFAULT 0.00, -- 5 نجوم = 500 جنيه
  super_pro_bonus NUMERIC(12, 2) DEFAULT 0.00, -- 50 زيارة = 1000 جنيه
  total_bonus NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  visits_completed INTEGER DEFAULT 0 NOT NULL,
  average_rating NUMERIC(3, 2) DEFAULT 0.00,
  average_response_time INTEGER, -- بالثواني
  average_arrival_time INTEGER, -- بالدقائق
  cancellation_rate NUMERIC(5, 2) DEFAULT 0.00,
  acceptance_rate NUMERIC(5, 2) DEFAULT 0.00,
  complaints_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'calculating' CHECK (status IN ('calculating', 'approved', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (technician_id, month)
);

-- 5) جدول مستويات الفنيين (Bronze, Silver, Gold, Platinum, Top Rated)
CREATE TABLE IF NOT EXISTS public.technician_level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('bronze', 'silver', 'gold', 'platinum', 'top_rated')),
  achieved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  requirements_met JSONB NOT NULL, -- {rating: 4.8, visits: 20, ...}
  previous_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6) جدول إحصائيات الأداء اليومي
CREATE TABLE IF NOT EXISTS public.technician_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  visits_assigned INTEGER DEFAULT 0,
  visits_accepted INTEGER DEFAULT 0,
  visits_rejected INTEGER DEFAULT 0,
  visits_cancelled INTEGER DEFAULT 0,
  visits_completed INTEGER DEFAULT 0,
  total_earnings NUMERIC(12, 2) DEFAULT 0.00,
  average_rating NUMERIC(3, 2) DEFAULT 0.00,
  average_response_time INTEGER, -- ثواني
  average_arrival_time INTEGER, -- دقائق
  complaints_received INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (technician_id, date)
);

-- 7) جدول Work Zones (نطاقات الخدمة)
CREATE TABLE IF NOT EXISTS public.technician_work_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  city_id BIGINT REFERENCES public.cities(id),
  district_id BIGINT REFERENCES public.districts(id),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8) جدول Portfolio (معرض الأعمال)
CREATE TABLE IF NOT EXISTS public.technician_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_urls TEXT[] NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  work_type TEXT, -- نوع العمل
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9) جدول الشكاوى ضد الفني
CREATE TABLE IF NOT EXISTS public.technician_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.profiles(id),
  complaint_type TEXT NOT NULL CHECK (complaint_type IN ('behavior', 'quality', 'delay', 'pricing', 'no_show', 'other')),
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  penalty_applied NUMERIC(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Trigger: تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_technician_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_technician_wallet_updated_at
  BEFORE UPDATE ON public.technician_wallet
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_updated_at();

CREATE TRIGGER update_technician_withdrawals_updated_at
  BEFORE UPDATE ON public.technician_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_updated_at();

CREATE TRIGGER update_technician_transactions_updated_at
  BEFORE UPDATE ON public.technician_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_updated_at();

CREATE TRIGGER update_technician_monthly_bonuses_updated_at
  BEFORE UPDATE ON public.technician_monthly_bonuses
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_updated_at();

CREATE TRIGGER update_technician_daily_stats_updated_at
  BEFORE UPDATE ON public.technician_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_updated_at();

CREATE TRIGGER update_technician_portfolio_updated_at
  BEFORE UPDATE ON public.technician_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_updated_at();

CREATE TRIGGER update_technician_complaints_updated_at
  BEFORE UPDATE ON public.technician_complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_updated_at();

-- ============================================
-- INDEXES للأداء
-- ============================================

CREATE INDEX IF NOT EXISTS idx_technician_wallet_technician ON public.technician_wallet(technician_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_technician_status ON public.technician_withdrawals(technician_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_technician ON public.technician_transactions(technician_id);
CREATE INDEX IF NOT EXISTS idx_transactions_request ON public.technician_transactions(request_id);
CREATE INDEX IF NOT EXISTS idx_monthly_bonuses_month ON public.technician_monthly_bonuses(month, technician_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON public.technician_daily_stats(date, technician_id);
CREATE INDEX IF NOT EXISTS idx_work_zones_technician ON public.technician_work_zones(technician_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_technician ON public.technician_portfolio(technician_id);
CREATE INDEX IF NOT EXISTS idx_complaints_technician_status ON public.technician_complaints(technician_id, status);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.technician_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_monthly_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_level_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_work_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_complaints ENABLE ROW LEVEL SECURITY;

-- Policies: الفني يرى بياناته المالية فقط
CREATE POLICY "Technicians view own wallet"
  ON public.technician_wallet FOR SELECT
  USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id = auth.uid()
    )
  );

CREATE POLICY "Technicians view own withdrawals"
  ON public.technician_withdrawals FOR SELECT
  USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id = auth.uid()
    )
  );

CREATE POLICY "Technicians create withdrawal requests"
  ON public.technician_withdrawals FOR INSERT
  WITH CHECK (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id = auth.uid()
    )
  );

CREATE POLICY "Technicians view own transactions"
  ON public.technician_transactions FOR SELECT
  USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id = auth.uid()
    )
  );

CREATE POLICY "Technicians view own bonuses"
  ON public.technician_monthly_bonuses FOR SELECT
  USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id = auth.uid()
    )
  );

CREATE POLICY "Technicians view own level history"
  ON public.technician_level_history FOR SELECT
  USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id = auth.uid()
    )
  );

CREATE POLICY "Technicians view own stats"
  ON public.technician_daily_stats FOR SELECT
  USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id = auth.uid()
    )
  );

-- Admins يروا كل البيانات
CREATE POLICY "Admins manage all financial data"
  ON public.technician_wallet FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage withdrawals"
  ON public.technician_withdrawals FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage transactions"
  ON public.technician_transactions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Portfolio: الفني يدير معرضه، الجميع يشاهد
CREATE POLICY "Technicians manage own portfolio"
  ON public.technician_portfolio FOR ALL
  USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id = auth.uid()
    )
  );

CREATE POLICY "Public view portfolio"
  ON public.technician_portfolio FOR SELECT
  USING (true);

-- Complaints: الجميع يشاهد، Admins يديرون
CREATE POLICY "Public view complaints"
  ON public.technician_complaints FOR SELECT
  USING (true);

CREATE POLICY "Admins manage complaints"
  ON public.technician_complaints FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

COMMENT ON TABLE public.technician_wallet IS 'محفظة الفني المالية - الرصيد الحالي والمعلق والمقفل';
COMMENT ON TABLE public.technician_withdrawals IS 'طلبات السحب من المحفظة';
COMMENT ON TABLE public.technician_transactions IS 'سجل كل المعاملات المالية للفني';
COMMENT ON TABLE public.technician_monthly_bonuses IS 'المكافآت الشهرية حسب الأداء';
COMMENT ON TABLE public.technician_level_history IS 'تاريخ تطور مستوى الفني (Bronze → Top Rated)';
COMMENT ON TABLE public.technician_daily_stats IS 'إحصائيات الأداء اليومي';
COMMENT ON TABLE public.technician_work_zones IS 'نطاقات الخدمة الجغرافية';
COMMENT ON TABLE public.technician_portfolio IS 'معرض أعمال الفني';
COMMENT ON TABLE public.technician_complaints IS 'الشكاوى المقدمة ضد الفني';