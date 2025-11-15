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

        // Verify the map container is still in the DOM
        if (!mapRef.current.isConnected) {
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
      console.log('🧹 Map cleanup started');
      mounted = false;
      
      // Schedule cleanup for next tick to avoid React DOM conflicts
      setTimeout(() => {
        try {
          console.log('🔍 Cleanup timeout executing');
          
          // Only attempt cleanup if the container still exists in DOM
          if (!mapRef.current) {
            console.log('⚠️ mapRef.current is null, skipping cleanup');
            setMap(null);
            return;
          }
          
          if (!mapRef.current.isConnected) {
            console.log('⚠️ mapRef not connected to DOM, skipping cleanup');
            setMap(null);
            return;
          }

          console.log('✅ Map container still in DOM, proceeding with cleanup');

          // Clear all markers first
          if (markersRef.current.size > 0) {
            console.log(`🗑️ Clearing ${markersRef.current.size} markers`);
            const markersArray = Array.from(markersRef.current.values());
            markersRef.current.clear();
            
            markersArray.forEach((marker, index) => {
              try {
                if (marker && typeof marker.setMap === 'function') {
                  marker.setMap(null);
                  console.log(`✓ Marker ${index + 1} cleared`);
                }
              } catch (e) {
                console.error(`✗ Error clearing marker ${index + 1}:`, e);
              }
            });
          }
          
          // Remove click listener
          if (clickListener && window.google?.maps?.event) {
            try {
              console.log('🔇 Removing click listener');
              google.maps.event.removeListener(clickListener);
              clickListener = null;
              console.log('✓ Click listener removed');
            } catch (e) {
              console.error('✗ Error removing click listener:', e);
            }
          }

          // Clear map instance
          if (mapInstance && typeof mapInstance.unbindAll === 'function') {
            try {
              console.log('🗺️ Unbinding map instance');
              mapInstance.unbindAll();
              mapInstance = null;
              console.log('✓ Map instance unbound');
            } catch (e) {
              console.error('✗ Error unbinding map:', e);
            }
          }
          
          console.log('✅ Map cleanup completed successfully');
        } catch (e) {
          console.error('❌ Critical error during cleanup:', e);
        } finally {
          setMap(null);
          console.log('🏁 Cleanup finalized');
        }
      }, 0);
    };
  }, []);

  // Add marker function
  const addMarker = useCallback((marker: MapMarker): google.maps.Marker | null => {
    if (!map) return null;

    try {
      // Remove existing marker with same ID
      if (markersRef.current.has(marker.id)) {
        const existingMarker = markersRef.current.get(marker.id);
        if (existingMarker && typeof existingMarker.setMap === 'function') {
          existingMarker.setMap(null);
        }
        markersRef.current.delete(marker.id);
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
    } catch (error) {
      console.error('Error adding marker:', error);
      return null;
    }
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
    if (!map || !mapRef.current?.isConnected) return;

    let mounted = true;

    try {
      // Clear existing markers first
      const currentMarkers = Array.from(markersRef.current.values());
      markersRef.current.clear();
      
      currentMarkers.forEach((marker) => {
        try {
          if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
          }
        } catch (e) {
          // Silent cleanup error
        }
      });

      // Add new markers only if component is still mounted and we have markers
      if (mounted && markers.length > 0 && mapRef.current?.isConnected) {
        markers.forEach((markerData) => {
          try {
            if (!mounted || !mapRef.current?.isConnected) return;
            
            const markerInstance = new google.maps.Marker({
              position: { lat: markerData.lat, lng: markerData.lng },
              map,
              title: markerData.title,
              icon: markerData.icon,
            });

            if (markerData.onClick) {
              markerInstance.addListener('click', () => {
                markerData.onClick?.();
              });
            }

            if (markerData.content) {
              const infoWindow = new google.maps.InfoWindow({
                content: markerData.content,
              });
              markerInstance.addListener('click', () => {
                infoWindow.open(map, markerInstance);
              });
            }

            if (mounted && mapRef.current?.isConnected) {
              markersRef.current.set(markerData.id, markerInstance);
            }
          } catch (e) {
            console.error('Error adding marker:', e);
          }
        });
      }
    } catch (e) {
      console.error('Error updating markers:', e);
    }

    return () => {
      mounted = false;
    };
  }, [map, markers]);

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
