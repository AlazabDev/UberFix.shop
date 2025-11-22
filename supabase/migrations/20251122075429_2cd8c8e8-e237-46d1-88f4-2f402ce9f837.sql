-- ========================================
-- TECHNICIAN MODULE - COMPLETE SYSTEM
-- ========================================

-- 1) Technician Applications (التسجيلات)
CREATE TABLE IF NOT EXISTS public.technician_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  national_id TEXT NOT NULL,
  city_id BIGINT REFERENCES public.cities(id),
  district_id BIGINT REFERENCES public.districts(id),
  specialization TEXT NOT NULL,
  profile_image TEXT,
  years_of_experience INTEGER DEFAULT 0,
  alternative_contact TEXT,
  home_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'verified')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Technician Verifications (التحقق)
CREATE TABLE IF NOT EXISTS public.technician_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.technician_applications(id) ON DELETE CASCADE,
  national_id_front TEXT,
  national_id_back TEXT,
  selfie_image TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Technician Agreements (اتفاقية العمل)
CREATE TABLE IF NOT EXISTS public.technician_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.technician_applications(id) ON DELETE CASCADE,
  quality_policy_accepted BOOLEAN DEFAULT FALSE,
  conduct_policy_accepted BOOLEAN DEFAULT FALSE,
  pricing_policy_accepted BOOLEAN DEFAULT FALSE,
  customer_respect_policy_accepted BOOLEAN DEFAULT FALSE,
  punctuality_policy_accepted BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMPTZ,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Skill Tests (اختبار المهارات)
CREATE TABLE IF NOT EXISTS public.technician_skill_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'F')),
  questions_data JSONB,
  answers_data JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5) Training Courses (دورات التدريب)
CREATE TABLE IF NOT EXISTS public.technician_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
  course_type TEXT NOT NULL,
  course_title TEXT NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  score INTEGER,
  completed_at TIMESTAMPTZ,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6) Technician Tasks (المهام)
CREATE TABLE IF NOT EXISTS public.technician_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
  maintenance_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  customer_location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  estimated_price NUMERIC(10,2),
  estimated_duration INTEGER, -- minutes
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
  check_in_at TIMESTAMPTZ,
  check_in_photo TEXT,
  check_out_at TIMESTAMPTZ,
  before_photos TEXT[],
  after_photos TEXT[],
  work_report TEXT,
  actual_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7) Technician Performance (الأداء)
CREATE TABLE IF NOT EXISTS public.technician_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE UNIQUE,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  cancelled_tasks INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  punctuality_score NUMERIC(3,2) DEFAULT 0,
  quality_score NUMERIC(3,2) DEFAULT 0,
  professionalism_score NUMERIC(3,2) DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  complaints_count INTEGER DEFAULT 0,
  excellence_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8) Technician Levels (المستويات)
CREATE TABLE IF NOT EXISTS public.technician_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE UNIQUE,
  current_level TEXT DEFAULT 'technician' CHECK (current_level IN ('technician', 'pro', 'elite')),
  level_updated_at TIMESTAMPTZ DEFAULT NOW(),
  promotion_history JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9) Technician Badges (الشارات)
CREATE TABLE IF NOT EXISTS public.technician_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('gold_monthly', 'crown_annual', 'legacy')),
  badge_title TEXT NOT NULL,
  badge_description TEXT,
  awarded_for TEXT, -- month/year
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10) Monthly Excellence Awards (مكافآت شهرية)
CREATE TABLE IF NOT EXISTS public.monthly_excellence_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
  award_month DATE NOT NULL,
  award_type TEXT NOT NULL,
  reward_description TEXT,
  reward_value NUMERIC(10,2),
  certificate_url TEXT,
  announcement_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11) Annual Grand Winners (جائزة العمرة)
CREATE TABLE IF NOT EXISTS public.annual_grand_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
  award_year INTEGER NOT NULL,
  story TEXT,
  video_url TEXT,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12) Hall of Excellence (صفحة الشرف)
CREATE TABLE IF NOT EXISTS public.hall_of_excellence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('monthly', 'annual', 'legacy')),
  achievement_title TEXT NOT NULL,
  achievement_description TEXT,
  achievement_date DATE NOT NULL,
  media_urls TEXT[],
  story TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_tech_apps_status ON public.technician_applications(status);
CREATE INDEX IF NOT EXISTS idx_tech_apps_user ON public.technician_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_tech_verif_app ON public.technician_verifications(application_id);
CREATE INDEX IF NOT EXISTS idx_tech_tasks_tech ON public.technician_tasks(technician_id);
CREATE INDEX IF NOT EXISTS idx_tech_tasks_status ON public.technician_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tech_perf_tech ON public.technician_performance(technician_id);
CREATE INDEX IF NOT EXISTS idx_tech_badges_tech ON public.technician_badges(technician_id);
CREATE INDEX IF NOT EXISTS idx_hall_tech ON public.hall_of_excellence(technician_id);
CREATE INDEX IF NOT EXISTS idx_hall_featured ON public.hall_of_excellence(is_featured);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.technician_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_skill_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_excellence_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_grand_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_of_excellence ENABLE ROW LEVEL SECURITY;

-- Applications: Users can create, view their own; admins can view all
CREATE POLICY "Users can create applications" ON public.technician_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their applications" ON public.technician_applications
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications" ON public.technician_applications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Verifications: Admins only
CREATE POLICY "Admins manage verifications" ON public.technician_verifications
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Agreements: Users sign their own
CREATE POLICY "Users sign agreements" ON public.technician_agreements
  FOR ALL USING (
    application_id IN (
      SELECT id FROM public.technician_applications WHERE user_id = auth.uid()
    )
  );

-- Skill Tests: Technicians take their own
CREATE POLICY "Technicians manage their tests" ON public.technician_skill_tests
  FOR ALL USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id::text = auth.uid()::text
    ) OR has_role(auth.uid(), 'admin')
  );

-- Training: Technicians view their own
CREATE POLICY "Technicians view training" ON public.technician_training
  FOR SELECT USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id::text = auth.uid()::text
    ) OR has_role(auth.uid(), 'admin')
  );

-- Tasks: Technicians view/update their own
CREATE POLICY "Technicians manage tasks" ON public.technician_tasks
  FOR ALL USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE id::text = auth.uid()::text
    ) OR has_role(auth.uid(), 'admin')
  );

-- Performance: Public read, system updates
CREATE POLICY "Public read performance" ON public.technician_performance
  FOR SELECT USING (true);

CREATE POLICY "Admins update performance" ON public.technician_performance
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Levels: Public read
CREATE POLICY "Public read levels" ON public.technician_levels
  FOR SELECT USING (true);

CREATE POLICY "Admins manage levels" ON public.technician_levels
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Badges: Public read
CREATE POLICY "Public read badges" ON public.technician_badges
  FOR SELECT USING (true);

CREATE POLICY "Admins manage badges" ON public.technician_badges
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Excellence Awards: Public read
CREATE POLICY "Public read monthly awards" ON public.monthly_excellence_awards
  FOR SELECT USING (true);

CREATE POLICY "Admins manage awards" ON public.monthly_excellence_awards
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Annual Winners: Public read
CREATE POLICY "Public read annual winners" ON public.annual_grand_winners
  FOR SELECT USING (true);

CREATE POLICY "Admins manage winners" ON public.annual_grand_winners
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Hall of Excellence: Public read
CREATE POLICY "Public read hall" ON public.hall_of_excellence
  FOR SELECT USING (true);

CREATE POLICY "Admins manage hall" ON public.hall_of_excellence
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ========================================
-- TRIGGERS
-- ========================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_technician_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tech_apps_timestamp
  BEFORE UPDATE ON public.technician_applications
  FOR EACH ROW EXECUTE FUNCTION update_technician_updated_at();

CREATE TRIGGER update_tech_tasks_timestamp
  BEFORE UPDATE ON public.technician_tasks
  FOR EACH ROW EXECUTE FUNCTION update_technician_updated_at();

CREATE TRIGGER update_tech_training_timestamp
  BEFORE UPDATE ON public.technician_training
  FOR EACH ROW EXECUTE FUNCTION update_technician_updated_at();

CREATE TRIGGER update_tech_perf_timestamp
  BEFORE UPDATE ON public.technician_performance
  FOR EACH ROW EXECUTE FUNCTION update_technician_updated_at();

-- Auto-create performance record when technician is created
CREATE OR REPLACE FUNCTION create_technician_performance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.technician_performance (technician_id)
  VALUES (NEW.id)
  ON CONFLICT (technician_id) DO NOTHING;
  
  INSERT INTO public.technician_levels (technician_id)
  VALUES (NEW.id)
  ON CONFLICT (technician_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_tech_performance
  AFTER INSERT ON public.technicians
  FOR EACH ROW EXECUTE FUNCTION create_technician_performance();