import { useState, useEffect } from 'react';

interface RouteInfo {
  distance: string;
  duration: string;
  durationValue: number;
  eta: Date;
  polyline: string;
}

interface UseVendorRoutingProps {
  vendorLat: number | null;
  vendorLng: number | null;
  destinationLat: number | null;
  destinationLng: number | null;
  apiKey: string;
}

export const useVendorRouting = ({
  vendorLat,
  vendorLng,
  destinationLat,
  destinationLng,
  apiKey,
}: UseVendorRoutingProps) => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorLat || !vendorLng || !destinationLat || !destinationLng || !apiKey) {
      return;
    }

    const calculateRoute = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!window.google?.maps?.DirectionsService) {
          throw new Error('Google Maps not loaded');
        }

        const directionsService = new google.maps.DirectionsService();
        
        const result = await directionsService.route({
          origin: { lat: vendorLat, lng: vendorLng },
          destination: { lat: destinationLat, lng: destinationLng },
          travelMode: google.maps.TravelMode.DRIVING,
        });

        if (result.routes[0]?.legs[0]) {
          const leg = result.routes[0].legs[0];
          const durationInSeconds = leg.duration?.value || 0;
          const eta = new Date(Date.now() + durationInSeconds * 1000);

          setRouteInfo({
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || '',
            durationValue: durationInSeconds,
            eta,
            polyline: result.routes[0].overview_polyline,
          });
        }
      } catch (err) {
        console.error('Error calculating route:', err);
        setError('فشل حساب المسار');
      } finally {
        setLoading(false);
      }
    };

    calculateRoute();
    
    // Recalculate every 30 seconds
    const interval = setInterval(calculateRoute, 30000);
    
    return () => clearInterval(interval);
  }, [vendorLat, vendorLng, destinationLat, destinationLng, apiKey]);

  return { routeInfo, loading, error };
};
