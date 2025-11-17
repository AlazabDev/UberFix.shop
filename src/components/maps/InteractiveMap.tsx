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

        {/* خريطة تفاعلية مرئية */}
        <div 
          style={{ height, minHeight: "300px", width: "100%" }}
          className="rounded-lg border-2 border-primary/20 overflow-hidden relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5"
        >
          {/* شبكة الخريطة */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-primary/20"></div>
              ))}
            </div>
          </div>

          {/* المحتوى المركزي */}
          <div className="relative h-full min-h-[300px] flex flex-col items-center justify-center p-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <MapPin className="h-20 w-20 text-primary relative z-10 drop-shadow-2xl" />
            </div>
            
            <div className="bg-card border-2 border-primary/20 rounded-xl px-8 py-4 shadow-xl">
              <p className="text-base font-bold text-primary mb-2 text-center">📍 الموقع الحالي</p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-bold text-foreground">خط العرض:</span>
                  <span className="font-mono">{parseFloat(lat).toFixed(6)}°</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-bold text-foreground">خط الطول:</span>
                  <span className="font-mono">{parseFloat(lng).toFixed(6)}°</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-6 text-center max-w-md bg-background/50 backdrop-blur-sm rounded-lg px-4 py-2">
              📱 اضغط على زر "موقعي الحالي" لتحديد موقعك تلقائياً
            </p>
          </div>

          {/* علامات الاتجاهات */}
          <div className="absolute top-3 left-3 bg-card border border-primary/20 rounded-lg px-3 py-2 text-sm font-bold text-primary shadow-md">
            ⬆️ شمال
          </div>
        </div>
      </div>
    </Card>
  );
}
