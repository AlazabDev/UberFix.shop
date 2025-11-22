import { useEffect, useState, useRef, useCallback } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number, address?: string) => void;
  height?: string;
  className?: string;
}

export function InteractiveMap({
  latitude,
  longitude,
  onLocationChange,
  height = "400px",
  className = "",
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const isInitializedRef = useRef(false);
  const cleanupExecutedRef = useRef(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLng, setCurrentLng] = useState(longitude);

  // Sync props to state
  useEffect(() => {
    setCurrentLat(latitude);
    setCurrentLng(longitude);
  }, [latitude, longitude]);

  // Load Google Maps SDK
  const loadGoogleMaps = useCallback(async () => {
    if (window.google?.maps) return;
    if (document.getElementById("google-maps-sdk")) {
      // Wait for script to load
      return new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }

    try {
      const { data, error } = await supabase.functions.invoke("get-google-maps-key");
      if (error) throw error;

      const apiKey = data?.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.id = "google-maps-sdk";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Maps"));
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error("Failed to load Google Maps API key:", error);
      throw error;
    }
  }, []);

  // Initialize map ONCE ONLY
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        // Prevent double initialization
        if (isInitializedRef.current || !mapContainerRef.current) return;
        
        await loadGoogleMaps();

        if (!isMounted || !mapContainerRef.current) return;

        // Mark as initialized BEFORE creating map
        isInitializedRef.current = true;

        // Create map instance with minimal DOM manipulation
        const mapInstance = new google.maps.Map(mapContainerRef.current, {
          center: { lat: currentLat, lng: currentLng },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          disableDefaultUI: false,
        });

        // Create marker
        const markerInstance = new google.maps.Marker({
          position: { lat: currentLat, lng: currentLng },
          map: mapInstance,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        // Create geocoder
        const geocoder = new google.maps.Geocoder();

        // Store refs
        mapInstanceRef.current = mapInstance;
        markerInstanceRef.current = markerInstance;
        geocoderRef.current = geocoder;

        // Add marker dragend listener
        markerInstance.addListener("dragend", async () => {
          const pos = markerInstance.getPosition();
          if (!pos || !isMounted) return;

          const lat = pos.lat();
          const lng = pos.lng();
          
          setCurrentLat(lat);
          setCurrentLng(lng);

          try {
            const result = await geocoder.geocode({ location: { lat, lng } });
            const address = result.results[0]?.formatted_address;
            onLocationChange?.(lat, lng, address);
            toast.success("تم تحديث الموقع");
          } catch {
            onLocationChange?.(lat, lng);
          }
        });

        // Add map click listener
        mapInstance.addListener("click", async (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || !isMounted) return;

          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          markerInstance.setPosition(e.latLng);
          mapInstance.panTo(e.latLng);
          
          setCurrentLat(lat);
          setCurrentLng(lng);

          try {
            const result = await geocoder.geocode({ location: { lat, lng } });
            const address = result.results[0]?.formatted_address;
            onLocationChange?.(lat, lng, address);
            toast.success("تم تحديث الموقع");
          } catch {
            onLocationChange?.(lat, lng);
          }
        });

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Map initialization error:", error);
        if (isMounted) {
          toast.error("فشل تحميل الخريطة");
          setIsLoading(false);
        }
      }
    };

    initMap();

    // CRITICAL: Comprehensive cleanup function
    return () => {
      isMounted = false;

      // Prevent double cleanup
      if (cleanupExecutedRef.current) return;
      cleanupExecutedRef.current = true;

      try {
        // Step 1: Remove marker from map (prevents DOM manipulation after unmount)
        if (markerInstanceRef.current) {
          markerInstanceRef.current.setMap(null);
          markerInstanceRef.current = null;
        }

        // Step 2: Clear ALL map event listeners
        if (mapInstanceRef.current) {
          google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        }

        // Step 3: Clear the map div content manually
        if (mapContainerRef.current) {
          // Remove all child nodes safely
          while (mapContainerRef.current.firstChild) {
            mapContainerRef.current.removeChild(mapContainerRef.current.firstChild);
          }
        }

        // Step 4: Nullify references
        mapInstanceRef.current = null;
        geocoderRef.current = null;
        
        // Reset initialization flag
        isInitializedRef.current = false;
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };
  }, []); // EMPTY deps - run ONCE only

  // Update marker position when coordinates change
  useEffect(() => {
    if (!markerInstanceRef.current || !mapInstanceRef.current) return;
    if (!isInitializedRef.current) return;

    try {
      const newPos = { lat: currentLat, lng: currentLng };
      markerInstanceRef.current.setPosition(newPos);
      mapInstanceRef.current.panTo(newPos);
    } catch (error) {
      console.error("Error updating marker position:", error);
    }
  }, [currentLat, currentLng]);

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        const newPos = { lat: newLat, lng: newLng };

        setCurrentLat(newLat);
        setCurrentLng(newLng);

        if (markerInstanceRef.current && isInitializedRef.current) {
          try {
            markerInstanceRef.current.setPosition(newPos);
          } catch (error) {
            console.error("Error setting marker position:", error);
          }
        }
        
        if (mapInstanceRef.current && isInitializedRef.current) {
          try {
            mapInstanceRef.current.panTo(newPos);
            mapInstanceRef.current.setZoom(16);
          } catch (error) {
            console.error("Error panning map:", error);
          }
        }

        if (geocoderRef.current) {
          try {
            const result = await geocoderRef.current.geocode({ location: newPos });
            const address = result.results[0]?.formatted_address;
            onLocationChange?.(newLat, newLng, address);
          } catch {
            onLocationChange?.(newLat, newLng);
          }
        }
        
        toast.success("تم تحديد موقعك");
      },
      () => toast.error("فشل تحديد الموقع")
    );
  }, [onLocationChange]);

  return (
    <Card className={className}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">الموقع على الخريطة</h3>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleCurrentLocation}
            disabled={isLoading}
          >
            <Navigation className="h-4 w-4 ml-1" />
            موقعي الحالي
          </Button>
        </div>

        <div
          ref={mapContainerRef}
          style={{ height, width: "100%", minHeight: height }}
          className="rounded-lg border overflow-hidden relative bg-muted"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          💡 انقر على الخريطة أو اسحب العلامة لتحديد الموقع
        </p>
      </div>
    </Card>
  );
}
