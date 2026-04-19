-- ========================================
-- 1) Restrict financial award tables
-- ========================================

-- monthly_excellence_awards: drop permissive SELECT policies
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'monthly_excellence_awards' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.monthly_excellence_awards', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.monthly_excellence_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read monthly awards"
ON public.monthly_excellence_awards
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
  OR public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Technician can read own monthly awards"
ON public.monthly_excellence_awards
FOR SELECT TO authenticated
USING (
  technician_id IN (
    SELECT t.id FROM public.technicians t
    JOIN public.technician_profiles tp ON tp.id = t.technician_profile_id
    WHERE tp.user_id = auth.uid()
  )
);

-- annual_grand_winners: drop permissive SELECT policies
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'annual_grand_winners' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.annual_grand_winners', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.annual_grand_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read annual winners"
ON public.annual_grand_winners
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
  OR public.has_role(auth.uid(), 'staff')
);

CREATE POLICY "Technician can read own annual wins"
ON public.annual_grand_winners
FOR SELECT TO authenticated
USING (
  technician_id IN (
    SELECT t.id FROM public.technicians t
    JOIN public.technician_profiles tp ON tp.id = t.technician_profile_id
    WHERE tp.user_id = auth.uid()
  )
);

-- ========================================
-- 2) property-images bucket: ownership-checked write policies
-- ========================================

DROP POLICY IF EXISTS "Users can delete property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "property_images_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "property_images_authenticated_update" ON storage.objects;

CREATE POLICY "property_images_owner_or_staff_delete"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'property-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'staff')
  )
);

CREATE POLICY "property_images_owner_or_staff_update"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'property-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'staff')
  )
)
WITH CHECK (
  bucket_id = 'property-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR public.has_role(auth.uid(), 'staff')
  )
);