import { useEffect, useRef, useState, useCallback } from 'react';
import { googleMapsLoader } from '@/lib/googleMapsLoader';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  icon?: string;
  onClick?: () => void;
  infoContent?: string;
}

interface UseGoogleMapOptions {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  onMapClick?: (lat: number, lng: number) => void;
}

interface UseGoogleMapReturn {
  mapRef: React.RefObject<HTMLDivElement>;
  map: google.maps.Map | null;
  isLoading: boolean;
  error: string | null;
  addMarker: (marker: MapMarker) => void;
  removeMarker: (id: string) => void;
  clearMarkers: () => void;
  setCenter: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;
}

export function useGoogleMap({
  center,
  zoom = 12,
  markers = [],
  onMapClick,
}: UseGoogleMapOptions): UseGoogleMapReturn {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs for cleanup to avoid stale closures
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowsRef = useRef<Map<string, google.maps.InfoWindow>>(new Map());
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const isMountedRef = useRef(true);

  // Initialize map
  useEffect(() => {
    isMountedRef.current = true;
    let mapInstance: google.maps.Map | null = null;

    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        await googleMapsLoader.load();

        if (!isMountedRef.current || !mapRef.current) return;

        mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        if (onMapClick) {
          const listener = mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng && isMountedRef.current) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
          clickListenerRef.current = listener;
        }

        if (isMountedRef.current) {
          setMap(mapInstance);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        if (isMountedRef.current) {
          setError('فشل تحميل الخريطة');
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMountedRef.current = false;
      
      // Safe cleanup
      try {
        // Remove click listener
        if (clickListenerRef.current) {
          google.maps.event.removeListener(clickListenerRef.current);
          clickListenerRef.current = null;
        }

        // Close and clear info windows
        infoWindowsRef.current.forEach(infoWindow => {
          try {
            infoWindow.close();
          } catch (e) {
            // Ignore errors during cleanup
          }
        });
        infoWindowsRef.current.clear();

        // Clear markers from map
        markersRef.current.forEach(marker => {
          try {
            marker.setMap(null);
          } catch (e) {
            // Ignore errors during cleanup
          }
        });
        markersRef.current.clear();

        // Don't manipulate DOM directly - let React handle it
        mapInstance = null;
      } catch (e) {
        // Ignore all cleanup errors
      }
    };
  }, [center.lat, center.lng, zoom, onMapClick]);

  const addMarker = useCallback((marker: MapMarker) => {
    if (!map || !isMountedRef.current) return;

    try {
      // Remove existing marker with same ID
      const existingMarker = markersRef.current.get(marker.id);
      if (existingMarker) {
        existingMarker.setMap(null);
        markersRef.current.delete(marker.id);
      }

      const existingInfoWindow = infoWindowsRef.current.get(marker.id);
      if (existingInfoWindow) {
        existingInfoWindow.close();
        infoWindowsRef.current.delete(marker.id);
      }

      // Create new marker
      const newMarker = new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.title,
        icon: marker.icon,
      });

      markersRef.current.set(marker.id, newMarker);

      // Add info window if content provided
      if (marker.infoContent) {
        const infoWindow = new google.maps.InfoWindow({
          content: marker.infoContent,
        });
        infoWindowsRef.current.set(marker.id, infoWindow);

        newMarker.addListener('click', () => {
          if (isMountedRef.current) {
            infoWindow.open(map, newMarker);
          }
        });
      }

      // Add custom click handler
      if (marker.onClick) {
        newMarker.addListener('click', () => {
          if (isMountedRef.current && marker.onClick) {
            marker.onClick();
          }
        });
      }
    } catch (err) {
      console.error('Error adding marker:', err);
    }
  }, [map]);

  const removeMarker = useCallback((id: string) => {
    if (!isMountedRef.current) return;

    try {
      const marker = markersRef.current.get(id);
      if (marker) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }

      const infoWindow = infoWindowsRef.current.get(id);
      if (infoWindow) {
        infoWindow.close();
        infoWindowsRef.current.delete(id);
      }
    } catch (err) {
      console.error('Error removing marker:', err);
    }
  }, []);

  const clearMarkers = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      infoWindowsRef.current.forEach(infoWindow => {
        try {
          infoWindow.close();
        } catch (e) {
          // Ignore
        }
      });
      infoWindowsRef.current.clear();

      markersRef.current.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (e) {
          // Ignore
        }
      });
      markersRef.current.clear();
    } catch (err) {
      console.error('Error clearing markers:', err);
    }
  }, []);

  const setCenter = useCallback((lat: number, lng: number) => {
    if (map && isMountedRef.current) {
      try {
        map.setCenter({ lat, lng });
      } catch (err) {
        console.error('Error setting center:', err);
      }
    }
  }, [map]);

  const setZoom = useCallback((newZoom: number) => {
    if (map && isMountedRef.current) {
      try {
        map.setZoom(newZoom);
      } catch (err) {
        console.error('Error setting zoom:', err);
      }
    }
  }, [map]);

  return {
    mapRef,
    map,
    isLoading,
    error,
    addMarker,
    removeMarker,
    clearMarkers,
    setCenter,
    setZoom,
  };
}
