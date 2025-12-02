-- Allow public read access to properties for QR code quick requests
-- This enables unauthenticated users to view property details when scanning QR codes

-- Drop existing conflicting policy if exists
DROP POLICY IF EXISTS "public_read_properties_for_qr" ON properties;

-- Create new policy for public read access
CREATE POLICY "public_read_properties_for_qr" 
ON properties 
FOR SELECT 
USING (true);