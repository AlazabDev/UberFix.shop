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
  const isMountedRef = useRef(true);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    isMountedRef.current = true;
    let clickListener: google.maps.MapsEventListener | null = null;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await googleMapsLoader.load();

        if (!isMountedRef.current || !mapRef.current) {
          setIsLoading(false);
          return;
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          ...MAPS_CONFIG.defaultOptions,
          ...mapOptions,
        });

        if (!isMountedRef.current) {
          setIsLoading(false);
          return;
        }

        setMap(mapInstance);

        if (onMapClick) {
          clickListener = mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng && isMountedRef.current) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setIsLoading(false);
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error('Error initializing map:', err);
        setError(err instanceof Error ? err.message : 'فشل تحميل الخريطة');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      isMountedRef.current = false;
      
      markersRef.current.forEach((marker) => {
        if (marker?.setMap) marker.setMap(null);
      });
      markersRef.current.clear();
      
      if (clickListener) {
        google.maps.event.removeListener(clickListener);
      }
      
      setMap(null);
    };
  }, [center.lat, center.lng, zoom, onMapClick, mapOptions]);

  const addMarker = useCallback((marker: MapMarker): google.maps.Marker | null => {
    if (!map || !isMountedRef.current) return null;

    const existingMarker = markersRef.current.get(marker.id);
    if (existingMarker) {
      existingMarker.setMap(null);
      markersRef.current.delete(marker.id);
    }

    const googleMarker = new google.maps.Marker({
      position: { lat: marker.lat, lng: marker.lng },
      map,
      title: marker.title,
      icon: marker.icon,
    });

    if (marker.onClick) {
      googleMarker.addListener('click', marker.onClick);
    }

    if (marker.content) {
      const infoWindow = new google.maps.InfoWindow({
        content: marker.content,
      });
      googleMarker.addListener('click', () => {
        infoWindow.open(map, googleMarker);
      });
    }

    markersRef.current.set(marker.id, googleMarker);
    return googleMarker;
  }, [map]);

  const removeMarker = useCallback((markerId: string) => {
    const marker = markersRef.current.get(markerId);
    if (marker) {
      marker.setMap(null);
      markersRef.current.delete(markerId);
    }
  }, []);

  const clearMarkers = useCallback(() => {
    if (!isMountedRef.current) return;
    
    markersRef.current.forEach((marker) => {
      if (marker?.setMap) marker.setMap(null);
    });
    markersRef.current.clear();
  }, []);

  const setCenter = useCallback((lat: number, lng: number) => {
    if (map && isMountedRef.current) {
      map.setCenter({ lat, lng });
    }
  }, [map]);

  const setZoom = useCallback((newZoom: number) => {
    if (map && isMountedRef.current) {
      map.setZoom(newZoom);
    }
  }, [map]);

  useEffect(() => {
    if (!map || !isMountedRef.current) return;

    clearMarkers();
    markers.forEach((marker) => addMarker(marker));
  }, [markers, map, addMarker, clearMarkers]);

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
