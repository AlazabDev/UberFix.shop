-- Fix properties RLS policies for better property creation
-- Drop conflicting policies
DROP POLICY IF EXISTS "السماح بإنشاء العقارات للمستخدمين" ON properties;
DROP POLICY IF EXISTS "properties_manage" ON properties;

-- Create comprehensive INSERT policy
CREATE POLICY "properties_insert_authenticated"
ON properties
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Ensure storage bucket exists and has proper policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "property_images_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "property_images_public_read" ON storage.objects;

-- Allow authenticated users to upload property images
CREATE POLICY "property_images_authenticated_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.uid() IS NOT NULL
);

-- Allow public read access to property images
CREATE POLICY "property_images_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Allow authenticated users to update their uploaded images
CREATE POLICY "property_images_authenticated_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid() IS NOT NULL
);

-- Allow authenticated users to delete their uploaded images
CREATE POLICY "property_images_authenticated_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid() IS NOT NULL
);
