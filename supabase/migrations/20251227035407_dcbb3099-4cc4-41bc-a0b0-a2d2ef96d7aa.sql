-- Create a new bucket for technician registration documents (public upload allowed for registration)
INSERT INTO storage.buckets (id, name, public)
VALUES ('technician-registration-docs', 'technician-registration-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to this bucket (for registration before user is created)
CREATE POLICY "Allow public upload for technician registration"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'technician-registration-docs');

-- Allow public read access
CREATE POLICY "Allow public read for technician docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'technician-registration-docs');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow users to update their uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'technician-registration-docs' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow users to delete their uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'technician-registration-docs' AND auth.uid() IS NOT NULL);