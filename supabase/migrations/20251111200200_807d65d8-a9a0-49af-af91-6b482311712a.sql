-- Add real-time tracking fields to vendors table if not exists
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS current_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS current_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_tracking_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tracking_started_at TIMESTAMP WITH TIME ZONE;

-- Create function to update vendor current location
CREATE OR REPLACE FUNCTION public.update_vendor_location()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.vendors
  SET 
    current_latitude = NEW.latitude,
    current_longitude = NEW.longitude,
    location_updated_at = NOW()
  WHERE id = NEW.vendor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update vendor location
DROP TRIGGER IF EXISTS trigger_update_vendor_location ON public.vendor_location_history;
CREATE TRIGGER trigger_update_vendor_location
AFTER INSERT ON public.vendor_location_history
FOR EACH ROW
EXECUTE FUNCTION public.update_vendor_location();