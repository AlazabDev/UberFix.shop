-- Tighten public access without removing any UI modules/features.
-- Public (anon) flows should use Edge Functions instead of direct table reads.

-- 1) Remove public read access to companies/branches (these were used only to fetch default IDs on public forms)
DROP POLICY IF EXISTS public_read_branches ON public.branches;
DROP POLICY IF EXISTS public_read_companies ON public.companies;

-- 2) Remove public read access to quote items (pricing exposure)
DROP POLICY IF EXISTS "Anyone can view quote items" ON public.quote_items;

-- 3) Remove public read access to document reviewers (email exposure)
DROP POLICY IF EXISTS "Anyone can read document_reviewers" ON public.document_reviewers;
DROP POLICY IF EXISTS "Anyone can view reviewers by hash" ON public.document_reviewers;
