import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [lat, setLat] = useState(latitude.toString());
  const [lng, setLng] = useState(longitude.toString());

  useEffect(() => {
    setLat(latitude.toString());
    setLng(longitude.toString());
  }, [latitude, longitude]);

  const handleUpdate = () => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      toast.error("الرجاء إدخال أرقام صحيحة");
      return;
    }

    onLocationChange?.(parsedLat, parsedLng);
    toast.success("تم تحديث الموقع");
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        setLat(newLat.toString());
        setLng(newLng.toString());
        onLocationChange?.(newLat, newLng);
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
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">الموقع على الخريطة</h3>
        </div>

        <div 
          style={{ height, width: "100%" }}
          className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-border flex items-center justify-center relative overflow-hidden"
        >
          <div className="text-center p-6">
            <div className="relative inline-block">
              <MapPin className="h-20 w-20 mx-auto mb-3 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
            </div>
            <p className="text-sm font-medium text-foreground mb-2">📍 الموقع الجغرافي</p>
            <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              <p className="text-xs font-mono text-muted-foreground">
                {parseFloat(lat).toFixed(6)}°, {parseFloat(lng).toFixed(6)}°
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              استخدم الحقول أدناه لتحديد الموقع بدقة
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lat-input">خط العرض (Latitude)</Label>
            <Input
              id="lat-input"
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="30.0444"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng-input">خط الطول (Longitude)</Label>
            <Input
              id="lng-input"
              type="number"
              step="0.000001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="31.2357"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCurrentLocation}
            className="flex-1"
          >
            <Navigation className="h-4 w-4 ml-1" />
            استخدام موقعي الحالي
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleUpdate}
            className="flex-1"
          >
            <MapPin className="h-4 w-4 ml-1" />
            تحديث الموقع
          </Button>
        </div>
      </div>
    </Card>
  );
}
