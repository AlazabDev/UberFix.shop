-- Allow public read access to districts (needed for registration before user is created)
CREATE POLICY "Enable public read for districts"
ON public.districts FOR SELECT
USING (true);