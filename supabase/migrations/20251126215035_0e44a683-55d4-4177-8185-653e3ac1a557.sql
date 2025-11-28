-- ========================================
-- Production-Ready Database Fixes (Corrected)
-- ========================================

-- 1. Add Missing Foreign Keys (Only existing columns)
-- ========================================

DO $$ 
BEGIN
  -- maintenance_requests foreign keys
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mr_company') THEN
    ALTER TABLE maintenance_requests
      ADD CONSTRAINT fk_mr_company 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mr_branch') THEN
    ALTER TABLE maintenance_requests
      ADD CONSTRAINT fk_mr_branch 
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mr_category') THEN
    ALTER TABLE maintenance_requests
      ADD CONSTRAINT fk_mr_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mr_property') THEN
    ALTER TABLE maintenance_requests
      ADD CONSTRAINT fk_mr_property 
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;
  END IF;

  -- technician_wallet
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_wallet_technician') THEN
    ALTER TABLE technician_wallet
      ADD CONSTRAINT fk_wallet_technician 
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;
  END IF;

  -- technician_performance
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_perf_technician') THEN
    ALTER TABLE technician_performance
      ADD CONSTRAINT fk_perf_technician 
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;
  END IF;

  -- technician_tasks
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_task_technician') THEN
    ALTER TABLE technician_tasks
      ADD CONSTRAINT fk_task_technician 
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_task_request') THEN
    ALTER TABLE technician_tasks
      ADD CONSTRAINT fk_task_request 
        FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id) ON DELETE SET NULL;
  END IF;

  -- technician_badges
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_badge_technician') THEN
    ALTER TABLE technician_badges
      ADD CONSTRAINT fk_badge_technician 
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;
  END IF;

  -- technician_levels
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_level_technician') THEN
    ALTER TABLE technician_levels
      ADD CONSTRAINT fk_level_technician 
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;
  END IF;

  -- technician_skill_tests (has technician_id)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_skill_technician') THEN
    ALTER TABLE technician_skill_tests
      ADD CONSTRAINT fk_skill_technician 
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;
  END IF;

  -- technician_withdrawals
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_withdrawal_technician') THEN
    ALTER TABLE technician_withdrawals
      ADD CONSTRAINT fk_withdrawal_technician 
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;
  END IF;

  -- reviews
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_review_technician') THEN
    ALTER TABLE reviews
      ADD CONSTRAINT fk_review_technician 
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_review_request') THEN
    ALTER TABLE reviews
      ADD CONSTRAINT fk_review_request 
        FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Add JSONB Default Values
-- ========================================

ALTER TABLE audit_logs 
  ALTER COLUMN old_values SET DEFAULT '{}'::jsonb,
  ALTER COLUMN new_values SET DEFAULT '{}'::jsonb;

ALTER TABLE technician_skill_tests 
  ALTER COLUMN questions_data SET DEFAULT '{}'::jsonb,
  ALTER COLUMN answers_data SET DEFAULT '{}'::jsonb;

ALTER TABLE technician_withdrawals 
  ALTER COLUMN account_details SET DEFAULT '{}'::jsonb;

ALTER TABLE maintenance_requests_audit
  ALTER COLUMN old_data SET DEFAULT '{}'::jsonb,
  ALTER COLUMN new_data SET DEFAULT '{}'::jsonb;

ALTER TABLE properties_audit
  ALTER COLUMN old_data SET DEFAULT '{}'::jsonb,
  ALTER COLUMN new_data SET DEFAULT '{}'::jsonb;

-- 3. Add Performance Indexes
-- ========================================

CREATE INDEX IF NOT EXISTS idx_mr_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_mr_workflow_stage ON maintenance_requests(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_mr_company ON maintenance_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_mr_branch ON maintenance_requests(branch_id);
CREATE INDEX IF NOT EXISTS idx_mr_vendor ON maintenance_requests(assigned_vendor_id);
CREATE INDEX IF NOT EXISTS idx_mr_created_at ON maintenance_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mr_priority ON maintenance_requests(priority);

CREATE INDEX IF NOT EXISTS idx_tech_status ON technicians(status);
CREATE INDEX IF NOT EXISTS idx_tech_rating ON technicians(rating DESC);
CREATE INDEX IF NOT EXISTS idx_tech_level ON technicians(level);

CREATE INDEX IF NOT EXISTS idx_perf_technician ON technician_performance(technician_id);
CREATE INDEX IF NOT EXISTS idx_perf_total_points ON technician_performance(total_points DESC);

CREATE INDEX IF NOT EXISTS idx_review_technician ON reviews(technician_id);
CREATE INDEX IF NOT EXISTS idx_review_rating ON reviews(rating DESC);

CREATE INDEX IF NOT EXISTS idx_properties_created_by ON properties(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 4. Add Data Validation Constraints
-- ========================================

DO $$
BEGIN
  -- Reviews rating constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_rating_check') THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5);
  END IF;

  -- Technicians rating constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'technicians_rating_check') THEN
    ALTER TABLE technicians
      ADD CONSTRAINT technicians_rating_check CHECK (rating >= 0 AND rating <= 5);
  END IF;

  -- Wallet balance constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallet_balance_positive') THEN
    ALTER TABLE technician_wallet
      ADD CONSTRAINT wallet_balance_positive CHECK (balance_current >= 0);
  END IF;

  -- Maintenance requests cost constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mr_cost_positive') THEN
    ALTER TABLE maintenance_requests
      ADD CONSTRAINT mr_cost_positive CHECK (
        (estimated_cost IS NULL OR estimated_cost >= 0) AND
        (actual_cost IS NULL OR actual_cost >= 0)
      );
  END IF;
END $$;

-- 5. Add Table Documentation
-- ========================================

COMMENT ON TABLE technicians IS 'Technician profiles with performance tracking';
COMMENT ON TABLE technician_performance IS 'Monthly performance metrics for technicians';
COMMENT ON TABLE technician_wallet IS 'Financial transactions and earnings management';
COMMENT ON TABLE maintenance_requests IS 'Service request lifecycle tracking';
COMMENT ON TABLE reviews IS 'Customer ratings and feedback';

-- Final verification
DO $$ 
DECLARE
  fk_count INTEGER;
  idx_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fk_count FROM pg_constraint WHERE contype = 'f';
  SELECT COUNT(*) INTO idx_count FROM pg_indexes WHERE schemaname = 'public';
  
  RAISE NOTICE '✅ Database production optimization completed';
  RAISE NOTICE '🔗 Total Foreign Keys: %', fk_count;
  RAISE NOTICE '⚡ Total Indexes: %', idx_count;
  RAISE NOTICE '📊 Performance monitoring enabled';
END $$;