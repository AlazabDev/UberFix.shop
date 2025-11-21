import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProviderCardProps {
  provider: {
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
  };
  isSelected: boolean;
  onClick: () => void;
}

export function ProviderCard({ provider, isSelected, onClick }: ProviderCardProps) {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "available":
        return "default";
      case "busy":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "available":
        return "متاح";
      case "busy":
        return "مشغول";
      default:
        return "غير متصل";
    }
  };

  const rating = provider.rating || 0;
  const fullStars = Math.floor(rating);

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        "border-2",
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border"
      )}
      onClick={onClick}
    >
      {/* رأس البطاقة */}
      <div className="flex items-start gap-3 mb-3">
        {/* الصورة الشخصية */}
        <Avatar className="h-12 w-12">
          <AvatarImage src={provider.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {provider.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* المعلومات الأساسية */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {provider.name}
            </h3>
            <Badge variant={getStatusColor(provider.status)} className="shrink-0">
              {getStatusText(provider.status)}
            </Badge>
          </div>

          {/* التخصص */}
          {provider.specialization && provider.specialization.length > 0 && (
            <p className="text-sm text-muted-foreground truncate">
              {provider.specialization.join(" • ")}
            </p>
          )}
        </div>
      </div>

      {/* التقييم */}
      {rating > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < fullStars
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">
            {rating.toFixed(1)}
          </span>
          {provider.total_reviews && provider.total_reviews > 0 && (
            <span className="text-xs text-muted-foreground">
              ({provider.total_reviews} تقييم)
            </span>
          )}
        </div>
      )}

      {/* الموقع */}
      {provider.current_latitude && provider.current_longitude && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {provider.current_latitude.toFixed(4)},{" "}
            {provider.current_longitude.toFixed(4)}
          </span>
        </div>
      )}

      {/* وقت الوصول المتوقع */}
      {provider.estimated_arrival && (
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>متاح بعد {provider.estimated_arrival}</span>
        </div>
      )}

      {/* رقم الهاتف */}
      {provider.phone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 pt-2 border-t border-border">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <a
            href={`tel:${provider.phone}`}
            className="hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {provider.phone}
          </a>
        </div>
      )}
    </Card>
  );
}
