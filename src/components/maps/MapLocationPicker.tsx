import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation } from 'lucide-react';
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
  label = 'إحداثيات الموقع',
  description = 'أدخل خط الطول والعرض',
  showCurrentLocation = true,
}) => {
  const [latitude, setLatitude] = useState(defaultLatitude.toString());
  const [longitude, setLongitude] = useState(defaultLongitude.toString());
  const { toast } = useToast();

  const handleLocationUpdate = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال أرقام صحيحة",
        variant: "destructive",
      });
      return;
    }
    
    onLocationSelect({ lat, lng });
    toast({
      title: "تم تحديث الموقع",
      description: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });
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
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        onLocationSelect({ lat, lng });
        toast({
          title: "تم تحديد الموقع",
          description: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "خطأ",
          description: "فشل تحديد الموقع الحالي",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {label}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">خط العرض (Latitude)</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="30.0444"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">خط الطول (Longitude)</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="31.2357"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleLocationUpdate} 
            className="flex-1"
            variant="outline"
          >
            تحديث الموقع
          </Button>
          {showCurrentLocation && (
            <Button 
              onClick={getCurrentLocation} 
              variant="outline"
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              موقعي
            </Button>
          )}
        </div>

        <div className="p-3 rounded-md bg-muted text-sm">
          <p className="font-medium mb-1">💡 نصيحة:</p>
          <p>يمكنك نسخ الإحداثيات من خرائط جوجل أو استخدام زر "موقعي" لتحديد موقعك الحالي تلقائياً</p>
        </div>
      </CardContent>
    </Card>
  );
};
