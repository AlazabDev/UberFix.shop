import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Phone, Star, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Provider {
  id: string;
  name: string;
  avatar_url?: string | null;
  specialization: string[] | null;
  rating: number | null;
  total_reviews?: number | null;
  status: string | null;
  phone?: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  estimated_arrival?: string;
}

interface ProviderPopupProps {
  provider: Provider;
  onClose: () => void;
  onRequestService?: (providerId: string) => void;
}

export function ProviderPopup({
  provider,
  onClose,
  onRequestService,
}: ProviderPopupProps) {
  const rating = provider.rating || 0;
  const fullStars = Math.floor(rating);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="relative pb-4">
          {/* زر الإغلاق */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* معلومات المزود الأساسية */}
          <div className="flex items-start gap-4 pt-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={provider.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {provider.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground mb-1">
                {provider.name}
              </h3>

              {/* التخصص */}
              {provider.specialization && provider.specialization.length > 0 && (
                <p className="text-sm text-muted-foreground mb-2">
                  {provider.specialization.join(" • ")}
                </p>
              )}

              {/* الحالة */}
              <Badge
                variant={provider.status === "available" ? "default" : "secondary"}
              >
                {provider.status === "available" ? "متاح" : "مشغول"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* التقييم */}
          {rating > 0 && (
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < fullStars
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-foreground">
                {rating.toFixed(1)}
              </span>
              {provider.total_reviews && provider.total_reviews > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({provider.total_reviews} تقييم)
                </span>
              )}
            </div>
          )}

          {/* الموقع */}
          {provider.current_latitude && provider.current_longitude && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">الموقع</p>
                <p className="text-sm text-muted-foreground">
                  {provider.current_latitude.toFixed(4)},{" "}
                  {provider.current_longitude.toFixed(4)}
                </p>
              </div>
            </div>
          )}

          {/* وقت الوصول المتوقع */}
          {provider.estimated_arrival && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  وقت الوصول المتوقع
                </p>
                <p className="text-sm font-semibold text-primary">
                  {provider.estimated_arrival}
                </p>
              </div>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex gap-2 pt-2">
            {/* زر طلب الخدمة */}
            <Button
              className="flex-1"
              size="lg"
              onClick={() => onRequestService?.(provider.id)}
              disabled={provider.status !== "available"}
            >
              طلب الخدمة
            </Button>

            {/* زر الاتصال */}
            {provider.phone && (
              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <a href={`tel:${provider.phone}`} className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  اتصال
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
