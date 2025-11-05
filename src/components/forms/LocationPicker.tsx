import React, { useState } from 'react';
import { GoogleMap } from '@/components/maps/GoogleMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Check } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLatitude,
  initialLongitude,
  initialAddress
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(
    initialLatitude && initialLongitude 
      ? { lat: initialLatitude, lng: initialLongitude, address: initialAddress }
      : null
  );

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setSelectedLocation({ lat, lng, address });
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.lat, selectedLocation.lng, selectedLocation.address);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          تحديد الموقع على الخريطة
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          انقر على الخريطة لتحديد الموقع أو استخدم البحث للعثور على عنوان محدد
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative" style={{ minHeight: "300px" }}>
          <GoogleMap
            latitude={selectedLocation?.lat || 30.0444}
            longitude={selectedLocation?.lng || 31.2357}
            zoom={12}
            onLocationSelect={handleLocationSelect}
            markers={selectedLocation ? [{
              id: 'selected',
              lat: selectedLocation.lat,
              lng: selectedLocation.lng,
              title: 'الموقع المحدد',
              type: 'user'
            }] : []}
            height="300px"
            interactive={true}
          />
        </div>
        
        {selectedLocation && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">الموقع المحدد:</h4>
              <p className="text-sm text-muted-foreground">
                {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
              </p>
            </div>
            
            <Button onClick={confirmLocation} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              تأكيد الموقع
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};