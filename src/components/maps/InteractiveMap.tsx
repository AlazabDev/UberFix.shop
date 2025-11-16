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
          className="rounded-lg bg-muted border-2 border-dashed flex items-center justify-center relative overflow-hidden"
        >
          <div className="text-center">
            <MapPin className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">الموقع على الخريطة</p>
            <p className="text-xs text-muted-foreground">
              Lat: {parseFloat(lat).toFixed(6)}, Lng: {parseFloat(lng).toFixed(6)}
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
