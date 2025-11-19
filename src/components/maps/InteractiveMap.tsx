import { useEffect, useState, useRef } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface InteractiveMap {
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLng, setCurrentLng] = useState(longitude);

  useEffect(() => {
    setCurrentLat(latitude);
    setCurrentLng(longitude);
  }, [latitude, longitude]);

  useEffect(() => {
    let isMounted = true;

    const loadGoogleMaps = async (): Promise<void> => {
      if (window.google?.maps) {
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error) throw error;
        
        const apiKey = data?.apiKey || 'AIzaSyBEYvdlK9TjbO1JtHZ0F3eF5X_example';
        
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Google Maps"));
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Error fetching Maps API key:', error);
        throw error;
      }
    };

    const initMap = async () => {
      try {
        await loadGoogleMaps();
        
        if (!isMounted || !mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: currentLat, lng: currentLng },
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        const markerInstance = new google.maps.Marker({
          position: { lat: currentLat, lng: currentLng },
          map: mapInstance,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        mapInstanceRef.current = mapInstance;
        markerInstanceRef.current = markerInstance;

        markerInstance.addListener("dragend", async () => {
          if (!isMounted) return;
          const position = markerInstance.getPosition();
          if (position) {
            const lat = position.lat();
            const lng = position.lng();
            setCurrentLat(lat);
            setCurrentLng(lng);
            
            const geocoder = new google.maps.Geocoder();
            try {
              const response = await geocoder.geocode({ location: { lat, lng } });
              const address = response.results[0]?.formatted_address;
              onLocationChange?.(lat, lng, address);
              toast.success("تم تحديث الموقع");
            } catch (error) {
              onLocationChange?.(lat, lng);
              toast.success("تم تحديث الموقع");
            }
          }
        });

        mapInstance.addListener("click", async (e: google.maps.MapMouseEvent) => {
          if (!isMounted || !e.latLng) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          
          markerInstance.setPosition(e.latLng);
          mapInstance.panTo(e.latLng);
          setCurrentLat(lat);
          setCurrentLng(lng);
          
          const geocoder = new google.maps.Geocoder();
          try {
            const response = await geocoder.geocode({ location: { lat, lng } });
            const address = response.results[0]?.formatted_address;
            onLocationChange?.(lat, lng, address);
            toast.success("تم تحديث الموقع");
          } catch (error) {
            onLocationChange?.(lat, lng);
            toast.success("تم تحديث الموقع");
          }
        });

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading map:", error);
        if (isMounted) {
          toast.error("فشل تحميل الخريطة - تأكد من وجود مفتاح Google Maps");
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      
      // Cleanup without touching DOM directly
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setMap(null);
        markerInstanceRef.current = null;
      }
      
      if (mapInstanceRef.current && window.google?.maps) {
        google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when latitude/longitude props change
  useEffect(() => {
    if (markerInstanceRef.current && mapInstanceRef.current) {
      const newPos = { lat: currentLat, lng: currentLng };
      markerInstanceRef.current.setPosition(newPos);
      mapInstanceRef.current.panTo(newPos);
    }
  }, [currentLat, currentLng]);

  const handleCurrentLocation = () => {
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
        
        if (mapInstanceRef.current && markerInstanceRef.current) {
          markerInstanceRef.current.setPosition(newPos);
          mapInstanceRef.current.panTo(newPos);
          mapInstanceRef.current.setZoom(16);
        }

        // Get address from coordinates
        if (window.google) {
          const geocoder = new google.maps.Geocoder();
          try {
            const response = await geocoder.geocode({ location: newPos });
            const address = response.results[0]?.formatted_address;
            onLocationChange?.(newLat, newLng, address);
          } catch (error) {
            onLocationChange?.(newLat, newLng);
          }
        } else {
          onLocationChange?.(newLat, newLng);
        }
        
        toast.success("تم تحديد موقعك الحالي");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("فشل تحديد الموقع الحالي");
      }
    );
  };

  return (
    <Card className={className}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">الموقع على الخريطة</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCurrentLocation}
          >
            <Navigation className="h-4 w-4 ml-1" />
            موقعي الحالي
          </Button>
        </div>

        <div 
          ref={mapRef}
          style={{ height, width: "100%" }}
          className="rounded-lg border-2 border-primary/20 overflow-hidden relative"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
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
