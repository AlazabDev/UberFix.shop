import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCachedApiKey, setCachedApiKey } from '@/lib/mapsCache';
import { Label } from '@/components/ui/label';

interface MapLocationPickerProps {
  /** الموقع الافتراضي - خط العرض */
  defaultLatitude?: number;
  /** الموقع الافتراضي - خط الطول */
  defaultLongitude?: number;
  /** callback عند اختيار موقع */
  onLocationSelect: (data: { lat: number; lng: number; address?: string }) => void;
  /** ارتفاع الخريطة */
  height?: string;
  /** إظهار حقل البحث */
  showSearch?: boolean;
  /** إظهار زر الموقع الحالي */
  showCurrentLocation?: boolean;
  /** عنوان الحقل */
  label?: string;
  /** وصف تحت العنوان */
  description?: string;
  /** مستوى التكبير الافتراضي */
  defaultZoom?: number;
  /** CSS class إضافية */
  className?: string;
}

/**
 * Component موحد لاختيار الموقع من الخريطة
 * يمكن استخدامه في أي نموذج بسهولة
 */
export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  defaultLatitude = 24.7136,
  defaultLongitude = 46.6753,
  onLocationSelect,
  height = '400px',
  showSearch = true,
  showCurrentLocation = true,
  label = 'الموقع على الخريطة',
  description = 'اضغط على الخريطة لتحديد الموقع',
  defaultZoom = 12,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(
    defaultLatitude && defaultLongitude ? { lat: defaultLatitude, lng: defaultLongitude } : null
  );
  const { toast } = useToast();

  // جلب API Key
  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const cachedKey = getCachedApiKey();
      if (cachedKey) {
        setApiKey(cachedKey);
        return;
      }

      const response = await supabase.functions.invoke('get-maps-key');
      
      if (response.data && response.data.apiKey) {
        const key = response.data.apiKey;
        setCachedApiKey(key);
        setApiKey(key);
      } else {
        toast({
          title: "خطأ في تحميل الخريطة",
          description: "فشل في جلب مفتاح الخريطة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error fetching API key:', error);
    }
  };

  // تهيئة الخريطة
  useEffect(() => {
    if (!apiKey || !mapRef.current || map) return;
    initializeMap();
  }, [apiKey]);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      await loadGoogleMaps(apiKey);
      
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center: { lat: defaultLatitude, lng: defaultLongitude },
        zoom: defaultZoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      });

      // إضافة marker للموقع المحدد إذا كان موجود
      if (selectedLocation) {
        addMarker(selectedLocation.lat, selectedLocation.lng);
      }

      // عند الضغط على الخريطة
      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          handleLocationSelect(lat, lng);
        }
      });

      setMap(mapInstance);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setIsLoading(false);
      toast({
        title: "خطأ",
        description: "فشل تحميل الخريطة",
        variant: "destructive",
      });
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    addMarker(lat, lng);

    // جلب العنوان من Google Geocoding
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      
      const address = result.results[0]?.formatted_address;
      onLocationSelect({ lat, lng, address });
    } catch (error) {
      // في حالة فشل جلب العنوان، نرسل الإحداثيات فقط
      onLocationSelect({ lat, lng });
    }
  };

  const addMarker = (lat: number, lng: number) => {
    if (!map) return;

    // إزالة marker القديم
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // إضافة marker جديد
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      animation: google.maps.Animation.DROP,
      draggable: true,
    });

    // عند سحب marker
    marker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        handleLocationSelect(e.latLng.lat(), e.latLng.lng());
      }
    });

    markerRef.current = marker;
    map.setCenter({ lat, lng });
  };

  const handleSearch = async () => {
    if (!map || !searchValue.trim()) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: searchValue });

      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        handleLocationSelect(lat, lng);
        map.setZoom(15);
      } else {
        toast({
          title: "لم يتم العثور على الموقع",
          description: "حاول البحث بطريقة أخرى",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: "خطأ في البحث",
        description: "حدث خطأ أثناء البحث عن الموقع",
        variant: "destructive",
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "غير مدعوم",
        description: "المتصفح لا يدعم تحديد الموقع",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        handleLocationSelect(lat, lng);
        if (map) {
          map.setZoom(15);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "فشل تحديد الموقع",
          description: "لم نتمكن من الوصول إلى موقعك الحالي",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="space-y-1">
          <Label>{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          {/* أدوات البحث */}
          {(showSearch || showCurrentLocation) && (
            <div className="flex gap-2">
              {showSearch && (
                <div className="flex-1 flex gap-2">
                  <Input
                    type="text"
                    placeholder="ابحث عن موقع..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} size="icon" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {showCurrentLocation && (
                <Button onClick={getCurrentLocation} size="icon" variant="outline">
                  <Navigation className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* الخريطة */}
          <div className="relative rounded-lg overflow-hidden border">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                <div className="text-center space-y-2">
                  <MapPin className="h-8 w-8 animate-pulse mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
                </div>
              </div>
            )}
            
            <div 
              ref={mapRef} 
              style={{ height, width: '100%' }}
              className="bg-muted"
            />
          </div>

          {/* عرض الإحداثيات المحددة */}
          {selectedLocation && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>
                  خط العرض: {selectedLocation.lat.toFixed(6)} | 
                  خط الطول: {selectedLocation.lng.toFixed(6)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
