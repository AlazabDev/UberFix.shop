import React, { useState } from 'react';
import { useGoogleMap } from '@/hooks/useGoogleMap';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type?: 'vendor' | 'request' | 'user' | 'branch';
  icon?: string;
  color?: string;
  data?: any;
}

interface GoogleMapProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  markers?: MapMarker[];
  zoom?: number;
  height?: string;
  interactive?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude = 30.0444,
  longitude = 31.2357,
  onLocationSelect,
  markers = [],
  zoom = 10,
  height = '400px',
  interactive = true,
  onMarkerClick
}) => {
  const [searchValue, setSearchValue] = useState('');
  const { toast } = useToast();

  const { mapRef, isLoading, error } = useGoogleMap({
    center: { lat: latitude, lng: longitude },
    zoom,
    markers: markers.map(m => ({
      id: m.id,
      lat: m.lat,
      lng: m.lng,
      title: m.title,
      icon: m.icon,
      onClick: () => onMarkerClick?.(m),
    })),
    onMapClick: async (lat, lng) => {
      if (!interactive || !onLocationSelect) return;
      
      try {
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });
        const address = response.results[0]?.formatted_address;
        onLocationSelect(lat, lng, address);
      } catch (error) {
        console.error('Error geocoding:', error);
        onLocationSelect(lat, lng);
      }
    },
  });

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
        
        if (onLocationSelect) {
          onLocationSelect(lat, lng, response.results[0].formatted_address);
        }
        
        toast({
          title: "تم العثور على الموقع",
          description: response.results[0].formatted_address,
        });
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
        
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
        
        toast({
          title: "تم تحديد موقعك",
          description: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
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

  if (error) {
    return (
      <Card>
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
    <Card>
      <CardContent className="p-0">
        {interactive && (
          <div className="p-4 border-b space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="ابحث عن موقع..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button onClick={getCurrentLocation} size="icon" variant="outline">
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          style={{ height, width: '100%' }}
          className="relative"
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
      </CardContent>
    </Card>
  );
};
