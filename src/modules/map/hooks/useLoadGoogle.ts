import { useEffect, useState } from 'react';

export const useLoadGoogle = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const loadGoogleMapsAPI = async () => {
      try {
        // جلب API Key من Supabase Functions
        const response = await fetch('https://zrrffsjbfkphridqyais.supabase.co/functions/v1/get-google-maps-key');
        const data = await response.json();
        
        if (!data.apiKey) {
          setLoadError(new Error('Google Maps API key not configured'));
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=marker,places,geometry&language=ar&region=EG&v=weekly`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          setIsLoaded(true);
        };

        script.onerror = () => {
          setLoadError(new Error('Failed to load Google Maps script'));
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        setLoadError(error as Error);
      }
    };

    loadGoogleMapsAPI();
  }, []);

  return { isLoaded, loadError };
};
