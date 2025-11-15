import React, { useState, useEffect } from 'react';
import { useGoogleMap } from '@/hooks/useGoogleMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MapLocationPickerProps {
  defaultLatitude?: number;
  defaultLongitude?: number;
  onLocationSelect: (data: { lat: number; lng: number; address?: string }) => void;
  height?: string;
  showSearch?: boolean;
  showCurrentLocation?: boolean;
  label?: string;
  description?: string;
  defaultZoom?: number;
  className?: string;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  defaultLatitude = 30.0444,
  defaultLongitude = 31.2357,
  onLocationSelect,
  height = '400px',
  showSearch = true,
  showCurrentLocation = true,
  label = 'الموقع على الخريطة',
  description = 'اضغط على الخريطة لتحديد الموقع',
  defaultZoom = 12,
  className = ''
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(
    defaultLatitude && defaultLongitude ? { lat: defaultLatitude, lng: defaultLongitude } : null
  );
  const { toast } = useToast();

  const { mapRef, map, isLoading, error, addMarker, clearMarkers, setCenter } = useGoogleMap({
    center: { lat: defaultLatitude, lng: defaultLongitude },
    zoom: defaultZoom,
    onMapClick: async (lat, lng) => {
      handleLocationSelect(lat, lng);
    },
  });

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    
    clearMarkers();
    addMarker({
      id: 'selected-location',
      lat,
      lng,
      title: 'الموقع المحدد',
    });

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      const address = response.results[0]?.formatted_address;
      
      onLocationSelect({ lat, lng, address });
      
      toast({
        title: "تم تحديد الموقع",
        description: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    } catch (error) {
      console.error('Error geocoding:', error);
      onLocationSelect({ lat, lng });
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال عنوان للبحث",
        variant: "destructive",
      });
      return;
    }

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ address: searchValue });
      
      if (response.results && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        setCenter(lat, lng);
        handleLocationSelect(lat, lng);
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "خطأ",
        description: "فشل البحث عن الموقع",
        variant: "destructive",
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "خطأ",
        description: "المتصفح لا يدعم تحديد الموقع",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setCenter(lat, lng);
        handleLocationSelect(lat, lng);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "خطأ",
          description: "فشل الحصول على موقعك الحالي",
          variant: "destructive",
        });
      }
    );
  };

  useEffect(() => {
    if (map && selectedLocation) {
      clearMarkers();
      addMarker({
        id: 'selected-location',
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        title: 'الموقع المحدد',
      });
    }
  }, [map]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-semibold">خطأ في تحميل الخريطة</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {showSearch && (
          <div className="flex gap-2">
            <Input
              placeholder="ابحث عن موقع..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
              aria-label="البحث عن موقع على الخريطة"
            />
            <Button onClick={handleSearch} size="icon" aria-label="بحث">
              <Search className="h-4 w-4" />
            </Button>
            {showCurrentLocation && (
              <Button onClick={getCurrentLocation} size="icon" variant="outline" aria-label="استخدام الموقع الحالي">
                <Navigation className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        <div 
          ref={mapRef} 
          style={{ height, width: '100%' }}
          className="relative rounded-md overflow-hidden border"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
              </div>
            </div>
          )}
        </div>

        {selectedLocation && (
          <div className="text-sm text-muted-foreground">
            <MapPin className="inline h-4 w-4 ml-1" />
            الموقع المحدد: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
