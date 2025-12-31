-- السماح بقراءة الشركات والفروع للعموم (للنماذج العامة مثل QR)

-- سياسة قراءة عامة للشركات
CREATE POLICY "public_read_companies" ON public.companies
FOR SELECT
USING (true);

-- سياسة قراءة عامة للفروع
CREATE POLICY "public_read_branches" ON public.branches
FOR SELECT
USING (true);