import { Star, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TechnicianPopupProps {
  name: string;
  specialization: string;
  rating: number;
  totalReviews: number;
  status: "available" | "busy" | "soon";
  availableIn?: number; // minutes
  profileImage?: string;
  onRequestService?: () => void;
}

export const TechnicianPopup = ({
  name,
  specialization,
  rating,
  totalReviews,
  status,
  availableIn,
  profileImage,
  onRequestService,
}: TechnicianPopupProps) => {
  const getStatusText = () => {
    if (status === "available") return "متاح الآن";
    if (status === "busy") return "مشغول حالياً";
    if (status === "soon" && availableIn) return `متاح بعد ${availableIn} دقيقة`;
    return "غير متاح";
  };

  const getStatusColor = () => {
    if (status === "available") return "bg-green-100 text-green-700";
    if (status === "busy") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <Card className="min-w-[320px] shadow-xl border-2 border-primary/20 bg-card/98 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        {/* Header with Avatar */}
        <div className="flex items-start gap-3">
          <Avatar className="w-16 h-16 border-2 border-primary/30 shadow-lg">
            <AvatarImage src={profileImage} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{specialization}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground mr-1">
                ({totalReviews})
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusColor()}`}>
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>

        {/* Action Button */}
        <Button
          onClick={onRequestService}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          طلب الخدمة
        </Button>
      </CardContent>
    </Card>
  );
};
