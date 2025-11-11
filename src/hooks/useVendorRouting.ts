import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RouteInfo {
  distance: string;
  duration: string;
  durationValue: number;
  eta: string;
  polyline: string;
  distanceValue: number;
  startAddress: string;
  endAddress: string;
}

interface UseVendorRoutingProps {
  vendorLat: number | null;
  vendorLng: number | null;
  destinationLat: number | null;
  destinationLng: number | null;
}

export const useVendorRouting = ({
  vendorLat,
  vendorLng,
  destinationLat,
  destinationLng,
}: UseVendorRoutingProps) => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorLat || !vendorLng || !destinationLat || !destinationLng) {
      return;
    }

    const calculateRoute = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('🚗 Calculating route via edge function...');
        
        const { data, error: functionError } = await supabase.functions.invoke('calculate-route', {
          body: {
            origin: { lat: vendorLat, lng: vendorLng },
            destination: { lat: destinationLat, lng: destinationLng },
          },
        });

        if (functionError) {
          throw functionError;
        }

        if (data.error) {
          throw new Error(data.message || 'فشل حساب المسار');
        }

        console.log('✅ Route calculated:', data);
        setRouteInfo(data);
      } catch (err) {
        console.error('Error calculating route:', err);
        setError(err instanceof Error ? err.message : 'فشل حساب المسار');
      } finally {
        setLoading(false);
      }
    };

    calculateRoute();
    
    // Recalculate every 30 seconds for real-time updates
    const interval = setInterval(calculateRoute, 30000);
    
    return () => clearInterval(interval);
  }, [vendorLat, vendorLng, destinationLat, destinationLng]);

  return { routeInfo, loading, error };
};
