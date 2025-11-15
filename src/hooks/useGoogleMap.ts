import { useEffect, useRef, useState, useCallback } from 'react';
import { googleMapsLoader } from '@/lib/googleMapsLoader';
import { MAPS_CONFIG } from '@/config/maps';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  icon?: string;
  onClick?: () => void;
  content?: string;
}

export interface UseGoogleMapOptions {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  onMapClick?: (lat: number, lng: number) => void;
  mapOptions?: google.maps.MapOptions;
}

export interface UseGoogleMapReturn {
  mapRef: React.RefObject<HTMLDivElement>;
  map: google.maps.Map | null;
  isLoading: boolean;
  error: string | null;
  addMarker: (marker: MapMarker) => google.maps.Marker | null;
  removeMarker: (markerId: string) => void;
  clearMarkers: () => void;
  setCenter: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;
}

/**
 * Hook موحد لاستخدام Google Maps في جميع أنحاء التطبيق
 */
export function useGoogleMap(options: UseGoogleMapOptions = {}): UseGoogleMapReturn {
  const {
    center = MAPS_CONFIG.defaultCenter,
    zoom = MAPS_CONFIG.defaultZoom,
    markers = [],
    onMapClick,
    mapOptions = {},
  } = options;

  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    let mounted = true;
    let clickListener: google.maps.MapsEventListener | null = null;
    let mapInstance: google.maps.Map | null = null;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load Google Maps API
        await googleMapsLoader.load();

        if (!mounted || !mapRef.current) {
          setIsLoading(false);
          return;
        }

        // Create map instance
        mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          ...MAPS_CONFIG.defaultOptions,
          ...mapOptions,
        });

        if (!mounted) {
          setIsLoading(false);
          return;
        }

        setMap(mapInstance);

        // Add click listener
        if (onMapClick && mapInstance) {
          clickListener = mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setIsLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error('Error initializing map:', err);
        setError(err instanceof Error ? err.message : 'فشل تحميل الخريطة');
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      mounted = false;
      
      // Remove click listener safely
      if (clickListener && window.google?.maps?.event) {
        try {
          google.maps.event.removeListener(clickListener);
        } catch (e) {
          console.error('Error removing listener:', e);
        }
      }
      
      // Clear markers safely with better error handling
      if (markersRef.current.size > 0) {
        const markers = Array.from(markersRef.current.values());
        markersRef.current.clear();
        
        markers.forEach((marker) => {
          try {
            if (marker && typeof marker.setMap === 'function') {
              marker.setMap(null);
            }
          } catch (e) {
            // Silently ignore individual marker cleanup errors
          }
        });
      }

      // Clear map instance
      mapInstance = null;
      setMap(null);
    };
  }, []);

  // Add marker function
  const addMarker = useCallback((marker: MapMarker): google.maps.Marker | null => {
    if (!map) return null;

    // Remove existing marker with same ID
    if (markersRef.current.has(marker.id)) {
      removeMarker(marker.id);
    }

    const markerInstance = new google.maps.Marker({
      position: { lat: marker.lat, lng: marker.lng },
      map,
      title: marker.title,
      icon: marker.icon,
    });

    if (marker.onClick) {
      markerInstance.addListener('click', marker.onClick);
    }

    if (marker.content) {
      const infoWindow = new google.maps.InfoWindow({
        content: marker.content,
      });
      markerInstance.addListener('click', () => {
        infoWindow.open(map, markerInstance);
      });
    }

    markersRef.current.set(marker.id, markerInstance);
    return markerInstance;
  }, [map]);

  // Remove marker function
  const removeMarker = useCallback((markerId: string) => {
    const marker = markersRef.current.get(markerId);
    if (marker) {
      try {
        if (marker.setMap) {
          marker.setMap(null);
        }
        markersRef.current.delete(markerId);
      } catch (error) {
        console.error('Error removing marker:', error);
        markersRef.current.delete(markerId);
      }
    }
  }, []);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    try {
      markersRef.current.forEach((marker) => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current.clear();
    } catch (error) {
      console.error('Error clearing markers:', error);
      markersRef.current.clear();
    }
  }, []);

  // Set center
  const setCenter = useCallback((lat: number, lng: number) => {
    if (map) {
      map.setCenter({ lat, lng });
    }
  }, [map]);

  // Set zoom
  const setZoom = useCallback((newZoom: number) => {
    if (map) {
      map.setZoom(newZoom);
    }
  }, [map]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!map || markers.length === 0) return;

    // Clear existing markers
    clearMarkers();

    // Add new markers
    markers.forEach((marker) => {
      addMarker(marker);
    });
  }, [map, markers, addMarker, clearMarkers]);

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
